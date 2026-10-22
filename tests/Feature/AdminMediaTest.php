<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\GlobalBlock;
use App\Models\Media;
use App\Models\Project;
use App\Models\User;
use Database\Seeders\WebsiteMediaSeeder;
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
        foreach (range(1, 16) as $index) {
            Media::query()->create([
                'filename' => "asset-{$index}.jpg",
                'path' => "media/asset-{$index}.jpg",
                'category' => 'General',
            ]);
        }

        $this->actingAs($this->admin)
            ->get('/admin/media')
            ->assertInertia(fn (Assert $page) => $page
                ->has('media.data', 15)
                ->where('media.total', 16)
                ->where('media.last_page', 2));
    }

    public function test_guests_cannot_reach_the_media_library(): void
    {
        $this->get('/admin/media')->assertRedirect('/admin/login');
        $this->get('/admin/media/create')->assertRedirect('/admin/login');
    }

    public function test_uploading_a_file_already_in_the_library_keeps_one_entry(): void
    {
        $file = UploadedFile::fake()->createWithContent('logo.png', 'the same bytes');

        $this->actingAs($this->admin)->post('/admin/media', ['file' => $file])->assertRedirect('/admin/media');
        $first = Media::query()->sole();

        $this->actingAs($this->admin)
            ->postJson('/admin/media', ['file' => UploadedFile::fake()->createWithContent('logo-again.png', 'the same bytes')])
            ->assertCreated()
            ->assertJsonPath('medium.id', $first->id)
            ->assertJsonPath('medium.file_url', $first->fileUrl());

        $this->assertDatabaseCount('media', 1);
        $this->assertCount(1, Storage::disk('public')->files('media'));
        $this->assertNotNull($first->checksum);
    }

    public function test_the_websites_gifs_and_videos_are_listed_once_at_the_path_the_site_uses(): void
    {
        $copy = Media::query()->create([
            'filename' => 'sabdita-logo-intro-animation.gif',
            'path' => 'media/sabdita-logo-intro-animation.gif',
            'checksum' => Media::checksumOf(public_path('images/work/sabdita/logo-intro-animation.gif')),
            'category' => 'Rebranding',
        ]);

        $this->seed(WebsiteMediaSeeder::class);
        $this->seed(WebsiteMediaSeeder::class);

        $this->assertSame('/images/work/sabdita/logo-intro-animation.gif', $copy->fresh()->path);
        $this->assertSame(1, Media::query()->where('checksum', $copy->checksum)->count());
        $this->assertTrue(Media::query()->where('path', '/videos/city-online-hero.mp4')->where('mime_type', 'video/mp4')->exists());
        $this->assertTrue(Media::query()->where('path', '/images/work/gallery/dusty-vision/03.gif')->where('mime_type', 'image/gif')->exists());
        $this->assertSame(0, Media::query()->get()->groupBy('checksum')->filter(fn ($group) => $group->count() > 1)->count());
        $this->assertFalse(Media::query()->where('path', 'like', '%/opt/%')->exists());

        $this->actingAs($this->admin)->get('/admin/media?type=videos')->assertInertia(fn (Assert $page) => $page
            ->where('media.data.0.filename', 'city-online-hero.mp4')
            ->where('media.data.0.is_site_file', true));
    }

    public function test_the_library_edit_popup_saves_and_stays_on_the_library_page(): void
    {
        $medium = Media::query()->create(['filename' => 'old.jpg', 'path' => 'media/old.jpg', 'category' => 'General']);

        $this->actingAs($this->admin)
            ->from('/admin/media?type=images&page=2')
            ->put("/admin/media/{$medium->id}", [
                'from_library' => true,
                'filename' => 'new-name.jpg',
                'category' => 'Work',
                'usage_location' => 'Home hero',
                'alt_text' => 'A new description',
            ])
            ->assertRedirect('/admin/media?type=images&page=2')
            ->assertSessionHas('success', 'Media updated.');

        $medium->refresh();
        $this->assertSame('new-name.jpg', $medium->filename);
        $this->assertSame('Work', $medium->category);
        $this->assertSame('Home hero', $medium->usage_location);
        $this->assertSame('A new description', $medium->alt_text);
    }

    public function test_deleting_a_website_file_from_the_library_never_deletes_the_file(): void
    {
        $this->seed(WebsiteMediaSeeder::class);
        $medium = Media::query()->where('path', '/videos/city-online-hero.mp4')->sole();

        $this->actingAs($this->admin)->delete("/admin/media/{$medium->id}")->assertRedirect();

        $this->assertModelMissing($medium);
        $this->assertFileExists(public_path('videos/city-online-hero.mp4'));
    }
}
