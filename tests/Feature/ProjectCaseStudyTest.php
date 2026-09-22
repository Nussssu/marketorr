<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Project;
use App\Models\User;
use Database\Seeders\ProjectSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Covers the dedicated case-study page every Our Work project opens as: the
 * visual sequence it receives, the external write-up link, and the way both
 * degrade for a project whose story has not been written yet.
 */
class ProjectCaseStudyTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_seeded_project_receives_its_visual_sequence_and_external_link(): void
    {
        $this->seed(ProjectSeeder::class);

        $this->get('/work/sabdita-fashion')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Work/Show')
                ->where('project.title', 'Sabdita Fashion Rebranding')
                ->where('project.externalUrl', 'https://www.behance.net/gallery/184303473/Rebranding-Sabdita-Fashion')
                ->has('project.caseStudy', 7)
                ->has('project.caseStudy.0.label')
                ->has('project.caseStudy.0.images.0.src')
            );
    }

    public function test_every_case_study_image_resolves_to_a_file_that_exists(): void
    {
        $this->seed(ProjectSeeder::class);

        $project = Project::query()->where('slug', 'sabdita-fashion')->sole();
        $images = collect($project->publicCaseStudy())->flatMap(fn (array $section) => $section['images']);

        $this->assertGreaterThan(0, $images->count());

        foreach ($images as $image) {
            $this->assertStringStartsWith('/', $image['src']);
            $this->assertFileExists(
                public_path(ltrim($image['src'], '/')),
                "Case study image {$image['src']} is referenced but missing from public/.",
            );
            $this->assertNotSame('', $image['alt'], "Case study image {$image['src']} has no alt text.");
        }
    }

    public function test_a_project_without_a_case_study_still_renders_with_an_empty_sequence(): void
    {
        $project = Project::factory()->create(['case_study' => null, 'external_url' => null]);

        $this->get("/work/{$project->slug}")
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Work/Show')
                ->where('project.caseStudy', [])
                ->where('project.externalUrl', null)
            );
    }

    public function test_sections_with_no_usable_images_are_dropped_before_they_reach_the_page(): void
    {
        $project = Project::factory()->create([
            'case_study' => [
                ['label' => 'Empty', 'images' => []],
                ['label' => 'Blank source', 'images' => [['src' => '', 'alt' => 'nothing']]],
                ['label' => 'Real', 'images' => [['src' => '/images/work/sabdita/packaging.jpg', 'alt' => 'Packaging']]],
            ],
        ]);

        $sections = $project->publicCaseStudy();

        $this->assertCount(1, $sections);
        $this->assertSame('Real', $sections[0]['label']);
    }

    public function test_an_admin_can_save_and_clear_the_external_case_study_url(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create();

        $payload = [
            'slug' => 'external-linked',
            'title' => 'External Linked',
            'client' => 'Acme Co',
            'category_id' => Category::factory()->create()->id,
            'year' => '2026',
            'description' => 'A short description of the engagement.',
            'accent' => '#891FFB',
            'image' => UploadedFile::fake()->image('cover.jpg', 1200, 750),
            'image_alt' => 'External linked cover',
            'external_url' => 'https://www.behance.net/gallery/184303473/Rebranding-Sabdita-Fashion',
            'tags' => ['Branding'],
            'featured' => false,
            'status' => 'published',
        ];

        $this->actingAs($admin)->post('/admin/projects', $payload)->assertRedirect('/admin/projects');

        $project = Project::query()->sole();
        $this->assertSame($payload['external_url'], $project->external_url);

        $this->actingAs($admin)
            ->put("/admin/projects/{$project->id}", [...$payload, 'image' => null, 'external_url' => ''])
            ->assertRedirect('/admin/projects');

        $this->assertNull($project->fresh()->external_url);
    }

    public function test_a_malformed_external_case_study_url_is_rejected(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create();

        $this->actingAs($admin)
            ->post('/admin/projects', [
                'slug' => 'bad-link',
                'title' => 'Bad Link',
                'client' => 'Acme Co',
                'category_id' => Category::factory()->create()->id,
                'year' => '2026',
                'description' => 'A short description.',
                'accent' => '#891FFB',
                'image' => UploadedFile::fake()->image('cover.jpg', 1200, 750),
                'image_alt' => 'Bad link cover',
                'external_url' => 'not-a-url',
                'tags' => ['Branding'],
                'featured' => false,
                'status' => 'published',
            ])
            ->assertSessionHasErrors('external_url');
    }
}
