<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class UpdateServiceRequest extends StoreServiceRequest
{
    /**
     * Ignore the record being edited when checking slug uniqueness.
     */
    protected function slugRule(): Unique
    {
        return Rule::unique('services', 'slug')->ignore($this->route('service'));
    }
}
