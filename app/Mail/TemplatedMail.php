<?php

namespace App\Mail;

use App\Models\EmailTemplate;
use App\Models\MailSetting;
use App\Models\Setting;
use App\Services\EmailWidgetRenderer;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

/**
 * Renders an editor-managed template into a sendable message inside the
 * site's branded email layout. Every email the site sends goes through here.
 * Placeholder values are substituted and escaped by the template itself.
 */
class TemplatedMail extends Mailable
{
    use Queueable, SerializesModels;

    /** The logo's display width in the email header, in pixels. */
    private const LOGO_WIDTH = 200;

    /** The tallest the logo may show, in pixels, so a square mark stays modest. */
    private const LOGO_MAX_HEIGHT = 60;

    /**
     * @param  array<string, string|null>  $placeholders
     */
    public function __construct(
        public EmailTemplate $template,
        public array $placeholders,
        public ?string $replyToAddress = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->template->renderSubject($this->placeholders),
            replyTo: filled($this->replyToAddress) ? [$this->replyToAddress] : [],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.templated',
            with: self::layoutData($this->template->renderBody($this->placeholders)),
        );
    }

    /**
     * Everything the branded layout needs around a rendered body. The logo
     * is the one picked for emails on the Email Templates page, falling back
     * to the dark-background lockup from Settings.
     *
     * @param  ?string  $emailLogo  an unsaved pick to preview; null reads the saved one
     * @return array{bodyHtml: string, siteName: string, siteUrl: string, logoUrl: ?string, logoFile: ?string, logoWidth: int, logoHeight: ?int, contactEmail: ?string, copyright: string}
     */
    public static function layoutData(string $bodyHtml, ?string $emailLogo = null): array
    {
        $settings = Setting::current();
        $logoPath = collect([
            $emailLogo ?? MailSetting::current()->email_logo_path,
            $settings->logo_dark_path,
            $settings->logo_path,
            '/images/logo/marketorr-logo-on-dark.png',
        ])->first(fn (?string $path): bool => filled($path));
        $logoFile = self::localFile($logoPath);
        $dimensions = $logoFile !== null ? @getimagesize($logoFile) : false;
        // Wide lockups show 200px wide; a squarer mark is kept to 60px tall.
        $logoWidth = $dimensions && $dimensions[1] > 0
            ? (int) min(self::LOGO_WIDTH, round(self::LOGO_MAX_HEIGHT * $dimensions[0] / $dimensions[1]))
            : self::LOGO_WIDTH;

        return [
            'bodyHtml' => $bodyHtml,
            'siteName' => $settings->site_name ?: (string) config('app.name'),
            'siteUrl' => (string) EmailWidgetRenderer::absoluteUrl('/'),
            'logoUrl' => EmailWidgetRenderer::absoluteUrl($logoPath),
            'logoFile' => $logoFile,
            'logoWidth' => $logoWidth,
            'logoHeight' => $dimensions && $dimensions[0] > 0 ? (int) round($logoWidth * $dimensions[1] / $dimensions[0]) : null,
            'contactEmail' => $settings->contact_email,
            'copyright' => $settings->copyrightLine(),
        ];
    }

    /**
     * The logo's file on this server, so it can be embedded in the message
     * itself. A linked image only loads when the recipient's mail client can
     * reach the site, which a local or private APP_URL never allows.
     */
    private static function localFile(?string $path): ?string
    {
        if (blank($path) || preg_match('#^(https?:)?//#i', $path)) {
            return null;
        }

        $file = str_starts_with($path, '/')
            ? public_path(ltrim($path, '/'))
            : Storage::disk('public')->path($path);

        return is_file($file) ? $file : null;
    }
}
