<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\Project;
use App\Models\User;
use App\Services\MediaCatalogue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaCatalogueTest extends TestCase
{
    use RefreshDatabase;

    private const FOLDER = 'images/work/gallery/__media-catalogue-test__';

    protected function setUp(): void
    {
        parent::setUp();

        File::ensureDirectoryExists(public_path(self::FOLDER));
        File::ensureDirectoryExists(public_path('storage/projects'));
    }

    protected function tearDown(): void
    {
        File::deleteDirectory(public_path(self::FOLDER));
        File::delete(public_path('storage/projects/__media-catalogue-test__.png'));

        parent::tearDown();
    }

    private function image(string $relative, string $content): string
    {
        File::put(public_path($relative), $content);

        return '/'.$relative;
    }

    /**
     * @param  array<int, string>  $gallery
     */
    private function project(string $group, string $cover, array $gallery = []): Project
    {
        return Project::factory()->create([
            'work_group' => $group,
            'image_path' => $cover,
            'case_study' => [['label' => 'Project gallery', 'note' => null, 'images' => array_map(fn (string $src): array => ['src' => $src, 'alt' => 'Screen'], $gallery)]],
        ]);
    }

    public function test_images_used_by_the_portfolio_are_added_once_under_their_section(): void
    {
        $cover = $this->image(self::FOLDER.'/cover.png', 'cover-bytes');
        $screen = $this->image(self::FOLDER.'/screen.png', 'screen-bytes');
        $this->project('uiux', $cover, [$screen]);

        app(MediaCatalogue::class)->sync();
        app(MediaCatalogue::class)->sync();

        $this->assertSame(2, Media::query()->count());
        $this->assertSame(['UI/UX'], Media::query()->distinct()->pluck('category')->all());
    }

    public function test_one_file_stored_twice_is_one_entry_and_every_use_points_at_it(): void
    {
        File::put(public_path('storage/projects/__media-catalogue-test__.png'), 'same-bytes');
        $gallery = $this->image(self::FOLDER.'/01.png', 'same-bytes');
        $project = $this->project('branding', 'projects/__media-catalogue-test__.png', [$gallery]);

        $result = app(MediaCatalogue::class)->sync();

        $this->assertSame(1, Media::query()->count());
        $this->assertSame($gallery, Media::query()->value('path'));
        $this->assertSame($gallery, $project->refresh()->image_path);
        $this->assertSame(1, $result['repointed']);
    }

    public function test_an_existing_library_upload_of_a_site_file_is_merged_into_it(): void
    {
        $gallery = $this->image(self::FOLDER.'/02.png', 'upload-bytes');
        $upload = Media::query()->create([
            'filename' => 'upload.png',
            'path' => 'media/upload.png',
            'checksum' => hash('sha256', 'upload-bytes'),
            'category' => 'Fashion',
        ]);
        $this->project('branding', $gallery);

        app(MediaCatalogue::class)->sync();

        $this->assertSame(1, Media::query()->count());
        $this->assertSame($gallery, $upload->refresh()->path);
        $this->assertSame('Fashion', $upload->category);
    }

    public function test_an_upload_filed_under_a_section_shows_in_it_before_anything_uses_it(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create();

        $this->actingAs($admin)
            ->post('/admin/media', ['files' => [UploadedFile::fake()->image('new-logo.png')], 'category' => 'Branding'])
            ->assertSessionHas('success');

        $this->assertSame('Branding', Media::query()->sole()->category);

        $this->actingAs($admin)
            ->get('/admin/media?section=branding')
            ->assertInertia(fn ($page) => $page
                ->where('sections.branding', 1)
                ->where('sections.other', 0)
                ->where('groups.0.title', 'Uploaded, not used yet')
                ->where('media.data.0.filename', 'new-logo.png'));
    }

    public function test_uploading_from_a_tab_stays_on_it_and_moves_an_existing_copy_into_the_chosen_category(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create();
        $existing = Media::query()->create(['filename' => 'logo.png', 'path' => 'media/logo.png', 'checksum' => hash('sha256', 'logo-bytes'), 'category' => 'Other']);

        $this->actingAs($admin)
            ->from('/admin/media?section=uiux')
            ->post('/admin/media', ['files' => [UploadedFile::fake()->createWithContent('logo-again.png', 'logo-bytes')], 'category' => 'UI/UX', 'from_library' => true])
            ->assertRedirect('/admin/media?section=uiux')
            ->assertSessionHas('success');

        $this->assertSame(1, Media::query()->count());
        $this->assertSame('UI/UX', $existing->refresh()->category);
    }

    public function test_a_section_is_paged_and_keeps_each_projects_heading(): void
    {
        $screens = collect(range(1, 17))->map(fn (int $number): string => $this->image(self::FOLDER."/screen-{$number}.png", "screen-{$number}"))->all();
        $project = $this->project('uiux', $this->image(self::FOLDER.'/cover-paged.png', 'cover-paged'), $screens);

        $this->actingAs(User::factory()->create())
            ->get('/admin/media?section=uiux&page=2')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('media.data', 3)
                ->where('media.total', 18)
                ->where('media.last_page', 2)
                ->where('groups.0.title', $project->title)
                ->where('groups.0.total', 18)
                ->has('groups.0.ids', 3));
    }

    public function test_the_library_groups_a_section_by_project_and_lists_every_use(): void
    {
        $cover = $this->image(self::FOLDER.'/shared.png', 'shared-bytes');
        $first = $this->project('uiux', $cover, [$cover]);
        $this->project('branding', $this->image(self::FOLDER.'/other.png', 'other-bytes'));

        $this->actingAs(User::factory()->create())
            ->get('/admin/media?section=uiux')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Media/Index')
                ->where('sections.uiux', 1)
                ->where('sections.branding', 1)
                ->has('groups', 1)
                ->where('groups.0.title', $first->title)
                ->has('media.data', 1)
                ->where('media.data.0.usage_count', 2)
                ->where('media.data.0.usage_labels', ["{$first->title} · Cover", "{$first->title} · Gallery image 1"]));
    }
}
