<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class StoreUserRequest extends FormRequest
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
            'email' => ['required', 'email', 'max:190', $this->emailRule()],
            // A role slug from Admin > Users > Roles (super_admin, editor or a custom role).
            'role' => ['required', 'string', Rule::exists('admin_roles', 'slug')],
        ];
    }

    protected function emailRule(): Unique
    {
        return Rule::unique('users', 'email');
    }
}
