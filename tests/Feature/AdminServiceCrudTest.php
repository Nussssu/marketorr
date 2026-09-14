<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminServiceCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    /**
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'slug' => 'growth-marketing',
            'index_label' => '05',
            'name' => 'Growth Marketing',
            'short' => 'Compounding demand, month over month.',
            'description' => 'Channel strategy, experimentation and reporting.',
            'accent' => '#507AF4',
            'accent_to' => '#1BE2EB',
            'capabilities' => ['Channel Strategy', 'Experimentation'],
            'deliverables' => ['Growth plan', 'Reporting dashboard'],
            'outcomes' => [
                ['value' => '2.4x', 'label' => 'Avg. pipeline lift'],
            ],
            'status' => 'published',
        ], $overrides);
    }

    public function test_an_admin_can_create_a_service(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/services', $this->validPayload())
            ->assertRedirect('/admin/services')
            ->assertSessionHas('success');

        $service = Service::query()->sole();

        $this->assertSame('growth-marketing', $service->slug);
        $this->assertSame(['Channel Strategy', 'Experimentation'], $service->capabilities);
        $this->assertSame([['value' => '2.4x', 'label' => 'Avg. pipeline lift']], $service->outcomes);
    }

    public function test_a_created_service_appears_on_the_public_site(): void
    {
        $this->actingAs($this->admin)->post('/admin/services', $this->validPayload());

        $this->get('/services/growth-marketing')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Services/Show')
                ->where('service.name', 'Growth Marketing')
                ->where('service.index', '05')
                ->where('service.accentTo', '#1BE2EB')
                ->has('service.outcomes', 1));
    }

    public function test_an_admin_can_update_a_service(): void
    {
        $service = Service::factory()->create();

        $this->actingAs($this->admin)
            ->put("/admin/services/{$service->id}", $this->validPayload([
                'slug' => $service->slug,
                'name' => 'Renamed Service',
            ]))
            ->assertRedirect('/admin/services');

        $this->assertSame('Renamed Service', $service->refresh()->name);
    }

    public function test_an_admin_can_soft_delete_a_service(): void
    {
        $service = Service::factory()->create();

        $this->actingAs($this->admin)
            ->delete("/admin/services/{$service->id}")
            ->assertSessionHas('success');

        $this->assertSoftDeleted($service);
        $this->get("/services/{$service->slug}")->assertStatus(404);
    }

    public function test_an_admin_can_reorder_services(): void
    {
        $first = Service::factory()->create(['sort_order' => 0]);
        $second = Service::factory()->create(['sort_order' => 1]);

        $this->actingAs($this->admin)
            ->patch('/admin/services/reorder', ['ids' => [$second->id, $first->id]])
            ->assertSessionHas('success');

        $this->assertSame(0, $second->refresh()->sort_order);
        $this->assertSame(1, $first->refresh()->sort_order);
    }

    public function test_a_duplicate_slug_is_rejected_on_create(): void
    {
        Service::factory()->create(['slug' => 'taken-slug']);

        $this->actingAs($this->admin)
            ->post('/admin/services', $this->validPayload(['slug' => 'taken-slug']))
            ->assertSessionHasErrors('slug');

        $this->assertSame(1, Service::query()->count());
    }

    public function test_a_duplicate_slug_is_rejected_on_update(): void
    {
        Service::factory()->create(['slug' => 'taken-slug']);
        $service = Service::factory()->create(['slug' => 'my-slug']);

        $this->actingAs($this->admin)
            ->put("/admin/services/{$service->id}", $this->validPayload(['slug' => 'taken-slug']))
            ->assertSessionHasErrors('slug');

        $this->assertSame('my-slug', $service->refresh()->slug);
    }

    public function test_a_service_may_keep_its_own_slug_on_update(): void
    {
        $service = Service::factory()->create(['slug' => 'my-slug']);

        $this->actingAs($this->admin)
            ->put("/admin/services/{$service->id}", $this->validPayload(['slug' => 'my-slug']))
            ->assertSessionHasNoErrors();

        $this->assertSame('my-slug', $service->refresh()->slug);
    }

    public function test_outcomes_require_both_a_value_and_a_label(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/services', $this->validPayload([
                'outcomes' => [['value' => '2.4x', 'label' => '']],
            ]))
            ->assertSessionHasErrors('outcomes.0.label');
    }

    public function test_guests_cannot_create_services(): void
    {
        $this->post('/admin/services', $this->validPayload())->assertRedirect('/admin/login');

        $this->assertSame(0, Service::query()->count());
    }
}
