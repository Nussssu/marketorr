<?php

namespace App\Services;

use App\Enums\EmailTemplateKey;
use App\Mail\TemplatedMail;
use App\Models\ContactSubmission;
use App\Models\EmailTemplate;
use App\Models\MailSetting;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Sends the two emails a new lead triggers: the team's notification and the
 * customer's acknowledgement. A template that has been switched off is
 * skipped, and a transport failure never costs the visitor their submission.
 */
class LeadNotifier
{
    public function send(ContactSubmission $submission): void
    {
        $placeholders = $submission->mailPlaceholders();

        $this->dispatch(
            EmailTemplateKey::AdminLeadNotification,
            MailSetting::current()->notificationRecipient(),
            $placeholders,
            replyTo: $submission->email,
        );

        $this->dispatch(
            EmailTemplateKey::LeadAutoResponder,
            $submission->email,
            $placeholders,
        );
    }

    /**
     * @param  array<string, string|null>  $placeholders
     */
    private function dispatch(EmailTemplateKey $key, string $recipient, array $placeholders, ?string $replyTo = null): void
    {
        $template = EmailTemplate::forKey($key);

        if (! $template->enabled || blank($recipient)) {
            return;
        }

        try {
            Mail::to($recipient)->send(new TemplatedMail($template, $placeholders, $replyTo));
        } catch (Throwable $exception) {
            // The lead is already stored; a broken mailer must not 500 the form.
            Log::error('Lead email failed to send', [
                'template' => $key->value,
                'recipient' => $recipient,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
