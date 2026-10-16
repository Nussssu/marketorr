<?php

namespace App\Http\Requests\Admin\Concerns;

use Illuminate\Support\Str;

/**
 * Slugs as the public site uses them in its URLs: lowercase words joined by
 * single hyphens. Whatever the editor types ("My Page", "my_page ") is
 * turned into that form before validation, so the address saved is the
 * address the site serves.
 */
trait NormalisesSlug
{
    /** Lowercase letters and digits, words joined by single hyphens. */
    public const SLUG_PATTERN = '/^[a-z0-9]+(?:-[a-z0-9]+)*$/';

    /**
     * The submitted slug in URL form, or the input untouched when none was sent.
     *
     * @return array<string, mixed>
     */
    protected function normalisedSlug(): array
    {
        if (! $this->filled('slug') || ! is_string($this->input('slug'))) {
            return [];
        }

        return ['slug' => Str::slug($this->input('slug'))];
    }

    /**
     * @return array<string, string>
     */
    protected function slugMessages(): array
    {
        return [
            'slug.regex' => 'The slug may only use lowercase letters, numbers and hyphens.',
        ];
    }
}
