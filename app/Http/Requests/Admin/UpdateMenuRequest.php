<?php

namespace App\Http\Requests\Admin;

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
            'items' => ['present', 'array', 'max:100'],
            'items.*.label' => ['required', 'string', 'max:120'],
            'items.*.url' => ['required', 'string', 'max:2048'],
            'items.*.opens_in_new_tab' => ['required', 'boolean'],
            'items.*.enabled' => ['required', 'boolean'],
            'items.*.children' => ['nullable', 'array', 'max:50'],
            'items.*.children.*.label' => ['required', 'string', 'max:120'],
            'items.*.children.*.url' => ['required', 'string', 'max:2048'],
            'items.*.children.*.opens_in_new_tab' => ['required', 'boolean'],
            'items.*.children.*.enabled' => ['required', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $normalise = static fn (array $item): array => [
            ...$item,
            'opens_in_new_tab' => filter_var($item['opens_in_new_tab'] ?? false, FILTER_VALIDATE_BOOL),
            'enabled' => filter_var($item['enabled'] ?? true, FILTER_VALIDATE_BOOL),
        ];

        $this->merge([
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
