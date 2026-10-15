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
            'file' => ['nullable', 'required_without:files', 'file', 'mimes:jpg,jpeg,png,webp,gif,svg,mp4,webm,mov,pdf,doc,docx,txt,zip', 'max:20480'],
            'files' => ['nullable', 'required_without:file', 'array', 'max:20'],
            'files.*' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif,svg,mp4,webm,mov,pdf,doc,docx,txt,zip', 'max:20480'],
            'category' => ['nullable', 'string', 'max:120'],
            'usage_location' => ['nullable', 'string', 'max:190'],
            'alt_text' => ['nullable', 'string', 'max:190'],
        ];
    }
}
