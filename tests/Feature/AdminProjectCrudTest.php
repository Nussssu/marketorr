<?php

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Models\Category;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminProjectCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        $this->admin = User::factory()->create();
    }

    /**
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'slug' => 'new-case-study',
            'title' => 'New Case Study',
            'client' => 'Acme Co · Manufacturer',
            'category_id' => Category::factory()->create()->id,
            'year' => '2026',
            'description' => 'A short description of the engagement.',
            'metric' => '210%',
            'metric_label' => 'Organic Traffic Increase',
            'accent' => '#891FFB',
            'image' => UploadedFile::fake()->image('cover.jpg', 1200, 750),
            'image_alt' => 'New case study cover',
            'tags' => ['SEO', 'Growth'],
            'featured' => true,
            'status' => 'published',
        ], $overrides);
    }

    public function test_an_admin_can_create_a_project(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/projects', $this->validPayload())
            ->assertRedirect('/admin/projects')
            ->assertSessionHas('success');

        $project = Project::query()->sole();

        $this->assertSame('new-case-study', $project->slug);
        $this->assertSame(['SEO', 'Growth'], $project->tags);
        $this->assertTrue($project->featured);
        $this->assertSame(ContentStatus::Published, $project->status);
        Storage::disk('public')->assertExists($project->image_path);
    }

    public function test_a_created_project_appears_on_the_public_site(): void
    {
        $this->actingAs($this->admin)->post('/admin/projects', $this->validPayload());

        $this->get('/work/new-case-study')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Work/Show')
                ->where('project.title', 'New Case Study')
                ->where('project.metricLabel', 'Organic Traffic Increase'));
    }

    public function test_an_admin_can_update_a_project(): void
    {
        $project = Project::factory()->create(['image_path' => 'projects/old.jpg']);
        Storage::disk('public')->put('projects/old.jpg', 'original');

        $this->actingAs($this->admin)
            ->put("/admin/projects/{$project->id}", $this->validPayload([
                'slug' => $project->slug,
                'title' => 'Renamed Project',
                'image' => UploadedFile::fake()->image('replacement.jpg'),
            ]))
            ->assertRedirect('/admin/projects');

        $project->refresh();

        $this->assertSame('Renamed Project', $project->title);
        $this->assertNotSame('projects/old.jpg', $project->image_path);
        Storage::disk('public')->assertMissing('projects/old.jpg');
        Storage::disk('public')->assertExists($project->image_path);
    }

    public function test_updating_without_a_new_upload_keeps_the_existing_image(): void
    {
        $project = Project::factory()->create(['image_path' => 'projects/keep.jpg']);
        Storage::disk('public')->put('projects/keep.jpg', 'original');

        $payload = $this->validPayload(['slug' => $project->slug]);
        unset($payload['image']);

        $this->actingAs($this->admin)
            ->put("/admin/projects/{$project->id}", $payload)
            ->assertRedirect('/admin/projects');

        $this->assertSame('projects/keep.jpg', $project->refresh()->image_path);
        Storage::disk('public')->assertExists('projects/keep.jpg');
    }

    public function test_an_admin_can_soft_delete_a_project(): void
    {
        $project = Project::factory()->create();

        $this->actingAs($this->admin)
            ->delete("/admin/projects/{$project->id}")
            ->assertSessionHas('success');

        $this->assertSoftDeleted($project);
        $this->get("/work/{$project->slug}")->assertStatus(404);
    }

    public function test_an_admin_can_reorder_projects(): void
    {
        $first = Project::factory()->create(['sort_order' => 0]);
        $second = Project::factory()->create(['sort_order' => 1]);

        $this->actingAs($this->admin)
            ->patch('/admin/projects/reorder', ['ids' => [$second->id, $first->id]])
            ->assertSessionHas('success');

        $this->assertSame(0, $second->refresh()->sort_order);
        $this->assertSame(1, $first->refresh()->sort_order);
    }

    public function test_an_admin_can_toggle_the_featured_flag(): void
    {
        $project = Project::factory()->create(['featured' => false]);

        $this->actingAs($this->admin)->patch("/admin/projects/{$project->id}/featured");
        $this->assertTrue($project->refresh()->featured);

        $this->actingAs($this->admin)->patch("/admin/projects/{$project->id}/featured");
        $this->assertFalse($project->refresh()->featured);
    }

    public function test_a_duplicate_slug_is_rejected_on_create(): void
    {
        Project::factory()->create(['slug' => 'taken-slug']);

        $this->actingAs($this->admin)
            ->post('/admin/projects', $this->validPayload(['slug' => 'taken-slug']))
            ->assertSessionHasErrors('slug');

        $this->assertSame(1, Project::query()->count());
    }

    public function test_a_duplicate_slug_is_rejected_on_update(): void
    {
        Project::factory()->create(['slug' => 'taken-slug']);
        $project = Project::factory()->create(['slug' => 'my-slug']);

        $this->actingAs($this->admin)
            ->put("/admin/projects/{$project->id}", $this->validPayload(['slug' => 'taken-slug']))
            ->assertSessionHasErrors('slug');

        $this->assertSame('my-slug', $project->refresh()->slug);
    }

    public function test_a_project_may_keep_its_own_slug_on_update(): void
    {
        $project = Project::factory()->create(['slug' => 'my-slug']);

        $this->actingAs($this->admin)
            ->put("/admin/projects/{$project->id}", $this->validPayload(['slug' => 'my-slug']))
            ->assertSessionHasNoErrors();

        $this->assertSame('my-slug', $project->refresh()->slug);
    }

    public function test_an_oversized_or_wrongly_typed_upload_is_rejected(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/projects', $this->validPayload([
                'image' => UploadedFile::fake()->create('brochure.pdf', 200, 'application/pdf'),
            ]))
            ->assertSessionHasErrors('image');

        $this->actingAs($this->admin)
            ->post('/admin/projects', $this->validPayload([
                'image' => UploadedFile::fake()->image('huge.jpg')->size(5000),
            ]))
            ->assertSessionHasErrors('image');

        $this->assertSame(0, Project::query()->count());
    }

    public function test_an_invalid_accent_colour_is_rejected(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/projects', $this->validPayload(['accent' => 'purple']))
            ->assertSessionHasErrors('accent');
    }

    public function test_guests_cannot_create_projects(): void
    {
        $this->post('/admin/projects', $this->validPayload())->assertRedirect('/admin/login');

        $this->assertSame(0, Project::query()->count());
    }
}
