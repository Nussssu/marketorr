<?php

namespace App\Services;

use App\Enums\EmailLogSource;
use App\Mail\AdminAccountMail;
use App\Models\MailSetting;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Sends admin account emails through the site's mail settings and records
 * them in the email log. The logged body is redacted, because it holds a
 * one-time sign-in link that must not be readable from the log.
 */
class AdminAccountMailer
{
    private const REDACTED = '[Not stored: this email contains a one-time sign-in link.]';

    public function __construct(private readonly EmailLogger $logger) {}

    public function sendInvitation(User $user, string $url, ?User $inviter): bool
    {
        $site = Setting::current()->site_name ?: config('app.name');

        return $this->send(EmailLogSource::AdminInvitation, $user, new AdminAccountMail(
            subjectLine: "You're invited to the {$site} admin panel",
            heading: "Join the {$site} admin panel",
            intro: ($inviter?->name ?? 'An administrator').' has invited you to help manage the site. Set your password to activate your account.',
            buttonLabel: 'Accept invitation',
            buttonUrl: $url,
            footnote: 'This link expires in 7 days and works once. If you were not expecting it, you can ignore this email.',
        ));
    }

    public function sendPasswordReset(User $user, string $url): bool
    {
        $site = Setting::current()->site_name ?: config('app.name');

        return $this->send(EmailLogSource::AdminPasswordReset, $user, new AdminAccountMail(
            subjectLine: "Reset your {$site} admin password",
            heading: 'Reset your password',
            intro: 'A password reset was requested for your admin account. Choose a new password to sign in again.',
            buttonLabel: 'Choose a new password',
            buttonUrl: $url,
            footnote: 'This link expires in 60 minutes. If you did not expect it, you can ignore this email: your password stays the same.',
        ));
    }

    private function send(EmailLogSource $source, User $user, AdminAccountMail $mail): bool
    {
        MailSetting::current()->applyConfig();

        try {
            $sent = Mail::to($user->email, $user->name)->send($mail);
            $this->logger->sent($source, $sent, ['body' => self::REDACTED]);

            return true;
        } catch (Throwable $exception) {
            Log::warning('Admin account email could not be sent', ['source' => $source->value, 'error' => $exception->getMessage()]);
            $this->logger->failed($source, $exception, ['recipients' => $user->email]);

            return false;
        }
    }
}
