<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactSubmissionRequest;
use App\Models\ContactSubmission;
use App\Services\LeadNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    public function __construct(private readonly LeadNotifier $notifier) {}

    public function store(StoreContactSubmissionRequest $request): RedirectResponse
    {
        $data = $request->inquiryData();

        $submission = ContactSubmission::query()->create([
            ...$data,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Notifies the team and acknowledges the customer, using the
        // editor-managed templates and SMTP settings.
        $this->notifier->send($submission);

        // Kept alongside the database row as an audit trail.
        Log::info('Project inquiry received', $data);

        return back()->with('success', 'Thanks — we reply within 24–48h.');
    }
}
