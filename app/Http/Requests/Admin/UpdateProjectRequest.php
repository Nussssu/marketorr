<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class UpdateProjectRequest extends StoreProjectRequest
{
    /**
     * Ignore the record being edited when checking slug uniqueness.
     */
    protected function slugRule(): Unique
    {
        return Rule::unique('projects', 'slug')->ignore($this->route('project'));
    }

    /**
     * Leaving the upload empty keeps the existing cover image.
     */
    protected function imageRequirement(): string
    {
        return 'nullable';
    }
}
