<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Enums\SnippetLocation;
use App\Enums\SnippetType;
use App\Enums\UserRole;
use App\Models\CodeSnippet;
use App\Models\CodeSnippetAuditLog;
use App\Models\CodeSnippetVersion;
use App\Models\Setting;
use App\Models\User;
use App\Services\CodeInjector;
use Illuminate\Contracts\Encryption\Encrypter;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * The security controls around custom code: who may change it, CSRF, what
 * may go live, where it may run and the headers that keep it out of the
 * admin panel.
 */
class CodeSnippetSecurityTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->create(['role' => UserRole::SuperAdmin]);
        CodeInjector::forget();
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Pixel',
            'type' => 'html',
            'location' => 'head',
            'code' => '<script async src="https://cdn.example.com/pixel.js"></script>',
            'priority' => 10,
            'target' => 'all',
            'target_paths' => [],
            'status' => 'published',
            'enabled' => true,
        ], $overrides);
    }

    /**
     * Every custom code endpoint, with a request that would change something.
     *
     * @return array<int, array{0: string, 1: string, 2: array<string, mixed>}>
     */
    private function endpoints(CodeSnippet $snippet, CodeSnippetVersion $version): array
    {
        return [
            ['get', '/admin/custom-code', []],
            ['get', '/admin/custom-code/create', []],
            ['get', "/admin/custom-code/{$snippet->id}/edit", []],
            ['post', '/admin/custom-code', $this->payload()],
            ['put', "/admin/custom-code/{$snippet->id}", $this->payload()],
            ['delete', "/admin/custom-code/{$snippet->id}", []],
            ['post', "/admin/custom-code/{$snippet->id}/duplicate", []],
            ['patch', "/admin/custom-code/{$snippet->id}/toggle", ['enabled' => false]],
            ['post', "/admin/custom-code/{$snippet->id}/versions/{$version->id}/restore", []],
            ['patch', '/admin/custom-code/master', ['enabled' => false]],
            ['post', '/admin/custom-code/check', ['type' => 'js', 'code' => 'x']],
        ];
    }

    public function test_every_custom_code_route_requires_a_signed_in_super_admin_and_csrf(): void
    {
        $routes = collect(Route::getRoutes()->getRoutes())->filter(fn ($route): bool => str_starts_with($route->getName() ?? '', 'admin.custom-code.'));

        $this->assertCount(11, $routes);
        $this->assertContains(PreventRequestForgery::class, app(Kernel::class)->getMiddlewareGroups()['web']);

        foreach ($routes as $route) {
            foreach (['web', 'auth', 'admin', 'super-admin'] as $required) {
                $this->assertContains($required, $route->gatherMiddleware(), "{$route->getName()} is missing {$required}.");
            }
        }
    }

    public function test_guests_editors_and_admins_cannot_touch_custom_code(): void
    {
        $snippet = CodeSnippet::factory()->create(['code' => 'window.original = 1;']);
        $version = $snippet->recordVersion('Created');

        foreach ($this->endpoints($snippet, $version) as [$method, $uri, $data]) {
            $this->{$method}($uri, $data)->assertRedirect('/admin/login');
        }

        $editor = User::factory()->create(['role' => UserRole::Editor]);

        foreach ($this->endpoints($snippet, $version) as [$method, $uri, $data]) {
            $this->actingAs($editor)->{$method}($uri, $data)->assertForbidden();
        }

        $this->assertSame('window.original = 1;', $snippet->fresh()->code);
        $this->assertDatabaseCount('code_snippets', 1);
        $this->assertTrue((bool) Setting::current()->custom_code_enabled);
        $this->assertDatabaseCount('code_snippet_audit_logs', 0);
    }

    public function test_changes_without_a_csrf_token_are_refused(): void
    {
        $this->app->singleton(PreventRequestForgery::class, fn (Application $app) => new class($app, $app->make(Encrypter::class)) extends PreventRequestForgery
        {
            protected function runningUnitTests(): bool
            {
                return false;
            }
        });

        $snippet = CodeSnippet::factory()->create(['code' => 'window.original = 1;']);
        $version = $snippet->recordVersion('Created');

        foreach ($this->endpoints($snippet, $version) as [$method, $uri, $data]) {
            if ($method === 'get') {
                continue;
            }

            $this->actingAs($this->superAdmin)->{$method}($uri, $data)->assertStatus(419);
        }

        $this->assertSame('window.original = 1;', $snippet->fresh()->code);
        $this->assertTrue($snippet->fresh()->enabled);
        $this->assertTrue((bool) Setting::current()->custom_code_enabled);
    }

    public function test_admin_pages_get_a_script_policy_that_shuts_out_custom_code(): void
    {
        $response = $this->actingAs($this->superAdmin)->get('/admin/custom-code');

        $policy = (string) $response->headers->get('Content-Security-Policy');
        preg_match("/'nonce-([^']+)'/", $policy, $nonce);

        $this->assertNotEmpty($nonce[1] ?? null);
        $this->assertStringContainsString("script-src 'self' 'nonce-", $policy);
        $this->assertStringNotContainsString('unsafe-inline', $policy);
        $this->assertStringContainsString("object-src 'none'", $policy);
        $this->assertStringContainsString("base-uri 'self'", $policy);
        $this->assertStringContainsString("frame-ancestors 'self'", $policy);
        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN')->assertHeader('X-Content-Type-Options', 'nosniff');

        // Every executable inline script the admin page itself carries is nonced.
        preg_match_all('/<script\b(?![^>]*\btype="application\/(?:json|ld\+json)")(?![^>]*\bsrc=)[^>]*>/i', $response->getContent(), $inline);
        foreach ($inline[0] as $tag) {
            $this->assertStringContainsString('nonce="'.$nonce[1].'"', $tag);
        }

        // A fresh nonce for every response.
        $this->assertNotSame($policy, (string) $this->actingAs($this->superAdmin)->get('/admin/custom-code')->headers->get('Content-Security-Policy'));
    }

    public function test_public_pages_keep_custom_code_working_and_only_pin_the_base_url(): void
    {
        CodeSnippet::factory()->create(['type' => SnippetType::Html, 'code' => '<script src="https://cdn.example.com/x.js"></script>']);

        $this->get('/')
            ->assertOk()
            ->assertHeader('Content-Security-Policy', "base-uri 'self'")
            ->assertSee('https://cdn.example.com/x.js', false);
    }

    public function test_no_custom_code_reaches_any_admin_page_by_any_route(): void
    {
        foreach (SnippetLocation::cases() as $location) {
            CodeSnippet::factory()->create(['location' => $location, 'code' => "window.siteWide_{$location->value} = 1;"]);
            CodeSnippet::factory()->only(['/admin*', '/admin/*', '*'])->create(['location' => $location, 'code' => "window.targeted_{$location->value} = 1;"]);
        }

        foreach (['/admin/login', '/admin', '/admin/custom-code', '/admin/no-such-page'] as $uri) {
            $user = $uri === '/admin/login' ? null : $this->superAdmin;
            $response = $user ? $this->actingAs($user)->get($uri) : $this->get($uri);

            $this->assertStringNotContainsString('window.siteWide_', $response->getContent(), $uri);
            $this->assertStringNotContainsString('window.targeted_', $response->getContent(), $uri);
            auth()->logout();
        }

        $this->actingAs($this->superAdmin)->get('/admin/custom-code')->assertInertia(fn ($page) => $page->where('codeSnippets', []));
    }

    public function test_snippet_names_are_never_rendered_as_markup_in_the_admin(): void
    {
        CodeSnippet::factory()->create(['name' => '</script><script>window.xss=1</script>', 'description' => '<img src=x onerror=alert(1)>']);

        $html = $this->actingAs($this->superAdmin)->get('/admin/custom-code')->assertOk()->getContent();

        // They travel only as data: inside the page's JSON block, which the
        // browser never parses as markup and which they cannot close early.
        $this->assertSame(1, preg_match('/<script data-page="app" type="application\/json">(.*?)<\/script>/s', $html, $data));
        $this->assertSame('</script><script>window.xss=1</script>', json_decode($data[1], true)['props']['snippets'][0]['name']);
        $outside = str_replace($data[0], '', $html);
        $this->assertStringNotContainsString('window.xss', $outside);
        $this->assertStringNotContainsString('onerror', $outside);
    }

    public function test_dangerous_code_cannot_be_published_but_can_be_kept_as_a_draft(): void
    {
        $cases = [
            ['html', '<base href="https://evil.example/">'],
            ['html', '<script src="http://cdn.example.com/pixel.js"></script>'],
            ['html', '<iframe src="http://embed.example.com/"></iframe>'],
            ['js', 'var s = "<!--<script>";'],
            ['js', 'alert(1)</script><script>alert(2)'],
            ['css', '</style><script>alert(1)</script>'],
        ];

        foreach ($cases as [$type, $code]) {
            $this->actingAs($this->superAdmin)
                ->post('/admin/custom-code', $this->payload(['type' => $type, 'code' => $code]))
                ->assertSessionHasErrors('code');
        }
        $this->assertDatabaseCount('code_snippets', 0);

        $this->actingAs($this->superAdmin)
            ->post('/admin/custom-code', $this->payload(['code' => '<base href="https://evil.example/">', 'status' => 'draft']))
            ->assertSessionHasNoErrors();
        $this->assertDatabaseCount('code_snippets', 1);

        $this->actingAs($this->superAdmin)
            ->post('/admin/custom-code', $this->payload(['code' => '<script async src="https://cdn.example.com/pixel.js"></script>']))
            ->assertSessionHasNoErrors();
    }

    public function test_a_snippet_failing_the_checks_cannot_be_switched_on(): void
    {
        $snippet = CodeSnippet::factory()->create([
            'type' => SnippetType::Html,
            'code' => '<script src="http://cdn.example.com/old.js"></script>',
            'enabled' => false,
        ]);

        $this->actingAs($this->superAdmin)
            ->patch("/admin/custom-code/{$snippet->id}/toggle", ['enabled' => true])
            ->assertSessionHasErrors('code');

        $this->assertFalse($snippet->fresh()->enabled);
        $this->assertDatabaseCount('code_snippet_versions', 0);
        $this->assertDatabaseCount('code_snippet_audit_logs', 0);
        $this->get('/')->assertDontSee('old.js', false);

        // Switching it off is always allowed: that is the emergency stop.
        $snippet->update(['enabled' => true]);
        $this->actingAs($this->superAdmin)
            ->patch("/admin/custom-code/{$snippet->id}/toggle", ['enabled' => false])
            ->assertSessionHasNoErrors();
        $this->assertFalse($snippet->fresh()->enabled);
    }

    public function test_a_rollback_that_would_publish_failing_code_is_refused(): void
    {
        $snippet = CodeSnippet::factory()->create(['type' => SnippetType::Html, 'code' => '<base href="https://evil.example/">', 'status' => ContentStatus::Published]);
        $bad = $snippet->recordVersion('Imported');
        $snippet->update(['code' => '<p>safe</p>']);
        $good = $snippet->recordVersion('Fixed');

        $this->actingAs($this->superAdmin)
            ->post("/admin/custom-code/{$snippet->id}/versions/{$bad->id}/restore")
            ->assertSessionHasErrors('code');
        $this->assertSame('<p>safe</p>', $snippet->fresh()->code);

        $this->actingAs($this->superAdmin)
            ->post("/admin/custom-code/{$snippet->id}/versions/{$good->id}/restore")
            ->assertSessionHasNoErrors();

        $other = CodeSnippet::factory()->create();
        $this->actingAs($this->superAdmin)
            ->post("/admin/custom-code/{$other->id}/versions/{$good->id}/restore")
            ->assertNotFound();
    }

    public function test_the_emergency_switch_takes_all_code_off_the_site_and_is_logged(): void
    {
        CodeSnippet::factory()->create(['code' => 'window.siteWide = 1;']);
        CodeSnippet::factory()->only(['/contact'])->create(['code' => 'window.pageOnly = 1;']);

        $this->actingAs($this->superAdmin)->patch('/admin/custom-code/master', ['enabled' => false])->assertSessionHasNoErrors();
        auth()->logout();

        $this->get('/')->assertDontSee('window.siteWide', false);
        $this->get('/contact')->assertInertia(fn ($page) => $page->where('codeSnippets', []));
        $this->assertSame('master_disabled', CodeSnippetAuditLog::query()->sole()->action);
        $this->assertDatabaseCount('code_snippets', 2);
    }

    public function test_the_live_check_needs_a_super_admin_and_never_runs_the_code(): void
    {
        $this->actingAs(User::factory()->create(['role' => UserRole::Editor]))
            ->postJson('/admin/custom-code/check', ['type' => 'js', 'code' => 'x'])
            ->assertForbidden();

        $this->actingAs($this->superAdmin)
            ->postJson('/admin/custom-code/check', ['type' => 'html', 'code' => '<base href="/">'])
            ->assertOk()
            ->assertJsonPath('errors.0', fn (string $error) => str_contains($error, '<base>'));
    }
}
