<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class UpdateCategoryRequest extends StoreCategoryRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            // A category cannot be filed under itself.
            'parent_id' => [
                'nullable',
                'integer',
                'exists:categories,id',
                Rule::notIn([$this->route('category')?->id]),
            ],
        ];
    }

    protected function slugRule(): Unique
    {
        return parent::slugRule()->ignore($this->route('category'));
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            ...parent::messages(),
            'parent_id.not_in' => 'A category cannot be its own parent.',
        ];
    }
}
