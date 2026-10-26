<?php

namespace App\Services;

use App\Enums\EmailLogSource;
use App\Enums\EmailTemplateKey;
use App\Mail\TemplatedMail;
use App\Models\EmailTemplate;
use App\Models\MailSetting;
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
            $sent = Mail::mailer('smtp')->to($recipient)->send(new TemplatedMail(
                EmailTemplate::forKey(EmailTemplateKey::SmtpTest),
                ['recipient' => $recipient, 'sent_at' => now()->format('d M Y, H:i')],
            ));

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
