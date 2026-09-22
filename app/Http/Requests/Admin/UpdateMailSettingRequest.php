<?php

namespace App\Http\Requests\Admin;

use App\Enums\MailEncryption;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMailSettingRequest extends FormRequest
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
        $requiredWhenEnabled = $this->boolean('enabled') ? 'required' : 'nullable';

        return [
            'enabled' => ['required', 'boolean'],
            'host' => [$requiredWhenEnabled, 'string', 'max:190'],
            'port' => [$requiredWhenEnabled, 'integer', 'min:1', 'max:65535'],
            'encryption' => ['required', Rule::enum(MailEncryption::class)],
            'username' => ['nullable', 'string', 'max:190'],
            // Blank means "keep the stored password".
            'password' => ['nullable', 'string', 'max:190'],
            'from_address' => ['nullable', 'email', 'max:190'],
            'from_name' => ['nullable', 'string', 'max:190'],
            'admin_notification_email' => [
                'nullable',
                'string',
                'max:500',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (blank($value)) {
                        return;
                    }

                    $emails = array_map('trim', explode(',', (string) $value));
                    foreach ($emails as $email) {
                        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                            $fail("The {$attribute} contains an invalid email address: {$email}.");
                        }
                    }
                },
            ],
        ];
    }

    /**
     * The columns to write, omitting the password when it was left blank.
     *
     * @return array<string, mixed>
     */
    public function mailAttributes(): array
    {
        $data = $this->safe()->all();

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        return $data;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['enabled' => $this->boolean('enabled')]);
    }
}
