<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateCustomCodeRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Code injected into every public page: analytics, pixels, chat widgets.
 * Its own module, apart from the rest of the site settings.
 */
class CustomCodeController extends Controller
{
    public function edit(): Response
    {
        $settings = Setting::current();

        return Inertia::render('Admin/CustomCode', [
            'code' => [
                'head_scripts' => $settings->head_scripts ?? '',
                'body_scripts' => $settings->body_scripts ?? '',
            ],
        ]);
    }

    public function update(UpdateCustomCodeRequest $request): RedirectResponse
    {
        Setting::current()->update($request->validated());
        Setting::forgetCurrent();

        return back()->with('success', 'Custom code saved.');
    }
}
