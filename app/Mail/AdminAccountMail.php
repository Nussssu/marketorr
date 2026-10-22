<?php

namespace App\Mail;

use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * An admin account email (invitation, password reset) in the site's branded
 * email layout. Every value placed in the body is escaped here.
 */
class AdminAccountMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $subjectLine,
        public string $heading,
        public string $intro,
        public string $buttonLabel,
        public string $buttonUrl,
        public string $footnote,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->subjectLine);
    }

    public function content(): Content
    {
        $settings = Setting::current();
        $e = fn (string $value): string => e($value);

        return new Content(
            view: 'mail.templated',
            with: [
                'bodyHtml' => '<h1 style="margin:0 0 12px;font-size:22px;color:#ffffff;">'.$e($this->heading).'</h1>'
                    .'<p style="margin:0 0 24px;">'.$e($this->intro).'</p>'
                    .'<p style="margin:0 0 24px;"><a href="'.$e($this->buttonUrl).'" style="display:inline-block;padding:12px 22px;border-radius:999px;background:linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB);color:#ffffff;font-weight:700;text-decoration:none;letter-spacing:0.04em;">'.$e($this->buttonLabel).'</a></p>'
                    .'<p style="margin:0;font-size:13px;color:#9a9aab;">'.$e($this->footnote).'</p>'
                    .'<p style="margin:16px 0 0;font-size:12px;color:#6c6c7d;word-break:break-all;">'.$e($this->buttonUrl).'</p>',
                'siteName' => $settings->site_name,
                'logoUrl' => $settings->assetUrl($settings->logo_dark_path)
                    ?? $settings->assetUrl($settings->logo_path)
                    ?? asset('images/logo/marketorr-logo-on-dark.png'),
            ],
        );
    }
}
