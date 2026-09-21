<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rules\Unique;

class UpdatePageRequest extends StorePageRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $rules = parent::rules();

        // System pages back a hand-built route, so their slug is locked.
        if ($this->route('page')?->is_system) {
            $rules['slug'] = ['nullable'];
        }

        return $rules;
    }

    protected function slugRule(): Unique
    {
        return parent::slugRule()->ignore($this->route('page'));
    }

    /**
     * @return array<string, mixed>
     */
    public function pageAttributes(): array
    {
        $data = parent::pageAttributes();

        if ($this->route('page')?->is_system) {
            unset($data['slug']);
        }

        return $data;
    }
}
