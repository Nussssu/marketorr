<?php

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'slug' => Str::slug($name).'-'.fake()->unique()->randomNumber(4),
            'index_label' => str_pad((string) fake()->numberBetween(1, 9), 2, '0', STR_PAD_LEFT),
            'name' => Str::title($name),
            'short' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'accent' => fake()->randomElement(['#891FFB', '#507AF4', '#1BE2EB']),
            'accent_to' => null,
            'capabilities' => fake()->words(6),
            'deliverables' => fake()->words(4),
            'outcomes' => [
                ['value' => '2.4x', 'label' => 'Avg. conversion lift'],
                ['value' => '60+', 'label' => 'Sites launched'],
            ],
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
}
