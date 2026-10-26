<?php

namespace App\Services;

use App\Enums\EmailWidget;

/**
 * Turns an email template's widgets into the inline-styled HTML that sits
 * inside the branded email layout (`mail.templated`).
 *
 * Editor text in plain fields (headings, labels, URLs) is escaped; the Text
 * and Custom HTML widgets keep the editor's markup. Placeholder values always
 * come from outside (a public form, a user record), so they are escaped
 * everywhere they land.
 */
class EmailWidgetRenderer
{
    private const FONT = "'Helvetica Neue',Arial,sans-serif";

    /**
     * @param  array<int, array<string, mixed>>  $blocks
     * @param  array<string, string|null>  $data
     */
    public function render(array $blocks, array $data): string
    {
        return collect($blocks)
            ->map(fn (mixed $block): string => is_array($block) ? $this->block($block, $data) : '')
            ->filter()
            ->implode("\n");
    }

    /**
     * The widgets as clean, unstyled HTML with placeholders left in place,
     * for the editor's single Body box. The email styling is added when the
     * body is rendered (see style()), so the editor never sees inline styles.
     *
     * @param  array<int, array<string, mixed>>  $blocks
     */
    public function editableHtml(array $blocks): string
    {
        $text = fn (mixed $value): string => e(trim((string) $value));
        $lines = fn (mixed $value): string => nl2br($text($value), false);

        return collect($blocks)
            ->filter(fn (mixed $block): bool => is_array($block))
            ->map(fn (array $block): string => match (EmailWidget::tryFrom((string) ($block['type'] ?? ''))) {
                EmailWidget::Heading => filled($block['text'] ?? null) ? '<h1>'.$text($block['text']).'</h1>' : '',
                EmailWidget::Text => collect(preg_split('/\R\s*\R/', trim((string) ($block['text'] ?? ''))) ?: [])
                    ->map(fn (string $paragraph): string => trim($paragraph))
                    ->filter()
                    ->map(fn (string $paragraph): string => '<p>'.nl2br($paragraph, false).'</p>')
                    ->implode("\n"),
                EmailWidget::Button => filled($block['label'] ?? null) && filled($block['url'] ?? null)
                    ? '<p><a href="'.$text($block['url']).'" class="button">'.$text($block['label']).'</a></p>'
                    : '',
                EmailWidget::Details => "<table>\n".collect($block['rows'] ?? [])
                    ->filter(fn (mixed $row): bool => is_array($row) && (filled($row['label'] ?? null) || filled($row['value'] ?? null)))
                    ->map(fn (array $row): string => '  <tr><th>'.$text($row['label'] ?? '').'</th><td>'.$lines($row['value'] ?? '').'</td></tr>')
                    ->implode("\n")."\n</table>",
                EmailWidget::Quote => filled($block['text'] ?? null) ? '<blockquote>'.$lines($block['text']).'</blockquote>' : '',
                EmailWidget::Image => filled($block['src'] ?? null)
                    ? (filled($block['link'] ?? null) ? '<a href="'.$text($block['link']).'">' : '')
                        .'<img src="'.$text($block['src']).'" alt="'.$text($block['alt'] ?? '').'"'
                        .((int) ($block['width'] ?? 0) > 0 ? ' width="'.(int) $block['width'].'"' : '').'>'
                        .(filled($block['link'] ?? null) ? '</a>' : '')
                    : '',
                EmailWidget::Divider => '<hr>',
                EmailWidget::Note => filled($block['text'] ?? null) ? '<p class="note">'.$lines($block['text']).'</p>' : '',
                EmailWidget::Html => trim((string) ($block['html'] ?? '')),
                null => '',
            })
            ->filter()
            ->implode("\n\n");
    }

    /**
     * Substitute `{{ placeholder }}` tokens. An unknown token is left as it
     * is and a missing value becomes a dash, so a blank field never reads as
     * a broken sentence.
     *
     * @param  array<string, string|null>  $data
     */
    public static function fill(string $template, array $data, bool $escape = true, bool $lineBreaks = true): string
    {
        return preg_replace_callback(
            '/\{\{\s*([a-z_]+)\s*\}\}/i',
            function (array $matches) use ($data, $escape, $lineBreaks): string {
                $token = strtolower($matches[1]);

                if (! array_key_exists($token, $data)) {
                    return $matches[0];
                }

                $value = (string) ($data[$token] ?? '');
                $value = $value === '' ? '-' : $value;

                if (! $escape) {
                    return $value;
                }

                return $lineBreaks ? nl2br(e($value)) : e($value);
            },
            $template,
        ) ?? $template;
    }

    /**
     * A full URL for a stored file path, for use inside an email, where a
     * root-relative link has no site to resolve against. The original file is
     * used rather than an optimized WebP copy, which some mail clients cannot
     * show.
     */
    public static function absoluteUrl(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        if (preg_match('#^(https?:)?//#i', $path)) {
            return $path;
        }

        $relative = str_starts_with($path, '/') ? PublicAsset::to($path) : PublicAsset::disk($path);

        if (preg_match('#^(https?:)?//#i', $relative)) {
            return $relative;
        }

        $appUrl = (string) config('app.url');
        $origin = (string) parse_url($appUrl, PHP_URL_SCHEME).'://'.(string) parse_url($appUrl, PHP_URL_HOST)
            .(parse_url($appUrl, PHP_URL_PORT) ? ':'.parse_url($appUrl, PHP_URL_PORT) : '');

        return rtrim($origin, '/').'/'.ltrim($relative, '/');
    }

    /**
     * @param  array<string, mixed>  $block
     * @param  array<string, string|null>  $data
     */
    private function block(array $block, array $data): string
    {
        return match (EmailWidget::tryFrom((string) ($block['type'] ?? ''))) {
            EmailWidget::Heading => $this->heading($block, $data),
            EmailWidget::Text => $this->text($block, $data),
            EmailWidget::Button => $this->button($block, $data),
            EmailWidget::Details => $this->details($block, $data),
            EmailWidget::Quote => $this->quote($block, $data),
            EmailWidget::Image => $this->image($block, $data),
            EmailWidget::Divider => '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="height:1px;line-height:1px;font-size:1px;background:#2a2a36;">&nbsp;</td></tr></table>',
            EmailWidget::Note => $this->note($block, $data),
            EmailWidget::Html => $this->style(self::fill((string) ($block['html'] ?? ''), $data)),
            null => '',
        };
    }

    /**
     * Gives plain HTML from the editor the email look, the same as the
     * widgets, by adding inline styles (mail clients ignore stylesheets).
     * An element the editor styled itself is left as it is, and images get a
     * full URL so they load in a mail client.
     */
    private function style(string $html): string
    {
        if (trim($html) === '' || ! class_exists(\DOMDocument::class)) {
            return $html;
        }

        $font = 'font-family:'.self::FONT.';';
        $styles = [
            'h1' => $font.'margin:0 0 16px;font-size:24px;line-height:1.3;font-weight:700;color:#ffffff;',
            'h2' => $font.'margin:0 0 14px;font-size:20px;line-height:1.35;font-weight:700;color:#ffffff;',
            'h3' => $font.'margin:0 0 12px;font-size:17px;line-height:1.4;font-weight:700;color:#ffffff;',
            'p' => $font.'margin:0 0 16px;font-size:15px;line-height:1.7;color:#d7d7e0;',
            'p.note' => $font.'margin:0 0 16px;font-size:13px;line-height:1.6;color:#9a9aab;word-break:break-word;',
            'a' => 'color:#7fa8ff;text-decoration:underline;',
            'a.button' => $font.'display:inline-block;padding:13px 26px;border-radius:999px;background:#507AF4;background:linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB);font-size:14px;font-weight:700;letter-spacing:0.04em;color:#ffffff;text-decoration:none;',
            'strong' => 'color:#ffffff;',
            'blockquote' => $font.'margin:0 0 24px;padding:16px 20px;border-left:3px solid #507AF4;border-radius:6px;background:#1c1c26;font-size:15px;line-height:1.7;color:#e6e6ee;',
            'ul' => $font.'margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.7;color:#d7d7e0;',
            'ol' => $font.'margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.7;color:#d7d7e0;',
            'li' => 'margin:0 0 6px;',
            'table' => 'width:100%;margin:0 0 24px;border-collapse:collapse;border-top:1px solid #23232e;',
            'th' => $font.'padding:10px 12px 10px 0;border-bottom:1px solid #23232e;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-align:left;vertical-align:top;color:#9a9aab;white-space:nowrap;',
            'td' => $font.'padding:10px 0;border-bottom:1px solid #23232e;font-size:14px;line-height:1.6;vertical-align:top;color:#ffffff;',
            'hr' => 'margin:8px 0 24px;border:0;border-top:1px solid #2a2a36;',
            'img' => 'display:block;max-width:100%;height:auto;border:0;border-radius:8px;margin:0 0 24px;',
        ];

        $document = new \DOMDocument;
        $previous = libxml_use_internal_errors(true);
        $document->loadHTML('<?xml encoding="utf-8"?><div id="email-body">'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = $document->getElementById('email-body');

        if ($root === null) {
            return $html;
        }

        foreach ((new \DOMXPath($document))->query('.//*', $root) ?: [] as $element) {
            if (! $element instanceof \DOMElement) {
                continue;
            }

            $tag = strtolower($element->tagName);

            if ($tag === 'img' && $element->hasAttribute('src')) {
                $element->setAttribute('src', (string) self::absoluteUrl($element->getAttribute('src')));
            }

            if ($element->hasAttribute('style')) {
                continue;
            }

            $classes = preg_split('/\s+/', $element->getAttribute('class')) ?: [];
            $style = collect($classes)->map(fn (string $class): ?string => $styles["{$tag}.{$class}"] ?? null)->filter()->first()
                ?? $styles[$tag] ?? null;

            if ($style !== null) {
                $element->setAttribute('style', $style);
            }
        }

        $output = '';
        foreach ($root->childNodes as $child) {
            $output .= $document->saveHTML($child);
        }

        return $output;
    }

    /**
     * Editor text that is shown as written: escaped, then filled.
     *
     * @param  array<string, string|null>  $data
     */
    private function plain(mixed $text, array $data, bool $lineBreaks = false): string
    {
        $escaped = e(trim((string) $text));

        return self::fill($lineBreaks ? nl2br($escaped) : $escaped, $data, lineBreaks: $lineBreaks);
    }

    /**
     * @param  array<string, mixed>  $block
     * @param  array<string, string|null>  $data
     */
    private function heading(array $block, array $data): string
    {
        $text = $this->plain($block['text'] ?? '', $data);

        return $text === '' ? '' : '<h1 style="margin:0 0 16px;font-family:'.self::FONT.';font-size:24px;line-height:1.3;font-weight:700;color:#ffffff;">'.$text.'</h1>';
    }

    /**
     * @param  array<string, mixed>  $block
     * @param  array<string, string|null>  $data
     */
    private function text(array $block, array $data): string
    {
        return collect(preg_split('/\R\s*\R/', trim((string) ($block['text'] ?? ''))) ?: [])
            ->map(fn (string $paragraph): string => trim($paragraph))
            ->filter()
            ->map(fn (string $paragraph): string => '<p style="margin:0 0 16px;font-family:'.self::FONT.';font-size:15px;line-height:1.7;color:#d7d7e0;">'
                .self::fill(nl2br($paragraph), $data)
                .'</p>')
            ->implode("\n");
    }

    /**
     * @param  array<string, mixed>  $block
     * @param  array<string, string|null>  $data
     */
    private function button(array $block, array $data): string
    {
        $label = $this->plain($block['label'] ?? '', $data);
        $url = $this->plain($block['url'] ?? '', $data);

        if ($label === '' || $url === '') {
            return '';
        }

        return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr>'
            .'<td bgcolor="#507AF4" style="border-radius:999px;background:linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB);">'
            .'<a href="'.$url.'" target="_blank" style="display:inline-block;padding:13px 26px;font-family:'.self::FONT.';font-size:14px;font-weight:700;letter-spacing:0.04em;color:#ffffff;text-decoration:none;border-radius:999px;">'.$label.'</a>'
            .'</td></tr></table>';
    }

    /**
     * @param  array<string, mixed>  $block
     * @param  array<string, string|null>  $data
     */
    private function details(array $block, array $data): string
    {
        $rows = collect($block['rows'] ?? [])
            ->filter(fn (mixed $row): bool => is_array($row) && (filled($row['label'] ?? null) || filled($row['value'] ?? null)))
            ->map(fn (array $row): string => '<tr>'
                .'<td valign="top" style="padding:10px 12px 10px 0;border-bottom:1px solid #23232e;font-family:'.self::FONT.';font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9a9aab;white-space:nowrap;">'.$this->plain($row['label'] ?? '', $data).'</td>'
                .'<td valign="top" style="padding:10px 0;border-bottom:1px solid #23232e;font-family:'.self::FONT.';font-size:14px;line-height:1.6;color:#ffffff;">'.$this->plain($row['value'] ?? '', $data, lineBreaks: true).'</td>'
                .'</tr>');

        if ($rows->isEmpty()) {
            return '';
        }

        return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-top:1px solid #23232e;">'.$rows->implode('').'</table>';
    }

    /**
     * @param  array<string, mixed>  $block
     * @param  array<string, string|null>  $data
     */
    private function quote(array $block, array $data): string
    {
        $text = $this->plain($block['text'] ?? '', $data, lineBreaks: true);

        return $text === '' ? '' : '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr>'
            .'<td bgcolor="#1c1c26" style="padding:16px 20px;border-left:3px solid #507AF4;border-radius:6px;background:#1c1c26;font-family:'.self::FONT.';font-size:15px;line-height:1.7;color:#e6e6ee;">'.$text.'</td>'
            .'</tr></table>';
    }

    /**
     * @param  array<string, mixed>  $block
     * @param  array<string, string|null>  $data
     */
    private function image(array $block, array $data): string
    {
        $src = self::absoluteUrl((string) ($block['src'] ?? ''));

        if ($src === null) {
            return '';
        }

        $width = min(max((int) ($block['width'] ?? 0), 0), 536);
        $sizing = $width > 0
            ? 'width="'.$width.'" style="display:block;width:'.$width.'px;max-width:100%;height:auto;border:0;border-radius:8px;"'
            : 'width="536" style="display:block;width:100%;max-width:100%;height:auto;border:0;border-radius:8px;"';
        $image = '<img src="'.e($src).'" alt="'.$this->plain($block['alt'] ?? '', $data).'" '.$sizing.' />';
        $link = $this->plain($block['link'] ?? '', $data);

        return '<div style="margin:0 0 24px;">'.($link !== '' ? '<a href="'.$link.'" target="_blank">'.$image.'</a>' : $image).'</div>';
    }

    /**
     * @param  array<string, mixed>  $block
     * @param  array<string, string|null>  $data
     */
    private function note(array $block, array $data): string
    {
        $text = $this->plain($block['text'] ?? '', $data, lineBreaks: true);

        return $text === '' ? '' : '<p style="margin:0 0 16px;font-family:'.self::FONT.';font-size:13px;line-height:1.6;color:#9a9aab;word-break:break-word;">'.$text.'</p>';
    }
}
