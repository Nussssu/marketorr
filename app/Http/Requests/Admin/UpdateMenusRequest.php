<?php

namespace App\Http\Requests\Admin;

use App\Enums\MenuLocation;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMenusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'menus' => ['required', 'array', 'min:1', 'max:7'],
            'menus.*.location' => ['required', 'string', 'distinct', Rule::in(MenuLocation::values())],
            'menus.*.name' => ['nullable', 'string', 'max:120'],
            'menus.*.content' => ['nullable', 'array'],
            'menus.*.content.eyebrow' => ['nullable', 'string', 'max:120'],
            'menus.*.content.headline_before' => ['nullable', 'string', 'max:120'],
            'menus.*.content.headline_highlight' => ['nullable', 'string', 'max:120'],
            'menus.*.content.headline_after' => ['nullable', 'string', 'max:120'],
            'menus.*.content.blurb' => ['nullable', 'string', 'max:500'],
            'menus.*.content.all_label' => ['nullable', 'string', 'max:120'],
            'menus.*.content.all_url' => ['nullable', 'string', 'max:2048'],
            'menus.*.content.intro' => ['nullable', 'string', 'max:1000'],
            'menus.*.content.copyright' => ['nullable', 'string', 'max:255'],
            'menus.*.content.motto_items' => ['nullable', 'array', 'max:8'],
            'menus.*.content.motto_items.*' => ['required', 'string', 'max:60'],
            'menus.*.items' => ['present', 'array', 'max:100'],
            // Existing items' ids, so items removed on save can go to the trash.
            'menus.*.items.*.id' => ['nullable', 'integer'],
            'menus.*.items.*.children.*.id' => ['nullable', 'integer'],
            'menus.*.items.*.label' => ['required', 'string', 'max:120'],
            'menus.*.items.*.url' => ['required', 'string', 'max:2048'],
            'menus.*.items.*.description' => ['nullable', 'string', 'max:255'],
            'menus.*.items.*.opens_in_new_tab' => ['required', 'boolean'],
            'menus.*.items.*.enabled' => ['required', 'boolean'],
            'menus.*.items.*.show_on_desktop' => ['required', 'boolean'],
            'menus.*.items.*.show_on_mobile' => ['required', 'boolean'],
            'menus.*.items.*.children' => ['nullable', 'array', 'max:50'],
            'menus.*.items.*.children.*.label' => ['required', 'string', 'max:120'],
            'menus.*.items.*.children.*.url' => ['required', 'string', 'max:2048'],
            'menus.*.items.*.children.*.description' => ['nullable', 'string', 'max:255'],
            'menus.*.items.*.children.*.opens_in_new_tab' => ['required', 'boolean'],
            'menus.*.items.*.children.*.enabled' => ['required', 'boolean'],
            'menus.*.items.*.children.*.show_on_desktop' => ['required', 'boolean'],
            'menus.*.items.*.children.*.show_on_mobile' => ['required', 'boolean'],
            'menus.*.items.*.children.*.sub_service_id' => ['nullable', 'integer', 'exists:sub_services,id'],
            'menus.*.items.*.children.*.project_id' => ['nullable', 'integer', Rule::exists('projects', 'id')->whereNull('deleted_at')],
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

        $this->merge([
            'menus' => array_map(
                static function (array $menu) use ($normalise): array {
                    $location = MenuLocation::tryFrom((string) ($menu['location'] ?? ''));
                    $content = (array) ($menu['content'] ?? []);
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

                    return [
                        ...$menu,
                        'name' => array_key_exists('name', $menu) ? ($menu['name'] ?? '') : ($location?->label() ?? 'Menu'),
                        'content' => $content,
                        'items' => array_map(
                            static fn (array $item): array => [
                                ...$normalise($item),
                                'children' => array_map($normalise, $item['children'] ?? []),
                            ],
                            $menu['items'] ?? [],
                        ),
                    ];
                },
                (array) $this->input('menus', []),
            ),
        ]);
    }
}
