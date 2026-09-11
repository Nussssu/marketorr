<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'company' => ['nullable', 'string', 'max:190'],
            'type' => ['required', 'string', 'in:Branding,Web UI/UX,Software UI/UX,Mobile App UI/UX,Other'],
            'budget' => ['nullable', 'string', 'max:120'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        // Swap this for Mail::to(...) when a mailbox is ready.
        Log::info('Project inquiry received', $data);

        return back()->with('success', 'Thanks — we reply within 24–48h.');
    }
}
