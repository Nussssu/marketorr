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

    /**
     * Only a changed slug is checked against the services, so a record saved
     * before this rule existed can still be edited.
     */
    protected function serviceSlugRule(): Unique
    {
        return Rule::unique('services', 'slug')->whereNot('slug', $this->route('service_group')?->slug);
    }
}
