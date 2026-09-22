<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
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

    public function test_guests_cannot_reach_the_media_library(): void
    {
        $this->get('/admin/media')->assertRedirect('/admin/login');
        $this->get('/admin/media/create')->assertRedirect('/admin/login');
    }
}
