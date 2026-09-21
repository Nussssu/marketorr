<?php

namespace App\Services;

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
    /**
     * @return array{ok: bool, message: string}
     */
    public function send(MailSetting $settings, string $recipient): array
    {
        $overrides = $settings->configOverrides();

        if ($overrides === []) {
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

            Mail::mailer('smtp')->raw(
                "This is a test message from the {$siteName} admin panel. If you are reading it, your SMTP settings work.",
                fn ($message) => $message->to($recipient)->subject("SMTP test — {$siteName}"),
            );

            $result = ['ok' => true, 'message' => "Test email sent to {$recipient}."];
        } catch (Throwable $exception) {
            $result = ['ok' => false, 'message' => 'Send failed: '.$exception->getMessage()];
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
