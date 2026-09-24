<?php

namespace Database\Seeders;

use App\Models\Media;
use App\Models\Project;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class MediaSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Catalogue the Sabdita rebranding artwork and every project cover into
     * the shared media library, so the admin panel lists each file with its
     * thumbnail, category, usage and upload date.
     */
    public function run(): void
    {
        foreach ($this->sabditaSet() as [$source, $filename, $alt]) {
            $path = 'media/'.$filename;

            if (! Storage::disk('public')->exists($path) && File::exists(public_path($source))) {
                Storage::disk('public')->put($path, File::get(public_path($source)));
            }

            Media::query()->updateOrCreate(
                ['path' => $path],
                [
                    'filename' => $filename,
                    'category' => 'Rebranding',
                    'usage_location' => 'Rebranding service page',
                    'alt_text' => $alt,
                    ...$this->describe($path),
                ],
            );
        }

        foreach (Project::query()->with('category')->get() as $project) {
            if (blank($project->image_path) || str_starts_with($project->image_path, '/') || str_starts_with($project->image_path, 'http')) {
                continue;
            }

            if (! Storage::disk('public')->exists($project->image_path)) {
                continue;
            }

            Media::query()->updateOrCreate(
                ['path' => $project->image_path],
                [
                    'filename' => basename($project->image_path),
                    'category' => $project->category?->name ?? 'Work',
                    'usage_location' => 'Work case study',
                    'alt_text' => $project->image_alt,
                    ...$this->describe($project->image_path),
                ],
            );
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function describe(string $path): array
    {
        $absolute = Storage::disk('public')->path($path);
        $dimensions = @getimagesize($absolute) ?: null;

        return [
            'mime_type' => $dimensions['mime'] ?? Storage::disk('public')->mimeType($path),
            'size_bytes' => Storage::disk('public')->size($path),
            'width' => $dimensions[0] ?? null,
            'height' => $dimensions[1] ?? null,
        ];
    }

    /**
     * @return array<int, array{0: string, 1: string, 2: string}>
     */
    private function sabditaSet(): array
    {
        return [
            ['/images/work/sabdita/logo-presentation.jpg', 'sabdita-logo-presentation.jpg', 'Sabdita Fashion logo presentation'],
            ['/images/work/sabdita/about.jpg', 'sabdita-about.jpg', 'About Sabdita Fashion'],
            ['/images/work/sabdita/logo-intro-animation.gif', 'sabdita-logo-intro-animation.gif', 'Sabdita Fashion logo intro animation'],
            ['/images/work/sabdita/brand-positioning.jpg', 'sabdita-brand-positioning.jpg', 'Sabdita Fashion brand positioning'],
            ['/images/work/sabdita/logo-motion-s.webp', 'sabdita-logo-motion-s.webp', 'Sabdita Fashion S logo animation'],
            ['/images/work/sabdita/logo-animation.webp', 'sabdita-logo-animation.webp', 'Sabdita Fashion animated logo'],
            ['/images/work/sabdita/logo-explainer.jpg', 'sabdita-logo-explainer.jpg', 'Sabdita Fashion logo concept explanation'],
            ['/images/work/sabdita/logo-backgrounds.jpg', 'sabdita-logo-backgrounds.jpg', 'Sabdita Fashion logo on different backgrounds'],
            ['/images/work/sabdita/brand-messaging.jpg', 'sabdita-brand-messaging.jpg', 'Sabdita Fashion brand messaging'],
            ['/images/work/sabdita/typo-color-animation.gif', 'sabdita-typo-color-animation.gif', 'Sabdita Fashion typography and color presentation'],
            ['/images/work/sabdita/thank-you-card.jpg', 'sabdita-thank-you-card.jpg', 'Sabdita Fashion thank you card design'],
            ['/images/work/sabdita/envelope.jpg', 'sabdita-envelope.jpg', 'Sabdita Fashion envelope design'],
            ['/images/work/sabdita/packaging.jpg', 'sabdita-packaging.jpg', 'Sabdita Fashion packaging design'],
            ['/images/work/sabdita/ribbon.jpg', 'sabdita-ribbon.jpg', 'Sabdita Fashion ribbon design'],
            ['/images/work/sabdita/hangtag.jpg', 'sabdita-hangtag.jpg', 'Sabdita Fashion hangtag design'],
            ['/images/work/sabdita/billboard.jpg', 'sabdita-billboard.jpg', 'Sabdita Fashion billboard design'],
        ];
    }
}
