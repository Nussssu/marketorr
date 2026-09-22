<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreMediaRequest extends FormRequest
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
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif', 'max:12288'],
            'category' => ['required', 'string', 'max:120'],
            'usage_location' => ['nullable', 'string', 'max:190'],
            'alt_text' => ['nullable', 'string', 'max:190'],
        ];
    }
}
