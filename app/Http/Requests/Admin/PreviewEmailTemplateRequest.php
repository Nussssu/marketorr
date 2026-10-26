<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * The unsaved subject and widgets the editor wants to see rendered.
 */
class PreviewEmailTemplateRequest extends FormRequest
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
            'subject' => ['nullable', 'string', 'max:190'],            ...UpdateEmailTemplateRequest::blockRules('blocks'),
        ];
    }
}
