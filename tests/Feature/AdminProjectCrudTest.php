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
            ->assertRedirectContains('/edit')
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
            ->assertRedirectContains('/edit');

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
            ->assertRedirectContains('/edit');

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

    public function test_an_admin_can_copy_a_project_as_a_draft(): void
    {
        $project = Project::factory()->create([
            'slug' => 'brand-refresh',
            'title' => 'Brand Refresh',
            'featured' => true,
            'status' => ContentStatus::Published,
            'case_study' => [['label' => 'Gallery', 'images' => [['src' => '/images/work/example.jpg']]]],
        ]);

        $this->actingAs($this->admin)
            ->post("/admin/projects/{$project->id}/duplicate")
            ->assertRedirectContains('/edit')
            ->assertSessionHas('success');

        $copy = Project::query()->where('id', '!=', $project->id)->sole();

        $this->assertSame('brand-refresh-copy', $copy->slug);
        $this->assertSame('Brand Refresh (Copy)', $copy->title);
        $this->assertSame(ContentStatus::Draft, $copy->status);
        $this->assertFalse($copy->featured);
        $this->assertSame($project->case_study, $copy->case_study);
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

    public function test_an_admin_can_publish_and_draft_a_project_from_the_index(): void
    {
        $project = Project::factory()->create(['status' => ContentStatus::Draft]);

        $this->get("/work/{$project->slug}")->assertNotFound();

        $this->actingAs($this->admin)
            ->patch("/admin/projects/{$project->id}/status", ['status' => 'published'])
            ->assertSessionHas('success');

        $this->assertSame(ContentStatus::Published, $project->refresh()->status);
        $this->get("/work/{$project->slug}")->assertOk();

        $this->actingAs($this->admin)
            ->patch("/admin/projects/{$project->id}/status", ['status' => 'draft'])
            ->assertSessionHas('success');

        $this->assertSame(ContentStatus::Draft, $project->refresh()->status);
        $this->get("/work/{$project->slug}")->assertNotFound();
    }

    public function test_an_invalid_inline_project_status_is_rejected(): void
    {
        $project = Project::factory()->create(['status' => ContentStatus::Draft]);

        $this->actingAs($this->admin)
            ->patch("/admin/projects/{$project->id}/status", ['status' => 'archived'])
            ->assertSessionHasErrors('status');

        $this->assertSame(ContentStatus::Draft, $project->refresh()->status);
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

    public function test_an_admin_can_set_the_portfolio_and_the_project_brief(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/projects', $this->validPayload([
                'work_group' => 'uiux',
                'brief' => [
                    'overview' => '  A full identity system.  ',
                    'worked_on' => ['Logo', '', 'Packaging'],
                    'services' => ['Brand Identity Design'],
                    'highlights' => [
                        ['label' => 'Timeline', 'value' => '6 weeks'],
                        ['label' => '', 'value' => ''],
                    ],
                    'client' => 'Acme',
                    'website' => 'https://acme.test',
                    'behance_url' => '',
                    'source_url' => '',
                ],
            ]))
            ->assertRedirectContains('/edit');

        $project = Project::query()->sole();

        $this->assertSame('uiux', $project->work_group);
        $this->assertSame('A full identity system.', $project->brief['overview']);
        $this->assertSame(['Logo', 'Packaging'], $project->brief['worked_on']);
        $this->assertSame([['label' => 'Timeline', 'value' => '6 weeks']], $project->brief['highlights']);
    }

    public function test_an_empty_brief_and_portfolio_are_stored_as_none(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/projects', $this->validPayload([
                'work_group' => '',
                'brief' => ['overview' => '', 'worked_on' => [], 'client' => ''],
            ]));

        $project = Project::query()->sole();

        $this->assertNull($project->work_group);
        $this->assertNull($project->brief);
    }

    public function test_a_typed_slug_is_saved_in_its_url_form(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/projects', $this->validPayload(['slug' => '  My New_Project  ']))
            ->assertRedirectContains('/edit');

        $this->assertSame('my-new-project', Project::query()->sole()->slug);
    }

    public function test_a_hidden_gallery_image_stays_in_the_admin_but_not_on_the_project_page(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/projects', $this->validPayload([
                'gallery_images' => [
                    ['src' => '/images/work/one.jpg', 'alt' => 'One', 'hidden' => '0'],
                    ['src' => '/images/work/two.jpg', 'alt' => 'Two', 'hidden' => '1'],
                ],
            ]))
            ->assertRedirectContains('/edit');

        $project = Project::query()->sole();

        $this->actingAs($this->admin)
            ->get("/admin/projects/{$project->id}/edit")
            ->assertInertia(fn ($page) => $page
                ->has('project.gallery_images', 2)
                ->where('project.gallery_images.1.hidden', true));

        $this->get("/work/{$project->slug}")
            ->assertInertia(fn ($page) => $page
                ->has('project.caseStudy.0.images', 1)
                ->where('project.caseStudy.0.images.0.alt', 'One'));
    }

    public function test_project_seo_reaches_the_project_page_and_falls_back_when_empty(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/projects', $this->validPayload([
                'meta_title' => 'Custom title',
                'meta_description' => 'Custom description',
                'meta_robots' => 'noindex,follow',
            ]));

        $this->get('/work/new-case-study')
            ->assertInertia(fn ($page) => $page
                ->where('project.meta.title', 'Custom title')
                ->where('project.meta.description', 'Custom description')
                ->where('project.meta.robots', 'noindex,follow'));

        Project::query()->sole()->update(['meta_title' => null, 'meta_description' => null]);

        $this->get('/work/new-case-study')
            ->assertInertia(fn ($page) => $page
                ->where('project.meta.title', 'New Case Study | Marketorr')
                ->where('project.meta.description', 'A short description of the engagement.'));
    }

    public function test_saving_a_project_stays_on_its_form(): void
    {
        $this->actingAs($this->admin)->post('/admin/projects', $this->validPayload());
        $project = Project::query()->sole();

        $this->actingAs($this->admin)
            ->put("/admin/projects/{$project->id}", $this->validPayload(['title' => 'Renamed', 'image' => null]))
            ->assertRedirect("/admin/projects/{$project->id}/edit")
            ->assertSessionHas('success');

        $this->assertSame('Renamed', $project->fresh()->title);
    }

    public function test_clearing_the_sort_order_on_edit_moves_the_project_to_the_end(): void
    {
        $this->actingAs($this->admin)->post('/admin/projects', $this->validPayload(['slug' => 'first-project']));
        $this->actingAs($this->admin)->post('/admin/projects', $this->validPayload(['slug' => 'second-project']));
        $first = Project::query()->where('slug', 'first-project')->sole();

        $this->actingAs($this->admin)
            ->put("/admin/projects/{$first->id}", $this->validPayload(['slug' => 'first-project', 'image' => null, 'sort_order' => '']))
            ->assertSessionHasNoErrors();

        $this->assertSame(
            ['second-project', 'first-project'],
            Project::query()->published()->pluck('slug')->all(),
        );
    }

    public function test_heading_size_is_saved_and_sent_to_the_project_page(): void
    {
        $this->actingAs($this->admin)->post('/admin/projects', $this->validPayload(['heading_scale' => 140]));
        $project = Project::query()->sole();

        $this->assertSame(140, $project->heading_scale);
        $this->assertSame(140, $project->toPublicArray()['headingScale']);
    }

    public function test_heading_size_must_stay_between_50_and_200(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/projects', $this->validPayload(['heading_scale' => 250]))
            ->assertSessionHasErrors('heading_scale');

        $this->actingAs($this->admin)
            ->post('/admin/projects', $this->validPayload(['heading_scale' => 20]))
            ->assertSessionHasErrors('heading_scale');
    }
}
