<?php

namespace App\Http\Requests\Admin;

use App\Models\EmailTemplate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateEmailTemplateRequest extends FormRequest
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
            'subject' => ['required', 'string', 'max:190'],
            'body_html' => ['required', 'string', 'max:50000'],
            'enabled' => ['required', 'boolean'],
        ];
    }

    /**
     * A typo'd placeholder would ship to a customer as literal `{{ nmae }}`,
     * so the save is rejected rather than silently sending it.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $template = $this->route('template');

            if (! $template instanceof EmailTemplate || $validator->errors()->isNotEmpty()) {
                return;
            }

            $unknown = (clone $template)
                ->forceFill([
                    'subject' => (string) $this->input('subject'),
                    'body_html' => (string) $this->input('body_html'),
                ])
                ->unknownPlaceholders();

            if ($unknown !== []) {
                $validator->errors()->add(
                    'body_html',
                    'Unknown placeholder(s): '.implode(', ', array_map(
                        static fn (string $token) => '{{ '.$token.' }}',
                        $unknown,
                    )),
                );
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['enabled' => $this->boolean('enabled')]);
    }
}
