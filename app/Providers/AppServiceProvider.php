<?php

namespace App\Providers;

use App\Models\MailSetting;
use App\Models\Setting;
use App\Services\PublicAsset;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Throwable;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // One settings row per request; reset between requests under Octane.
        $this->app->scoped(Setting::class, fn (): Setting => Setting::loadFromDatabase());
        $this->app->scoped(MailSetting::class, fn (): MailSetting => MailSetting::loadFromDatabase());
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->applyStoredMailSettings();
        $this->shareRootViewSettings();
        $this->useConfiguredAssetUrl();
        $this->deprioritizeScriptLoading();
    }

    /**
     * Let the SMTP settings saved in the admin panel win over `.env`.
     *
     * Deferred until the mail manager or mailer is first resolved: applying
     * it eagerly would query the database on every console command, including
     * `migrate` on a database that has no `mail_settings` table yet.
     */
    private function applyStoredMailSettings(): void
    {
        $apply = function (): void {
            try {
                MailSetting::current()->applyConfig();
            } catch (Throwable) {
                // Table missing or unreachable — keep the `.env` mailer.
            }
        };

        $this->app->resolving('mail.manager', $apply);
        $this->app->resolving(Mailer::class, $apply);
    }

    /**
     * Vite's build files (scripts, styles, fonts) use the same base as every
     * other asset (see PublicAsset::base): the env base URL, never the host a
     * request happened to arrive on.
     */
    private function useConfiguredAssetUrl(): void
    {
        Vite::createAssetPathsUsing(fn (string $path): string => PublicAsset::to($path));
    }

    /**
     * Pages are server-rendered and their opening animations are CSS, so no
     * JavaScript is needed to paint them. Script and module-preload tags are
     * therefore fetched at low priority, leaving stylesheets, fonts and the
     * first images to load first; the app still loads in parallel and hydrates
     * as soon as it arrives.
     */
    private function deprioritizeScriptLoading(): void
    {
        Vite::useScriptTagAttributes(['fetchpriority' => 'low']);
        Vite::usePreloadTagAttributes(fn (string $src, string $url): array => str_ends_with($url, '.js')
            ? ['fetchpriority' => 'low']
            : []);
    }

    /**
     * The root Blade template renders the favicon, meta defaults and the
     * editor's custom tracking scripts, so it needs the settings row.
     */
    private function shareRootViewSettings(): void
    {
        View::composer('app', function ($view): void {
            try {
                $settings = Setting::current();
            } catch (Throwable) {
                // Before the first migration there is nothing to render.
                $view->with(['siteSettings' => null]);

                return;
            }

            $view->with(['siteSettings' => $settings]);
        });
    }
}
