<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class UpdateServiceGroupRequest extends StoreServiceGroupRequest
{
    /**
     * Ignore the record being edited when checking slug uniqueness.
     */
    protected function slugRule(): Unique
    {
        return Rule::unique('service_groups', 'slug')->ignore($this->route('service_group'));
    }
}
