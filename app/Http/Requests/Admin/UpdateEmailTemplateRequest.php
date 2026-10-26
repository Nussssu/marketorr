<?php

namespace App\Http\Requests\Admin;

use App\Enums\EmailWidget;
use App\Models\EmailTemplate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
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
            'enabled' => ['required', 'boolean'],
            ...self::blockRules('blocks'),
        ];
    }

    /**
     * Rules for a template's widget list, under the given key.
     *
     * @return array<string, array<int, mixed>>
     */
    public static function blockRules(string $key): array
    {
        return [
            $key => ['required', 'array', 'min:1', 'max:40'],
            "{$key}.*" => ['array'],
            "{$key}.*.type" => ['required', 'string', Rule::in(EmailWidget::values())],
            "{$key}.*.text" => ['nullable', 'string', 'max:10000'],
            "{$key}.*.label" => ['nullable', 'string', 'max:190'],
            "{$key}.*.url" => ['nullable', 'string', 'max:2000'],
            "{$key}.*.html" => ['nullable', 'string', 'max:50000'],
            "{$key}.*.src" => ['nullable', 'string', 'max:2000'],
            "{$key}.*.alt" => ['nullable', 'string', 'max:190'],
            "{$key}.*.link" => ['nullable', 'string', 'max:2000'],
            "{$key}.*.width" => ['nullable', 'integer', 'min:0', 'max:600'],
            "{$key}.*.rows" => ['nullable', 'array', 'max:30'],
            "{$key}.*.rows.*.label" => ['nullable', 'string', 'max:190'],
            "{$key}.*.rows.*.value" => ['nullable', 'string', 'max:2000'],
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
                    'blocks' => (array) $this->input('blocks'),
                ])
                ->unknownPlaceholders();

            if ($unknown !== []) {
                $validator->errors()->add(
                    'blocks',
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
