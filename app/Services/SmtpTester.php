<?php

namespace App\Services;

use App\Enums\EmailLogSource;
use App\Models\MailSetting;
use App\Models\Setting;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

/**
 * Sends a probe message through the stored SMTP settings so an editor can
 * confirm the credentials before a real lead depends on them.
 */
class SmtpTester
{
    public function __construct(private readonly EmailLogger $logger) {}

    /**
     * @return array{ok: bool, message: string}
     */
    public function send(MailSetting $settings, string $recipient): array
    {
        $overrides = $settings->configOverrides();

        if ($overrides === []) {
            $this->logger->skipped(EmailLogSource::SmtpTest, 'SMTP is off or missing a host and port.', ['recipients' => $recipient]);

            return [
                'ok' => false,
                'message' => 'Enable SMTP and fill in a host and port before testing.',
            ];
        }

        $original = collect(array_keys($overrides))
            ->mapWithKeys(fn (string $key) => [$key => config($key)])
            ->all();

        config($overrides);
        Mail::purge('smtp');

        try {
            $siteName = Setting::current()->site_name;

            $sent = Mail::mailer('smtp')->raw(
                "This is a test message from the {$siteName} admin panel. If you are reading it, your SMTP settings work.",
                fn ($message) => $message->to($recipient)->subject("SMTP test: {$siteName}"),
            );

            $result = ['ok' => true, 'message' => "Test email sent to {$recipient}."];
            $this->logger->sent(EmailLogSource::SmtpTest, $sent, ['recipients' => $recipient, 'mailer' => 'smtp']);
        } catch (Throwable $exception) {
            $result = ['ok' => false, 'message' => 'Send failed: '.$exception->getMessage()];
            $this->logger->failed(EmailLogSource::SmtpTest, $exception, ['recipients' => $recipient, 'subject' => 'SMTP test', 'mailer' => 'smtp']);
        } finally {
            config($original);
            Mail::purge('smtp');
        }

        $settings->forceFill([
            'last_tested_at' => now(),
            'last_test_result' => Str::limit($result['message'], 240),
        ])->save();

        MailSetting::forgetCurrent();

        return $result;
    }
}
