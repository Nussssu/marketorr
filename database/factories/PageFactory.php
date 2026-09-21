<?php

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Page>
 */
class PageFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = Str::title(fake()->unique()->words(2, true));

        return [
            'slug' => Str::slug($title).'-'.fake()->unique()->randomNumber(4),
            'title' => $title,
            'status' => ContentStatus::Published,
            'is_system' => false,
            'sort_order' => 0,
            'meta_title' => null,
            'meta_description' => null,
            'meta_og_image' => null,
            'meta_robots' => 'index,follow',
            'canonical_url' => null,
            'schema_markup' => null,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ContentStatus::Draft,
        ]);
    }

    public function system(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_system' => true,
        ]);
    }
}
