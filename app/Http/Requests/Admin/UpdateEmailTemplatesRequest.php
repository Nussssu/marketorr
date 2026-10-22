<?php

namespace App\Http\Requests\Admin;

use App\Models\EmailTemplate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * Every email template saved at once, from the page's single save bar. Each
 * template follows the same rules as saving it on its own.
 */
class UpdateEmailTemplatesRequest extends FormRequest
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
            'templates' => ['required', 'array', 'min:1'],
            'templates.*.id' => ['required', 'integer', 'distinct', 'exists:email_templates,id'],
            'templates.*.subject' => ['required', 'string', 'max:190'],
            'templates.*.body_html' => ['required', 'string', 'max:50000'],
            'templates.*.enabled' => ['required', 'boolean'],
        ];
    }

    /**
     * A typo'd placeholder would ship to a customer as literal `{{ nmae }}`,
     * so the save is rejected rather than silently sending it.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $templates = EmailTemplate::query()->whereKey(collect($this->input('templates'))->pluck('id'))->get()->keyBy('id');

            foreach ((array) $this->input('templates') as $index => $input) {
                $template = $templates->get($input['id'] ?? null);

                if ($template === null) {
                    continue;
                }

                $unknown = (clone $template)
                    ->forceFill([
                        'subject' => (string) ($input['subject'] ?? ''),
                        'body_html' => (string) ($input['body_html'] ?? ''),
                    ])
                    ->unknownPlaceholders();

                if ($unknown !== []) {
                    $validator->errors()->add(
                        "templates.{$index}.body_html",
                        'Unknown placeholder(s): '.implode(', ', array_map(
                            static fn (string $token) => '{{ '.$token.' }}',
                            $unknown,
                        )),
                    );
                }
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'templates' => collect((array) $this->input('templates', []))
                ->map(fn ($template): array => [...(array) $template, 'enabled' => filter_var($template['enabled'] ?? false, FILTER_VALIDATE_BOOL)])
                ->all(),
        ]);
    }
}
