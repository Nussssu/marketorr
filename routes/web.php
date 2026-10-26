<?php

use App\Http\Controllers\Admin\AccountSecurityController;
use App\Http\Controllers\Admin\AdminRoleController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CodeSnippetController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EmailLogController;
use App\Http\Controllers\Admin\EmailTemplateController;
use App\Http\Controllers\Admin\GlobalBlockController;
use App\Http\Controllers\Admin\InquiryController;
use App\Http\Controllers\Admin\MailSettingController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\PageController as AdminPageController;
use App\Http\Controllers\Admin\PageSectionController;
use App\Http\Controllers\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Admin\ServiceGroupController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SubServiceController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\InvitationController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\TwoFactorChallengeController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SeoController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public marketing site
|--------------------------------------------------------------------------
*/

Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('/about', [PageController::class, 'about'])->name('about');

Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/services/{service}/{sub}', [ServiceController::class, 'subShow'])->name('services.subshow');
Route::get('/services/{slug}', [ServiceController::class, 'show'])->name('services.show');

Route::get('/work', [ProjectController::class, 'index'])->name('work.index');
Route::get('/work/portfolio/uiux/{project}', [ProjectController::class, 'uiuxProject'])->name('work.uiux-project');
Route::get('/work/portfolio/{group}', [ProjectController::class, 'portfolio'])->name('work.portfolio');
Route::get('/work/{slug}', [ProjectController::class, 'show'])->name('work.show');

Route::get('/contact', [PageController::class, 'contact'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('contact.store');

Route::get('/privacy', [PageController::class, 'privacy'])->name('privacy');
Route::get('/terms', [PageController::class, 'terms'])->name('terms');

Route::get('/robots.txt', [SeoController::class, 'robots'])->name('robots');
Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('sitemap');

/*
|--------------------------------------------------------------------------
| Admin panel
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->name('admin.')->group(function (): void {
    Route::middleware('guest')->group(function (): void {
        Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
        Route::post('login', [AuthenticatedSessionController::class, 'store'])
            ->middleware('throttle:5,1')
            ->name('login.store');

        Route::get('two-factor', [TwoFactorChallengeController::class, 'create'])->name('two-factor');
        Route::post('two-factor', [TwoFactorChallengeController::class, 'store'])
            ->middleware('throttle:5,1')
            ->name('two-factor.store');
    });

    // Reached from emailed links, so they work whoever is signed in on this browser.
    Route::get('invitation/{user}', [InvitationController::class, 'show'])->name('invitation.show');
    Route::post('invitation/{user}', [InvitationController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('invitation.store');
    Route::get('reset-password/{token}', [PasswordResetController::class, 'create'])->name('password.reset');
    Route::post('reset-password', [PasswordResetController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('password.update');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->middleware('auth')
        ->name('logout');

    Route::middleware(['auth', 'admin', 'admin.session'])->group(function (): void {
        Route::get('/', DashboardController::class)->name('dashboard');
        Route::get('dashboard', DashboardController::class)->name('dashboard.alias');

        // Every admin's own password, two-factor authentication and sessions.
        Route::prefix('account')->name('account.')->group(function (): void {
            Route::get('security', [AccountSecurityController::class, 'show'])->name('security');
            Route::put('password', [AccountSecurityController::class, 'updatePassword'])->name('password');
            Route::post('two-factor', [AccountSecurityController::class, 'startTwoFactor'])->name('two-factor.start');
            Route::post('two-factor/confirm', [AccountSecurityController::class, 'confirmTwoFactor'])->name('two-factor.confirm');
            Route::delete('two-factor/pending', [AccountSecurityController::class, 'cancelTwoFactor'])->name('two-factor.cancel');
            Route::delete('two-factor', [AccountSecurityController::class, 'disableTwoFactor'])->name('two-factor.disable');
            Route::post('two-factor/recovery-codes', [AccountSecurityController::class, 'regenerateRecoveryCodes'])->name('two-factor.recovery-codes');
            Route::delete('sessions', [AccountSecurityController::class, 'revokeOtherSessions'])->name('sessions.destroy-others');
            Route::delete('sessions/{session}', [AccountSecurityController::class, 'revokeSession'])->name('sessions.destroy');
        });

        // Each section is gated server-side by its permission: reading needs
        // "{section}.view", any change "{section}.manage" (see EnsureAdminPermission).
        Route::middleware('permission:projects')->group(function (): void {
            Route::patch('projects/reorder', [AdminProjectController::class, 'reorder'])->name('projects.reorder');
            Route::patch('projects/{project}/featured', [AdminProjectController::class, 'toggleFeatured'])->name('projects.featured');
            Route::patch('projects/{project}/status', [AdminProjectController::class, 'updateStatus'])->name('projects.status');
            Route::post('projects/{project}/duplicate', [AdminProjectController::class, 'duplicate'])->name('projects.duplicate');
            Route::resource('projects', AdminProjectController::class)->except('show');

            Route::patch('categories/reorder', [CategoryController::class, 'reorder'])->name('categories.reorder');
            Route::resource('categories', CategoryController::class)->except('show');
        });

        Route::middleware('permission:services')->group(function (): void {
            Route::patch('services/reorder', [AdminServiceController::class, 'reorder'])->name('services.reorder');
            Route::resource('services', AdminServiceController::class)->except('show');

            Route::patch('service-groups/reorder', [ServiceGroupController::class, 'reorder'])->name('service-groups.reorder');
            Route::resource('service-groups', ServiceGroupController::class)->except('show');

            Route::patch('sub-services/reorder', [SubServiceController::class, 'reorder'])->name('sub-services.reorder');
            Route::patch('sub-services/{sub_service}/status', [SubServiceController::class, 'updateStatus'])->name('sub-services.status');
            Route::post('sub-services/{sub_service}/duplicate', [SubServiceController::class, 'duplicate'])->name('sub-services.duplicate');
            Route::resource('sub-services', SubServiceController::class)->except('show');
        });

        Route::middleware('permission:media')->group(function (): void {
            Route::post('media/fetch', [MediaController::class, 'fetch'])->name('media.fetch');
            Route::resource('media', MediaController::class)->except('show');
        });

        Route::middleware('permission:pages')->group(function (): void {
            Route::get('pages/{page}/builder', [AdminPageController::class, 'builder'])->name('pages.builder');
            Route::post('pages/{page}/duplicate', [AdminPageController::class, 'duplicate'])->name('pages.duplicate');
            Route::patch('pages/{page}/visibility', [AdminPageController::class, 'toggleVisibility'])->name('pages.visibility');
            Route::patch('pages/{page}/sections/reorder', [PageSectionController::class, 'reorder'])->name('pages.sections.reorder');
            Route::post('pages/{page}/sections', [PageSectionController::class, 'store'])->name('pages.sections.store');
            Route::put('pages/{page}/sections/{section}', [PageSectionController::class, 'update'])->name('pages.sections.update');
            Route::delete('pages/{page}/sections/{section}', [PageSectionController::class, 'destroy'])->name('pages.sections.destroy');
            Route::resource('pages', AdminPageController::class)->except('show');

            Route::get('blocks', [GlobalBlockController::class, 'index'])->name('blocks.index');
            Route::put('blocks/{block}', [GlobalBlockController::class, 'update'])->name('blocks.update');
            Route::redirect('global-blocks', '/admin/blocks');
        });

        Route::middleware('permission:menus')->group(function (): void {
            Route::get('menus', [MenuController::class, 'index'])->name('menus.index');
            Route::put('menus', [MenuController::class, 'updateAll'])->name('menus.update-all');
            Route::put('menus/{location}', [MenuController::class, 'update'])->name('menus.update');
        });

        Route::middleware('permission:inquiries')->group(function (): void {
            Route::get('inquiries/export', [InquiryController::class, 'export'])->name('inquiries.export');
            Route::post('inquiries/import', [InquiryController::class, 'importCsv'])->name('inquiries.import');
            Route::get('inquiries', [InquiryController::class, 'index'])->name('inquiries.index');
            Route::redirect('inbox', '/admin/inquiries');
            Route::redirect('leads', '/admin/inquiries');
            Route::get('inquiries/{inquiry}', [InquiryController::class, 'show'])->name('inquiries.show');
            Route::patch('inquiries/{inquiry}/status', [InquiryController::class, 'updateStatus'])->name('inquiries.status');
            Route::patch('inquiries/{inquiry}/notes', [InquiryController::class, 'updateNotes'])->name('inquiries.notes');
            Route::delete('inquiries/{inquiry}', [InquiryController::class, 'destroy'])->name('inquiries.destroy');
        });

        Route::get('audit-logs', [AuditLogController::class, 'index'])
            ->middleware('permission:audit_logs')
            ->name('audit-logs.index');
        Route::delete('audit-logs', [AuditLogController::class, 'clear'])
            ->middleware('permission:audit_logs')
            ->name('audit-logs.clear');

        Route::middleware('permission:settings')->group(function (): void {
            Route::get('settings', [SettingController::class, 'edit'])->name('settings.edit');
            Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
        });

        Route::middleware('permission:email')->group(function (): void {
            Route::get('email-smtp', [MailSettingController::class, 'edit'])->name('mail.smtp');
            Route::put('email-smtp', [MailSettingController::class, 'update']);
            Route::get('mail', [MailSettingController::class, 'edit'])->name('mail.edit');
            Route::put('mail', [MailSettingController::class, 'update'])->name('mail.update');
            Route::post('mail/test', [MailSettingController::class, 'test'])->name('mail.test');
            Route::redirect('settings/email', '/admin/email-smtp');
            Route::redirect('mail/templates', '/admin/email-templates');

            Route::get('email-templates', [EmailTemplateController::class, 'index'])->name('email-templates.index');
            Route::put('email-templates', [EmailTemplateController::class, 'updateAll'])->name('email-templates.update-all');
            Route::put('email-templates/{template}', [EmailTemplateController::class, 'update'])->name('email-templates.update');
            Route::post('email-templates/{template}/preview', [EmailTemplateController::class, 'preview'])->name('email-templates.preview');

            Route::get('email-logs', [EmailLogController::class, 'index'])->name('email-logs.index');
            Route::get('email-logs/{emailLog}', [EmailLogController::class, 'show'])->name('email-logs.show');
        });

        // Custom code, users and roles stay with Super Admins only.
        Route::middleware('super-admin')->group(function (): void {
            Route::get('custom-code', [CodeSnippetController::class, 'index'])->name('custom-code.index');
            Route::get('custom-code/create', [CodeSnippetController::class, 'create'])->name('custom-code.create');
            Route::post('custom-code', [CodeSnippetController::class, 'store'])->name('custom-code.store');
            Route::patch('custom-code/master', [CodeSnippetController::class, 'master'])->name('custom-code.master');
            Route::post('custom-code/check', [CodeSnippetController::class, 'check'])->name('custom-code.check');
            Route::get('custom-code/{snippet}/edit', [CodeSnippetController::class, 'edit'])->name('custom-code.edit');
            Route::put('custom-code/{snippet}', [CodeSnippetController::class, 'update'])->name('custom-code.update');
            Route::delete('custom-code/{snippet}', [CodeSnippetController::class, 'destroy'])->name('custom-code.destroy');
            Route::post('custom-code/{snippet}/duplicate', [CodeSnippetController::class, 'duplicate'])->name('custom-code.duplicate');
            Route::patch('custom-code/{snippet}/toggle', [CodeSnippetController::class, 'toggle'])->name('custom-code.toggle');
            Route::post('custom-code/{snippet}/versions/{version}/restore', [CodeSnippetController::class, 'restore'])->name('custom-code.restore');

            Route::get('users', [UserController::class, 'index'])->name('users.index');
            Route::post('users', [UserController::class, 'store'])->name('users.store');
            Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
            Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
            Route::patch('users/{user}/suspend', [UserController::class, 'suspend'])->name('users.suspend');
            Route::patch('users/{user}/reactivate', [UserController::class, 'reactivate'])->name('users.reactivate');
            Route::post('users/{user}/invitation', [UserController::class, 'resendInvitation'])
                ->middleware('throttle:6,1')
                ->name('users.invitation');
            Route::post('users/{user}/password-reset', [UserController::class, 'sendPasswordReset'])
                ->middleware('throttle:6,1')
                ->name('users.password-reset');
            Route::delete('users/{user}/two-factor', [UserController::class, 'resetTwoFactor'])->name('users.two-factor');
            Route::get('users/{user}/sessions', [UserController::class, 'sessions'])->name('users.sessions');
            Route::delete('users/{user}/sessions', [UserController::class, 'revokeSessions'])->name('users.sessions.destroy-all');
            Route::delete('users/{user}/sessions/{session}', [UserController::class, 'revokeSession'])->name('users.sessions.destroy');
            Route::get('users/{user}/activity', [UserController::class, 'activity'])->name('users.activity');

            Route::post('roles', [AdminRoleController::class, 'store'])->name('roles.store');
            Route::put('roles/{role}', [AdminRoleController::class, 'update'])->name('roles.update');
            Route::delete('roles/{role}', [AdminRoleController::class, 'destroy'])->name('roles.destroy');
        });
    });
});

/*
|--------------------------------------------------------------------------
| CMS pages
|--------------------------------------------------------------------------
|
| A fallback rather than a catch-all `/{slug}`: it is reached only when no
| real route matched, so a page slug can never shadow one, and an unrouted
| POST still 404s instead of reporting a method mismatch.
|
*/

Route::fallback([PageController::class, 'show'])->name('pages.show');
