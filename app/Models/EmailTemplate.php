<?php

namespace App\Models;

use App\Enums\EmailTemplateKey;
use App\Enums\EmailWidget;
use App\Services\EmailWidgetRenderer;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

#[Fillable(['key', 'name', 'subject', 'blocks', 'enabled'])]
class EmailTemplate extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'key' => EmailTemplateKey::class,
            'blocks' => 'array',
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
     * Whether this email goes out. Account and SMTP test emails cannot be
     * switched off, whatever the stored flag says.
     */
    public function isSendable(): bool
    {
        return $this->enabled || ! $this->key->canBeDisabled();
    }

    /**
     * The subject with placeholders filled in. It is plain text, so values
     * are not escaped here; the mailer encodes the header itself.
     *
     * @param  array<string, string|null>  $data
     */
    public function renderSubject(array $data): string
    {
        return EmailWidgetRenderer::fill($this->subject, $this->withSiteValues($data), escape: false);
    }

    /**
     * The body HTML built from the template's widgets. Values are escaped,
     * because the data often comes from a public form.
     *
     * @param  array<string, string|null>  $data
     */
    public function renderBody(array $data): string
    {
        return app(EmailWidgetRenderer::class)->render($this->blocks ?? [], $this->withSiteValues($data));
    }

    /**
     * A preview rendered from illustrative values, for the admin editor.
     *
     * @return array{subject: string, body: string}
     */
    public function preview(): array
    {
        $sample = $this->key->sampleValues();

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
            'blocks' => $this->blocks ?? [],
            // The widgets as one clean HTML body with placeholders left in
            // place, for the editor's single Body box; styling is added on send.
            'bodyHtml' => app(EmailWidgetRenderer::class)->editableHtml($this->blocks ?? []),
            'defaultBlocks' => $this->key->defaults()['blocks'],
            'enabled' => $this->enabled,
            'canBeDisabled' => $this->key->canBeDisabled(),
            'placeholders' => collect($this->key->placeholders())
                ->map(fn (string $hint, string $token) => ['token' => '{{ '.$token.' }}', 'hint' => $hint])
                ->values()
                ->all(),
            'updatedAt' => $this->updated_at?->diffForHumans(),
        ];
    }

    /**
     * Guards against an editor saving a template whose tokens do not exist.
     *
     * @return array<int, string>
     */
    public function unknownPlaceholders(): array
    {
        $texts = collect($this->blocks ?? [])
            ->filter(fn (mixed $block): bool => is_array($block))
            ->flatMap(fn (array $block): array => EmailWidget::textsOf($block))
            ->prepend($this->subject)
            ->implode(' ');

        preg_match_all('/\{\{\s*([a-z_]+)\s*\}\}/i', $texts, $matches);

        return collect($matches[1] ?? [])
            ->unique()
            ->reject(fn (string $token) => array_key_exists(Str::lower($token), $this->key->placeholders()))
            ->values()
            ->all();
    }

    /**
     * The site-wide values every template can use, under any caller's data.
     *
     * @param  array<string, string|null>  $data
     * @return array<string, string|null>
     */
    private function withSiteValues(array $data): array
    {
        $settings = Setting::current();

        return [
            'site_name' => $settings->site_name ?: config('app.name'),
            'contact_email' => $settings->contact_email,
            ...$data,
        ];
    }
}
