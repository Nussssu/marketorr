<?php

namespace App\Services;

use App\Enums\EmailLogSource;
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
    public function __construct(private readonly EmailLogger $logger) {}

    public function send(ContactSubmission $submission): void
    {
        MailSetting::current()->applyConfig();

        $placeholders = $submission->mailPlaceholders();
        $adminRecipients = MailSetting::current()->notificationRecipients();

        $this->dispatch(
            EmailTemplateKey::AdminLeadNotification,
            $adminRecipients,
            $placeholders,
            $submission,
            replyTo: $submission->email,
        );

        $this->dispatch(
            EmailTemplateKey::LeadAutoResponder,
            $submission->email,
            $placeholders,
            $submission,
        );
    }

    /**
     * @param  string|list<string>  $recipient
     * @param  array<string, string|null>  $placeholders
     */
    private function dispatch(EmailTemplateKey $key, string|array $recipient, array $placeholders, ContactSubmission $submission, ?string $replyTo = null): void
    {
        $template = EmailTemplate::forKey($key);
        $source = EmailLogSource::forTemplate($key);
        $context = ['contact_submission_id' => $submission->id];

        if (! $template->enabled) {
            Log::debug('Lead notification email skipped: template is disabled', [
                'template' => $key->value,
            ]);
            $this->logger->skipped($source, 'The "'.$key->label().'" template is switched off.', $context);

            return;
        }

        if (empty($recipient)) {
            Log::warning('Lead notification email skipped: recipient address is missing or blank', [
                'template' => $key->value,
            ]);
            $this->logger->skipped($source, 'No recipient address is set.', $context);

            return;
        }

        $recipientList = is_array($recipient) ? implode(', ', $recipient) : $recipient;
        $activeMailer = config('mail.default', 'smtp');

        try {
            Log::debug('Dispatching lead notification email', [
                'template' => $key->value,
                'recipient' => $recipientList,
                'mailer' => $activeMailer,
                'reply_to' => $replyTo,
            ]);

            $sent = Mail::to($recipient)->send(new TemplatedMail($template, $placeholders, $replyTo));

            Log::debug('Lead notification email sent successfully', [
                'template' => $key->value,
                'recipient' => $recipientList,
                'mailer' => $activeMailer,
            ]);
            $this->logger->sent($source, $sent, ['recipients' => $recipientList, ...$context]);
        } catch (Throwable $exception) {
            $this->logger->failed($source, $exception, [
                'recipients' => $recipientList,
                'subject' => $template->renderSubject($placeholders),
                ...$context,
            ]);

            // The lead is already stored; a broken mailer must not 500 the form.
            Log::error('Lead notification email failed to send', [
                'template' => $key->value,
                'recipient' => $recipientList,
                'mailer' => $activeMailer,
                'error' => $exception->getMessage(),
                'exception' => $exception,
            ]);
        }
    }
}
