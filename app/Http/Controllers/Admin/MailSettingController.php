<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EmailLogSource;
use App\Enums\MailEncryption;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateMailSettingRequest;
use App\Models\MailSetting;
use App\Services\EmailLogger;
use App\Services\SmtpTester;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MailSettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Admin/Mail/Edit', [
            'mail' => MailSetting::current()->toAdminArray(),
            'encryptions' => collect(MailEncryption::cases())
                ->map(fn (MailEncryption $case) => ['value' => $case->value, 'label' => $case->label()])
                ->values(),
            'envMailer' => config('mail.default'),
        ]);
    }

    public function update(UpdateMailSettingRequest $request, EmailLogger $logger): RedirectResponse
    {
        $settings = MailSetting::current();
        $settings->update($request->mailAttributes());

        // Recorded by field name only, so the password never reaches the log.
        $changed = array_keys(array_diff_key($settings->getChanges(), array_flip(['updated_at'])));
        if ($changed !== []) {
            $logger->activity(EmailLogSource::SmtpSettings, 'SMTP settings updated', ['changed' => $changed]);
        }

        MailSetting::forgetCurrent();

        return back()->with('success', 'SMTP settings saved.');
    }

    /**
     * Send a probe message so the credentials are proven before a real lead
     * depends on them.
     */
    public function test(Request $request, SmtpTester $tester): RedirectResponse
    {
        $validated = $request->validate([
            'recipient' => ['required', 'email', 'max:190'],
        ]);

        $result = $tester->send(MailSetting::current(), $validated['recipient']);

        if (! $result['ok']) {
            return back()->withErrors(['recipient' => $result['message']]);
        }

        return back()->with('success', $result['message']);
    }
}
