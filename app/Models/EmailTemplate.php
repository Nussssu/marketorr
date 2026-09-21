<?php

namespace App\Models;

use App\Enums\EmailTemplateKey;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

#[Fillable(['key', 'name', 'subject', 'body_html', 'enabled'])]
class EmailTemplate extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'key' => EmailTemplateKey::class,
            'enabled' => 'boolean',
        ];
    }

    /**
     * The stored template for a key, created from its defaults on first use
     * so a fresh install still sends well-formed mail.
     */
    public static function forKey(EmailTemplateKey $key): self
    {
        return self::query()->firstOrCreate(
            ['key' => $key],
            [
                'name' => $key->label(),
                'enabled' => true,
                ...$key->defaults(),
            ],
        );
    }

    /**
     * Substitute `{{ placeholder }}` tokens. Values are escaped, because the
     * body is rendered as HTML and the data comes from a public form.
     *
     * @param  array<string, string|null>  $data
     */
    public function renderSubject(array $data): string
    {
        return $this->substitute($this->subject, $data, escape: false);
    }

    /**
     * @param  array<string, string|null>  $data
     */
    public function renderBody(array $data): string
    {
        return $this->substitute($this->body_html, $data, escape: true);
    }

    /**
     * @param  array<string, string|null>  $data
     */
    private function substitute(string $template, array $data, bool $escape): string
    {
        return preg_replace_callback(
            '/\{\{\s*([a-z_]+)\s*\}\}/i',
            function (array $matches) use ($data, $escape): string {
                if (! array_key_exists($matches[1], $data)) {
                    return $matches[0];
                }

                $value = (string) ($data[$matches[1]] ?? '—');
                $value = $value === '' ? '—' : $value;

                if (! $escape) {
                    return $value;
                }

                return nl2br(e($value));
            },
            $template,
        ) ?? $template;
    }

    /**
     * A preview rendered from illustrative values, for the admin editor.
     *
     * @return array{subject: string, body: string}
     */
    public function preview(): array
    {
        $sample = [
            'name' => 'Ayesha Rahman',
            'email' => 'ayesha@example.com',
            'phone' => '+880 1700 000000',
            'company' => 'Northwind Studio',
            'type' => 'Web UI/UX',
            'budget' => '$10k – $25k',
            'message' => "We are relaunching our storefront and need a full UI system.\nCan you take this on next quarter?",
            'source_page' => '/contact',
            'submitted_at' => now()->format('d M Y, H:i'),
            'site_name' => Setting::current()->site_name,
            'contact_email' => Setting::current()->contact_email,
        ];

        return [
            'subject' => $this->renderSubject($sample),
            'body' => $this->renderBody($sample),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'key' => $this->key->value,
            'name' => $this->name,
            'label' => $this->key->label(),
            'description' => $this->key->description(),
            'subject' => $this->subject,
            'bodyHtml' => $this->body_html,
            'enabled' => $this->enabled,
            'placeholders' => collect($this->key->placeholders())
                ->map(fn (string $hint, string $token) => ['token' => '{{ '.$token.' }}', 'hint' => $hint])
                ->values()
                ->all(),
            'preview' => $this->preview(),
            'updatedAt' => $this->updated_at?->diffForHumans(),
        ];
    }

    /**
     * Guards against an editor saving a body whose tokens do not exist.
     *
     * @return array<int, string>
     */
    public function unknownPlaceholders(): array
    {
        preg_match_all('/\{\{\s*([a-z_]+)\s*\}\}/i', $this->subject.' '.$this->body_html, $matches);

        return collect($matches[1] ?? [])
            ->unique()
            ->reject(fn (string $token) => array_key_exists(Str::lower($token), $this->key->placeholders()))
            ->values()
            ->all();
    }
}
