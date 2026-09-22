<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class FetchMediaRequest extends FormRequest
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
            'url' => ['required', 'url', 'max:2000', 'regex:/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i'],
            'category' => ['required', 'string', 'max:120'],
            'usage_location' => ['nullable', 'string', 'max:190'],
            'alt_text' => ['nullable', 'string', 'max:190'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'url.regex' => 'The URL must point directly to a JPG, PNG, WebP or GIF file.',
        ];
    }
}
