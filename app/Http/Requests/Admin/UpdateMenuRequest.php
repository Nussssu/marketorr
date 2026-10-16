<?php

namespace App\Http\Requests\Admin;

use App\Enums\MenuLocation;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * The whole menu is submitted at once: the editor reorders, renames and
     * removes items in the browser, then saves the resulting tree.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:120'],
            'content' => ['nullable', 'array'],
            'content.eyebrow' => ['nullable', 'string', 'max:120'],
            'content.headline_before' => ['nullable', 'string', 'max:120'],
            'content.headline_highlight' => ['nullable', 'string', 'max:120'],
            'content.headline_after' => ['nullable', 'string', 'max:120'],
            'content.blurb' => ['nullable', 'string', 'max:500'],
            'content.all_label' => ['nullable', 'string', 'max:120'],
            'content.all_url' => ['nullable', 'string', 'max:2048'],
            'content.intro' => ['nullable', 'string', 'max:1000'],
            'content.copyright' => ['nullable', 'string', 'max:255'],
            'content.motto_items' => ['nullable', 'array', 'max:8'],
            'content.motto_items.*' => ['required', 'string', 'max:60'],
            'items' => ['present', 'array', 'max:100'],
            'items.*.label' => ['required', 'string', 'max:120'],
            'items.*.url' => ['required', 'string', 'max:2048'],
            'items.*.description' => ['nullable', 'string', 'max:255'],
            'items.*.opens_in_new_tab' => ['required', 'boolean'],
            'items.*.enabled' => ['required', 'boolean'],
            'items.*.show_on_desktop' => ['required', 'boolean'],
            'items.*.show_on_mobile' => ['required', 'boolean'],
            'items.*.children' => ['nullable', 'array', 'max:50'],
            'items.*.children.*.label' => ['required', 'string', 'max:120'],
            'items.*.children.*.url' => ['required', 'string', 'max:2048'],
            'items.*.children.*.description' => ['nullable', 'string', 'max:255'],
            'items.*.children.*.opens_in_new_tab' => ['required', 'boolean'],
            'items.*.children.*.enabled' => ['required', 'boolean'],
            'items.*.children.*.show_on_desktop' => ['required', 'boolean'],
            'items.*.children.*.show_on_mobile' => ['required', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $normalise = static fn (array $item): array => [
            ...$item,
            'description' => array_key_exists('description', $item) ? ($item['description'] ?? '') : null,
            'opens_in_new_tab' => filter_var($item['opens_in_new_tab'] ?? false, FILTER_VALIDATE_BOOL),
            'enabled' => filter_var($item['enabled'] ?? true, FILTER_VALIDATE_BOOL),
            'show_on_desktop' => filter_var($item['show_on_desktop'] ?? true, FILTER_VALIDATE_BOOL),
            'show_on_mobile' => filter_var($item['show_on_mobile'] ?? true, FILTER_VALIDATE_BOOL),
        ];

        $content = (array) $this->input('content', []);
        foreach (['eyebrow', 'headline_before', 'headline_highlight', 'headline_after', 'blurb', 'all_label', 'all_url', 'intro', 'copyright'] as $key) {
            if (array_key_exists($key, $content) && $content[$key] === null) {
                $content[$key] = '';
            }
        }
        if (array_key_exists('motto_items', $content)) {
            $content['motto_items'] = array_values(array_filter(
                (array) $content['motto_items'],
                static fn (mixed $item): bool => is_string($item) && filled($item),
            ));
        }

        $this->merge([
            'name' => $this->exists('name') ? ($this->input('name') ?? '') : (MenuLocation::tryFrom((string) $this->route('location'))?->label() ?? 'Menu'),
            'content' => $content,
            'items' => array_map(
                static fn (array $item): array => [
                    ...$normalise($item),
                    'children' => array_map($normalise, $item['children'] ?? []),
                ],
                (array) $this->input('items', []),
            ),
        ]);
    }
}
