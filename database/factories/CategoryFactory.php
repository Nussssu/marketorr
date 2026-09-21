<?php

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'parent_id' => null,
            'slug' => Str::slug($name).'-'.fake()->unique()->randomNumber(4),
            'name' => Str::title($name),
            'description' => fake()->sentence(),
            'thumbnail_path' => null,
            'accent' => fake()->randomElement(['#891FFB', '#507AF4', '#1BE2EB']),
            'status' => ContentStatus::Published,
            'sort_order' => 0,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ContentStatus::Draft,
        ]);
    }

    /**
     * A child of the given category, or of a newly made one.
     */
    public function childOf(?Category $parent = null): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => $parent?->id ?? Category::factory(),
        ]);
    }
}
