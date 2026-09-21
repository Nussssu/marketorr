<?php

namespace App\Mail;

use App\Models\EmailTemplate;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Renders an editor-managed template into a sendable message. Placeholder
 * values are substituted and escaped by the template itself.
 */
class TemplatedMail extends Mailable
{
    use Queueable, SerializesModels;

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
            with: [
                'bodyHtml' => $this->template->renderBody($this->placeholders),
                'siteName' => Setting::current()->site_name,
            ],
        );
    }
}
