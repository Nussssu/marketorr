<?php

namespace App\Http\Requests\Admin;

use App\Enums\SectionType;
use App\Services\RichTextSanitizer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePageSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(SectionType::class)],
            'name' => ['required', 'string', 'max:190'],
            'content' => ['nullable', 'array'],
            'settings' => ['nullable', 'array'],
            'enabled' => ['required', 'boolean'],
        ];
    }

    /**
     * Content is stored as-is, but keys the widget does not declare are
     * dropped so a renamed field cannot leave stale data behind.
     *
     * @return array<string, mixed>
     */
    public function sectionAttributes(): array
    {
        $type = SectionType::from($this->validated('type'));
        $allowed = array_column($type->fields(), 'name');
        $content = array_intersect_key(
            (array) $this->validated('content', []),
            array_flip($allowed),
        );

        // Rich text is rendered as HTML on the site, so only safe markup is kept.
        $sanitizer = app(RichTextSanitizer::class);

        foreach ($type->fields() as $field) {
            $name = $field['name'];

            if ($field['type'] === 'richtext' && is_string($content[$name] ?? null)) {
                $content[$name] = $sanitizer->clean($content[$name]);
            }

            if ($field['type'] === 'repeater' && is_array($content[$name] ?? null)) {
                $richItems = array_column(array_filter($field['item_fields'] ?? [], fn (array $itemField): bool => $itemField['type'] === 'richtext'), 'name');

                $content[$name] = array_map(function (mixed $item) use ($richItems, $sanitizer): mixed {
                    foreach ($richItems as $itemName) {
                        if (is_array($item) && is_string($item[$itemName] ?? null)) {
                            $item[$itemName] = $sanitizer->clean($item[$itemName]);
                        }
                    }

                    return $item;
                }, $content[$name]);
            }
        }

        return [
            'type' => $type,
            'name' => $this->validated('name'),
            'content' => [...$type->blankContent(), ...$content],
            'settings' => $this->validated('settings') ?: null,
            'enabled' => $this->validated('enabled'),
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['enabled' => $this->boolean('enabled')]);
    }
}
