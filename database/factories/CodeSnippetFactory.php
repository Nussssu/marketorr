<?php

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Enums\SnippetLocation;
use App\Enums\SnippetTarget;
use App\Enums\SnippetType;
use App\Models\CodeSnippet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CodeSnippet>
 */
class CodeSnippetFactory extends Factory
{
    /**
     * Define the model's default state: a live, site-wide head script.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'type' => SnippetType::Js,
            'location' => SnippetLocation::Head,
            'code' => 'window.snippetRan = true;',
            'priority' => 10,
            'target' => SnippetTarget::All,
            'target_paths' => [],
            'status' => ContentStatus::Published,
            'enabled' => true,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (): array => ['status' => ContentStatus::Draft]);
    }

    /**
     * @param  array<int, string>  $paths
     */
    public function only(array $paths): static
    {
        return $this->state(fn (): array => ['target' => SnippetTarget::Only, 'target_paths' => $paths]);
    }
}
