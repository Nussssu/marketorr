<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EmailLogSource;
use App\Enums\EmailTemplateKey;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateEmailTemplateRequest;
use App\Models\EmailTemplate;
use App\Services\EmailLogger;
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

    public function update(UpdateEmailTemplateRequest $request, EmailTemplate $template, EmailLogger $logger): RedirectResponse
    {
        $template->update($request->validated());

        $changed = array_keys(array_diff_key($template->getChanges(), array_flip(['updated_at'])));
        if ($changed !== []) {
            $logger->activity(EmailLogSource::EmailTemplate, '"'.$template->key->label().'" template updated', ['changed' => $changed]);
        }

        return back()->with('success', $template->key->label().' saved.');
    }
}
