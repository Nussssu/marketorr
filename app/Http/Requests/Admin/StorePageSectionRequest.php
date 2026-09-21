<?php

namespace App\Http\Requests\Admin;

use App\Enums\SectionType;
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
