<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class UpdateUserRequest extends StoreUserRequest
{
    /**
     * Ignore the account being edited when checking email uniqueness.
     */
    protected function emailRule(): Unique
    {
        return Rule::unique('users', 'email')->ignore($this->route('user'));
    }
}
