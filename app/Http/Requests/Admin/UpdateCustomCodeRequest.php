<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Rendered verbatim into every page's head and body, so only a super
     * admin can reach this form at all.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'head_scripts' => ['nullable', 'string', 'max:20000'],
            'body_scripts' => ['nullable', 'string', 'max:20000'],
        ];
    }
}
