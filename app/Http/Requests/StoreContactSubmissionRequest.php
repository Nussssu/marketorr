<?php

namespace App\Http\Requests;

use App\Enums\InquiryType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:60'],
            'company' => ['nullable', 'string', 'max:190'],
            'type' => ['required', 'string', Rule::in(InquiryType::values())],
            'budget' => ['nullable', 'string', 'max:120'],
            'message' => ['required', 'string', 'max:5000'],
            // Honeypot: a real visitor never sees this field, so any value is a bot.
            'nickname' => ['prohibited'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nickname.prohibited' => 'Your submission could not be processed.',
        ];
    }

    /**
     * The validated payload minus the honeypot, stamped with the page the
     * form was submitted from so the inbox can attribute the lead.
     *
     * @return array<string, mixed>
     */
    public function inquiryData(): array
    {
        return [
            ...collect($this->validated())->except('nickname')->all(),
            'source_page' => $this->sourcePage(),
        ];
    }

    /**
     * The path of the page holding the form, taken from the referrer because
     * the POST itself always lands on `/contact`.
     */
    private function sourcePage(): string
    {
        $referer = $this->headers->get('referer');

        if (blank($referer)) {
            return '/contact';
        }

        return parse_url($referer, PHP_URL_PATH) ?: '/contact';
    }
}
