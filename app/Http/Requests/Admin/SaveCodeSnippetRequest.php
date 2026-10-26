<?php

namespace App\Http\Requests\Admin;

use App\Enums\ContentStatus;
use App\Enums\SnippetLocation;
use App\Enums\SnippetTarget;
use App\Enums\SnippetType;
use App\Services\CodeSnippetValidator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Custom code runs on every page it targets, so only a super admin may save
 * it, and a snippet with errors can be kept as a draft but never published.
 */
class SaveCodeSnippetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'type' => ['required', Rule::enum(SnippetType::class)],
            'location' => ['required', Rule::enum(SnippetLocation::class)],
            'code' => ['required', 'string', 'max:100000'],
            'priority' => ['required', 'integer', 'min:0', 'max:999'],
            'target' => ['required', Rule::enum(SnippetTarget::class)],
            'target_paths' => ['nullable', 'array', 'max:50', Rule::requiredIf(fn (): bool => $this->input('target') !== SnippetTarget::All->value)],
            'target_paths.*' => ['required', 'string', 'max:255', 'regex:/^\/?[A-Za-z0-9\-_\/\*\.]*$/'],
            'status' => ['required', Rule::enum(ContentStatus::class)],
            'enabled' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'target_paths.required' => 'Add at least one page path for this targeting.',
            'target_paths.*.regex' => 'A page path may use letters, numbers, - _ / . and * only, e.g. /services/*.',
        ];
    }

    /**
     * A published snippet must pass the code checks; a draft may be saved
     * mid-edit.
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty() || $this->input('status') !== ContentStatus::Published->value) {
                    return;
                }

                $result = app(CodeSnippetValidator::class)->check(SnippetType::from($this->input('type')), (string) $this->input('code'));

                foreach ($result['errors'] as $error) {
                    $validator->errors()->add('code', $error);
                }
            },
        ];
    }

    protected function prepareForValidation(): void
    {
        $paths = collect((array) $this->input('target_paths', []))
            ->map(fn ($path): string => trim((string) $path))
            ->filter()
            ->values()
            ->all();

        $this->merge([
            // There is no type to choose: code is added as written, so full
            // <script> and <style> tags go straight in.
            'type' => SnippetType::Html->value,
            'enabled' => $this->boolean('enabled'),
            'target_paths' => $this->input('target') === SnippetTarget::All->value ? [] : $paths,
        ]);
    }
}
