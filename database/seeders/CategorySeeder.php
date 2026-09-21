<?php

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Builds the project taxonomy. The original catalogue labelled each project
 * with a compound string like `Brand Design · Identity Guidelines`; those
 * split cleanly into a parent discipline and its specialism.
 */
class CategorySeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        foreach ($this->tree() as $order => [$parentName, $children, $accent]) {
            $parent = $this->upsert($parentName, null, $order, $accent);

            foreach ($children as $childOrder => $childName) {
                $this->upsert($childName, $parent, $childOrder, $accent);
            }
        }
    }

    /**
     * Find or create a category, keyed by slug so re-seeding is idempotent.
     */
    private function upsert(string $name, ?Category $parent, int $order, string $accent): Category
    {
        $slug = Str::slug($parent ? "{$parent->name} {$name}" : $name);

        return Category::query()->updateOrCreate(
            ['slug' => $slug],
            [
                'parent_id' => $parent?->id,
                'name' => $name,
                'accent' => $accent,
                'status' => ContentStatus::Published,
                'sort_order' => $order,
            ],
        );
    }

    /**
     * @return array<int, array{0: string, 1: array<int, string>, 2: string}>
     */
    private function tree(): array
    {
        return [
            ['Brand Design', [
                'Identity Guidelines',
                'Visual Identity',
                'Fashion',
                'Minimal Logo',
                'Engineering',
                'Agro',
                'Packaging',
                'Product',
            ], '#891FFB'],
            ['Web UI/UX', [
                'Development',
            ], '#507AF4'],
            ['Web Development', [
                'E-commerce',
                'Service Site',
            ], '#507AF4'],
            ['SEO', [
                'Organic Growth',
                'Content Strategy',
            ], '#1BE2EB'],
            ['Paid Ads', [
                'Facebook Campaigns',
            ], '#1BE2EB'],
        ];
    }
}
