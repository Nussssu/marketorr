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

    /**
     * Only a changed slug is checked against the tabs, so a record saved
     * before this rule existed can still be edited.
     */
    protected function tabSlugRule(): Unique
    {
        return Rule::unique('service_groups', 'slug')->whereNot('slug', $this->route('service')?->slug);
    }
}
