<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    #[DataProvider('guardedRoutesProvider')]
    public function test_guests_are_redirected_to_the_login_page(string $route): void
    {
        $this->get($route)->assertRedirect('/admin/login');
    }

    /**
     * @return array<string, array<int, string>>
     */
    public static function guardedRoutesProvider(): array
    {
        return [
            'dashboard' => ['/admin'],
            'projects' => ['/admin/projects'],
            'project create' => ['/admin/projects/create'],
            'services' => ['/admin/services'],
            'inquiries' => ['/admin/inquiries'],
            'settings' => ['/admin/settings'],
            'users' => ['/admin/users'],
        ];
    }

    public function test_the_login_page_is_reachable_by_guests(): void
    {
        $this->get('/admin/login')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('Admin/Auth/Login'));
    }

    public function test_there_is_no_public_registration_route(): void
    {
        $this->get('/register')->assertStatus(404);

        // Asserted against the route table rather than a status code: the CMS
        // fallback route answers every unmatched GET, so an unrouted POST now
        // reports a method mismatch instead of a 404.
        $this->assertTrue(
            collect(Route::getRoutes()->getRoutes())
                ->reject(fn ($route) => $route->isFallback)
                ->every(fn ($route) => ! str_contains($route->uri(), 'register')),
            'A registration route is registered.',
        );
    }

    public function test_an_admin_can_log_in(): void
    {
        $admin = User::factory()->create(['password' => 'secret-password']);

        $this->post('/admin/login', [
            'email' => $admin->email,
            'password' => 'secret-password',
        ])->assertRedirect('/admin');

        $this->assertAuthenticatedAs($admin);
    }

    public function test_logging_in_with_a_wrong_password_fails(): void
    {
        $admin = User::factory()->create(['password' => 'secret-password']);

        $this->from('/admin/login')->post('/admin/login', [
            'email' => $admin->email,
            'password' => 'wrong-password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_login_attempts_are_rate_limited(): void
    {
        $admin = User::factory()->create(['password' => 'secret-password']);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->post('/admin/login', ['email' => $admin->email, 'password' => 'wrong']);
        }

        $this->post('/admin/login', ['email' => $admin->email, 'password' => 'wrong'])
            ->assertStatus(429);
    }

    public function test_an_admin_can_log_out(): void
    {
        $this->actingAs(User::factory()->create())
            ->post('/admin/logout')
            ->assertRedirect('/admin/login');

        $this->assertGuest();
    }

    public function test_the_dashboard_renders_for_an_authenticated_admin(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/admin')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->has('stats')
                ->has('recentInquiries'));
    }

    #[DataProvider('superAdminOnlyRoutesProvider')]
    public function test_editors_cannot_reach_super_admin_areas(string $route): void
    {
        $this->actingAs(User::factory()->editor()->create())
            ->get($route)
            ->assertStatus(403);
    }

    /**
     * @return array<string, array<int, string>>
     */
    public static function superAdminOnlyRoutesProvider(): array
    {
        return [
            'settings' => ['/admin/settings'],
            'users' => ['/admin/users'],
        ];
    }

    public function test_editors_can_reach_content_areas(): void
    {
        $editor = User::factory()->editor()->create();

        $this->actingAs($editor)->get('/admin/projects')->assertStatus(200);
        $this->actingAs($editor)->get('/admin/services')->assertStatus(200);
        $this->actingAs($editor)->get('/admin/inquiries')->assertStatus(200);
    }
}
