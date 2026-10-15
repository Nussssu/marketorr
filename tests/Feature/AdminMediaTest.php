<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\GlobalBlock;
use App\Models\Media;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminMediaTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        $this->admin = User::factory()->create();
    }

    public function test_an_admin_can_upload_media_with_a_catalogue_entry(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/media', [
                'file' => UploadedFile::fake()->image('cover.jpg', 1200, 800),
                'category' => 'Rebranding',
                'usage_location' => 'Rebranding service page',
                'alt_text' => 'Cover artwork',
            ])
            ->assertRedirect('/admin/media');

        $medium = Media::query()->first();

        $this->assertSame('cover.jpg', $medium->filename);
        $this->assertSame('Rebranding', $medium->category);
        $this->assertSame(1200, $medium->width);
        $this->assertSame(800, $medium->height);
        Storage::disk('public')->assertExists($medium->path);
    }

    public function test_an_admin_can_drop_and_upload_multiple_images(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/media', [
                'files' => [
                    UploadedFile::fake()->image('first.jpg'),
                    UploadedFile::fake()->image('second.png'),
                ],
                'category' => 'General',
            ])
            ->assertRedirect('/admin/media');

        $this->assertDatabaseCount('media', 2);
        Storage::disk('public')->assertExists(Media::query()->where('filename', 'first.jpg')->firstOrFail()->path);
        Storage::disk('public')->assertExists(Media::query()->where('filename', 'second.png')->firstOrFail()->path);
    }

    public function test_an_admin_can_fetch_media_from_a_url(): void
    {
        Http::fake([
            '*' => Http::response('fake-image-bytes', 200, ['Content-Type' => 'image/jpeg']),
        ]);

        $this->actingAs($this->admin)
            ->post('/admin/media/fetch', [
                'url' => 'https://example.com/remote.jpg',
                'category' => 'Rebranding',
                'usage_location' => 'Rebranding service page',
            ])
            ->assertRedirect('/admin/media');

        $medium = Media::query()->first();

        $this->assertSame('remote.jpg', $medium->filename);
        $this->assertSame('Rebranding', $medium->category);
        Storage::disk('public')->assertExists($medium->path);
    }

    public function test_fetch_rejects_non_image_urls(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/media/fetch', [
                'url' => 'https://example.com/page.html',
                'category' => 'Rebranding',
            ])
            ->assertSessionHasErrors('url');

        $this->assertSame(0, Media::query()->count());
    }

    public function test_an_admin_can_replace_a_file_and_delete_the_record_with_its_file(): void
    {
        Storage::disk('public')->put('media/old.jpg', 'old-bytes');
        $medium = Media::query()->create([
            'filename' => 'old.jpg',
            'path' => 'media/old.jpg',
            'category' => 'Rebranding',
        ]);

        $this->actingAs($this->admin)
            ->put("/admin/media/{$medium->id}", [
                'category' => 'Branding',
                'file' => UploadedFile::fake()->image('replacement.jpg'),
            ])
            ->assertRedirect('/admin/media');

        $fresh = $medium->fresh();

        $this->assertSame('Branding', $fresh->category);
        $this->assertSame('replacement.jpg', $fresh->filename);
        Storage::disk('public')->assertMissing('media/old.jpg');
        Storage::disk('public')->assertExists($fresh->path);

        $this->actingAs($this->admin)
            ->delete("/admin/media/{$medium->id}")
            ->assertRedirect();

        $this->assertSame(0, Media::query()->count());
        Storage::disk('public')->assertMissing($fresh->path);
    }

    public function test_the_library_filters_by_kind_and_lists_images_gifs_videos_then_documents(): void
    {
        foreach ([
            ['brief.pdf', 'application/pdf'],
            ['reel.mp4', 'video/mp4'],
            ['loop.gif', 'image/gif'],
            ['cover.jpg', 'image/jpeg'],
        ] as [$filename, $mime]) {
            Media::query()->create([
                'filename' => $filename,
                'path' => 'media/'.$filename,
                'mime_type' => $mime,
                'size_bytes' => 1024,
                'category' => 'General',
            ]);
        }

        $this->actingAs($this->admin)
            ->get('/admin/media')
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.type', 'all')
                ->where('media.data.0.filename', 'cover.jpg')
                ->where('media.data.1.filename', 'loop.gif')
                ->where('media.data.2.filename', 'reel.mp4')
                ->where('media.data.3.filename', 'brief.pdf'));

        foreach (['images' => 'cover.jpg', 'gif' => 'loop.gif', 'videos' => 'reel.mp4', 'documents' => 'brief.pdf'] as $type => $filename) {
            $this->actingAs($this->admin)
                ->get("/admin/media?type={$type}")
                ->assertInertia(fn (Assert $page) => $page
                    ->where('filters.type', $type)
                    ->has('media.data', 1)
                    ->where('media.data.0.filename', $filename));
        }
    }

    public function test_an_admin_can_upload_a_video_without_choosing_a_category(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/media', [
                'files' => [UploadedFile::fake()->create('reel.mp4', 512, 'video/mp4')],
            ])
            ->assertRedirect('/admin/media');

        $medium = Media::query()->sole();
        $this->assertSame('reel.mp4', $medium->filename);
        $this->assertSame('General', $medium->category);
    }

    public function test_the_library_reports_and_filters_cms_media_usage(): void
    {
        $productMedia = Media::query()->create([
            'filename' => 'product.jpg',
            'path' => 'media/product.jpg',
            'mime_type' => 'image/jpeg',
            'size_bytes' => 1024,
            'category' => 'General',
        ]);
        Media::query()->create([
            'filename' => 'category.jpg',
            'path' => 'media/category.jpg',
            'mime_type' => 'image/jpeg',
            'size_bytes' => 2048,
            'category' => 'General',
        ]);
        Media::query()->create([
            'filename' => 'banner.jpg',
            'path' => 'media/banner.jpg',
            'mime_type' => 'image/jpeg',
            'size_bytes' => 4096,
            'category' => 'General',
        ]);

        Project::factory()->create(['image_path' => $productMedia->path]);
        Category::factory()->create(['thumbnail_path' => 'media/category.jpg']);
        GlobalBlock::query()->create([
            'key' => 'home_banner',
            'name' => 'Home banner',
            'type' => 'banner',
            'content' => ['image' => '/storage/media/banner.jpg'],
            'enabled' => true,
        ]);

        $this->actingAs($this->admin)
            ->get('/admin/media?usage=products')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Media/Index')
                ->where('stats.total_files', 3)
                ->where('stats.storage_used', '7 KB')
                ->where('stats.images', 3)
                ->where('stats.used_in_products', 1)
                ->where('filters.usage', 'products')
                ->has('media.data', 1)
                ->where('media.data.0.filename', 'product.jpg')
                ->where('media.data.0.usage_groups.0', 'products'));

        $this->actingAs($this->admin)
            ->get('/admin/media?usage=categories')
            ->assertInertia(fn (Assert $page) => $page
                ->has('media.data', 1)
                ->where('media.data.0.filename', 'category.jpg'));

        $this->actingAs($this->admin)
            ->get('/admin/media?usage=banners')
            ->assertInertia(fn (Assert $page) => $page
                ->has('media.data', 1)
                ->where('media.data.0.filename', 'banner.jpg'));
    }

    public function test_an_admin_can_rename_media_without_changing_its_storage_path(): void
    {
        $medium = Media::query()->create([
            'filename' => 'old-name.jpg',
            'path' => 'media/stable-path.jpg',
            'category' => 'Products',
        ]);

        $this->actingAs($this->admin)
            ->put("/admin/media/{$medium->id}", [
                'filename' => 'new-name.jpg',
                'category' => 'Products',
            ])
            ->assertRedirect('/admin/media');

        $this->assertDatabaseHas('media', [
            'id' => $medium->id,
            'filename' => 'new-name.jpg',
            'path' => 'media/stable-path.jpg',
        ]);
    }

    public function test_the_media_grid_is_paginated(): void
    {
        foreach (range(1, 13) as $index) {
            Media::query()->create([
                'filename' => "asset-{$index}.jpg",
                'path' => "media/asset-{$index}.jpg",
                'category' => 'General',
            ]);
        }

        $this->actingAs($this->admin)
            ->get('/admin/media')
            ->assertInertia(fn (Assert $page) => $page
                ->has('media.data', 12)
                ->where('media.total', 13)
                ->where('media.last_page', 2));
    }

    public function test_guests_cannot_reach_the_media_library(): void
    {
        $this->get('/admin/media')->assertRedirect('/admin/login');
        $this->get('/admin/media/create')->assertRedirect('/admin/login');
    }
}
