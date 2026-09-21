<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EmailTemplateKey;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateEmailTemplateRequest;
use App\Models\EmailTemplate;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EmailTemplateController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/EmailTemplates/Index', [
            // Reading through the enum guarantees every template exists, even
            // on an install that has never sent mail.
            'templates' => collect(EmailTemplateKey::cases())
                ->map(fn (EmailTemplateKey $key) => EmailTemplate::forKey($key)->toAdminArray())
                ->values(),
        ]);
    }

    public function update(UpdateEmailTemplateRequest $request, EmailTemplate $template): RedirectResponse
    {
        $template->update($request->validated());

        return back()->with('success', $template->key->label().' saved.');
    }
}
