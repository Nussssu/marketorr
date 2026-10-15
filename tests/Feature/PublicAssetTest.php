<?php

namespace Tests\Feature;

use App\Services\PublicAsset;
use Database\Seeders\SettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class PublicAssetTest extends TestCase
{
    use RefreshDatabase;

    /** A throwaway tree under public/images, removed after each test. */
    private string $directory = 'images/__public-asset-test';

    protected function tearDown(): void
    {
        File::deleteDirectory(public_path($this->directory));
        File::deleteDirectory(public_path('images/opt/__public-asset-test'));
        File::deleteDirectory(public_path('images/opt/thumbs/__public-asset-test'));

        parent::tearDown();
    }

    public function test_paths_are_built_on_the_path_of_app_url(): void
    {
        config(['app.url' => 'https://marketorr.com', 'app.asset_url' => null]);
        $this->assertSame('/images/logo/mark.png', PublicAsset::url('/images/logo/mark.png'));
        $this->assertSame('/storage/projects/a.jpg', PublicAsset::url('projects/a.jpg'));

        config(['app.url' => 'https://example.com/site/']);
        $this->assertSame('/site/images/logo/mark.png', PublicAsset::url('/images/logo/mark.png'));
    }

    public function test_an_asset_url_is_used_in_full_when_set(): void
    {
        config(['app.url' => 'https://marketorr.com', 'app.asset_url' => 'https://cdn.example.com/']);

        $this->assertSame('https://cdn.example.com/images/logo/mark.png', PublicAsset::url('/images/logo/mark.png'));
    }

    public function test_absolute_and_empty_values_pass_through(): void
    {
        $this->assertSame('https://example.com/a.png', PublicAsset::url('https://example.com/a.png'));
        $this->assertNull(PublicAsset::url(null));
        $this->assertSame('', PublicAsset::url(''));
    }

    public function test_an_image_is_swapped_for_its_optimized_copy_only_when_one_exists(): void
    {
        $this->touchFile($this->directory.'/cover.png');
        $this->touchFile($this->directory.'/plain.png');
        $this->touchFile('images/opt/__public-asset-test/cover.png.webp');

        $this->assertSame(PublicAsset::to('images/opt/__public-asset-test/cover.png.webp'), PublicAsset::url('/'.$this->directory.'/cover.png'));
        $this->assertTrue(PublicAsset::hasOptimized('/'.$this->directory.'/cover.png'));

        $this->assertSame(PublicAsset::to($this->directory.'/plain.png'), PublicAsset::url('/'.$this->directory.'/plain.png'));
        $this->assertFalse(PublicAsset::hasOptimized('/'.$this->directory.'/plain.png'));
    }

    public function test_a_thumbnail_falls_back_to_the_optimized_copy_and_then_the_original(): void
    {
        $this->touchFile($this->directory.'/a.jpg');
        $this->touchFile($this->directory.'/b.jpg');
        $this->touchFile($this->directory.'/c.jpg');
        $this->touchFile('images/opt/thumbs/__public-asset-test/a.jpg.webp');
        $this->touchFile('images/opt/__public-asset-test/b.jpg.webp');

        $this->assertSame(PublicAsset::to('images/opt/thumbs/__public-asset-test/a.jpg.webp'), PublicAsset::thumb('/'.$this->directory.'/a.jpg'));
        $this->assertSame(PublicAsset::to('images/opt/__public-asset-test/b.jpg.webp'), PublicAsset::thumb('/'.$this->directory.'/b.jpg'));
        $this->assertSame(PublicAsset::to($this->directory.'/c.jpg'), PublicAsset::thumb('/'.$this->directory.'/c.jpg'));
    }

    public function test_pages_receive_the_asset_base_for_front_end_paths(): void
    {
        $this->seed(SettingSeeder::class);

        $this->get('/')->assertInertia(fn ($page) => $page->where('assetBase', PublicAsset::base()));
    }

    private function touchFile(string $relative): void
    {
        $path = public_path($relative);
        File::ensureDirectoryExists(dirname($path));
        File::put($path, 'x');
    }
}
