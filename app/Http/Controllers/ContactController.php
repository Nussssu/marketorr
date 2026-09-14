<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactSubmissionRequest;
use App\Mail\NewProjectInquiry;
use App\Models\ContactSubmission;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(StoreContactSubmissionRequest $request): RedirectResponse
    {
        $data = $request->inquiryData();

        $submission = ContactSubmission::query()->create([
            ...$data,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        Mail::to(Setting::current()->contact_email)->send(new NewProjectInquiry($submission));

        // Kept alongside the database row as an audit trail.
        Log::info('Project inquiry received', $data);

        return back()->with('success', 'Thanks — we reply within 24–48h.');
    }
}
