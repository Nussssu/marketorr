<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EmailLogSource;
use App\Enums\EmailTemplateKey;
use App\Enums\EmailWidget;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PreviewEmailTemplateRequest;
use App\Http\Requests\Admin\UpdateEmailTemplateRequest;
use App\Http\Requests\Admin\UpdateEmailTemplatesRequest;
use App\Mail\TemplatedMail;
use App\Models\EmailTemplate;
use App\Services\EmailLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
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
            'widgets' => EmailWidget::catalogue(),
        ]);
    }

    /**
     * The editor's unsaved subject and widgets rendered into the real email
     * layout with sample values, so the preview is exactly what is sent.
     */
    public function preview(PreviewEmailTemplateRequest $request, EmailTemplate $template): JsonResponse
    {
        $draft = (clone $template)->forceFill([
            'subject' => (string) $request->validated('subject', ''),
            'blocks' => $request->validated('blocks'),
        ]);
        $sample = $template->key->sampleValues();

        return response()->json([
            'subject' => $draft->renderSubject($sample),
            'html' => view('mail.templated', TemplatedMail::layoutData($draft->renderBody($sample)))->render(),
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

    /**
     * Save every template at once, from the page's single save bar. Each
     * change is logged per template, as when saving one on its own.
     */
    public function updateAll(UpdateEmailTemplatesRequest $request, EmailLogger $logger): RedirectResponse
    {
        DB::transaction(function () use ($request, $logger): void {
            foreach ($request->validated('templates') as $input) {
                $template = EmailTemplate::query()->findOrFail($input['id']);
                $template->update(collect($input)->only(['subject', 'blocks', 'enabled'])->all());

                $changed = array_keys(array_diff_key($template->getChanges(), array_flip(['updated_at'])));
                if ($changed !== []) {
                    $logger->activity(EmailLogSource::EmailTemplate, '"'.$template->key->label().'" template updated', ['changed' => $changed]);
                }
            }
        });

        return back()->with('success', 'Email templates saved.');
    }
}
