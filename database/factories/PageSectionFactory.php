<?php

namespace Database\Factories;

use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PageSection>
 */
class PageSectionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'page_id' => Page::factory(),
            'type' => SectionType::RichText,
            'name' => 'Text block',
            'content' => [
                'eyebrow' => 'SECTION',
                'heading' => fake()->sentence(3),
                'body' => '<p>'.fake()->paragraph().'</p>',
            ],
            'settings' => null,
            'enabled' => true,
            'sort_order' => 0,
        ];
    }

    /**
     * @param  array<string, mixed>  $content
     */
    public function ofType(SectionType $type, array $content = []): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => $type,
            'name' => $type->label(),
            'content' => [...$type->blankContent(), ...$content],
        ]);
    }

    public function disabled(): static
    {
        return $this->state(fn (array $attributes) => [
            'enabled' => false,
        ]);
    }
}
