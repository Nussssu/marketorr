<?php

namespace App\Services;

use App\Enums\EmailLogSource;
use App\Enums\EmailTemplateKey;
use App\Mail\TemplatedMail;
use App\Models\EmailTemplate;
use App\Models\MailSetting;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Sends admin account emails, from their editable templates, through the
 * site's mail settings and records them in the email log. The logged body
 * is redacted, because it holds a one-time sign-in link that must not be
 * readable from the log.
 */
class AdminAccountMailer
{
    private const REDACTED = '[Not stored: this email contains a one-time sign-in link.]';

    public function __construct(private readonly EmailLogger $logger) {}

    public function sendInvitation(User $user, string $url, ?User $inviter): bool
    {
        return $this->send(EmailTemplateKey::AdminInvitation, $user, [
            'name' => $user->name,
            'email' => $user->email,
            'inviter_name' => $inviter?->name ?? 'An administrator',
            'action_url' => $url,
        ]);
    }

    public function sendPasswordReset(User $user, string $url): bool
    {
        return $this->send(EmailTemplateKey::AdminPasswordReset, $user, [
            'name' => $user->name,
            'email' => $user->email,
            'action_url' => $url,
        ]);
    }

    /**
     * @param  array<string, string|null>  $placeholders
     */
    private function send(EmailTemplateKey $key, User $user, array $placeholders): bool
    {
        MailSetting::current()->applyConfig();
        $source = EmailLogSource::forTemplate($key);

        try {
            $sent = Mail::to($user->email, $user->name)->send(new TemplatedMail(EmailTemplate::forKey($key), $placeholders));
            $this->logger->sent($source, $sent, ['body' => self::REDACTED]);

            return true;
        } catch (Throwable $exception) {
            Log::warning('Admin account email could not be sent', ['source' => $source->value, 'error' => $exception->getMessage()]);
            $this->logger->failed($source, $exception, ['recipients' => $user->email]);

            return false;
        }
    }
}
