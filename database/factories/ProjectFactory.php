<?php

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Models\Category;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->company();

        return [
            'slug' => Str::slug($title).'-'.fake()->unique()->randomNumber(4),
            'title' => $title,
            'client' => fake()->company().' · '.fake()->word(),
            'category_id' => Category::factory(),
            'year' => (string) fake()->numberBetween(2020, 2026),
            'description' => fake()->paragraph(),
            'metric' => fake()->optional()->numerify('##00%'),
            'metric_label' => 'Organic Traffic Increase',
            'accent' => fake()->randomElement(['#891FFB', '#507AF4', '#1BE2EB']),
            'image_path' => 'projects/'.fake()->uuid().'.jpg',
            'image_alt' => $title.' case study cover',
            'tags' => fake()->randomElements(['SEO', 'Branding', 'Web UI/UX', 'Growth', 'Packaging'], 3),
            'featured' => false,
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

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'featured' => true,
        ]);
    }
}
