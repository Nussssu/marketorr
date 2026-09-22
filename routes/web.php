<?php

use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
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
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
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
    });

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->middleware('auth')
        ->name('logout');

    Route::middleware(['auth', 'admin'])->group(function (): void {
        Route::get('/', DashboardController::class)->name('dashboard');
        Route::get('dashboard', DashboardController::class)->name('dashboard.alias');

        Route::patch('projects/reorder', [AdminProjectController::class, 'reorder'])->name('projects.reorder');
        Route::patch('projects/{project}/featured', [AdminProjectController::class, 'toggleFeatured'])->name('projects.featured');
        Route::resource('projects', AdminProjectController::class)->except('show');

        Route::patch('services/reorder', [AdminServiceController::class, 'reorder'])->name('services.reorder');
        Route::resource('services', AdminServiceController::class)->except('show');

        Route::post('media/fetch', [MediaController::class, 'fetch'])->name('media.fetch');
        Route::resource('media', MediaController::class)->except('show');

        Route::patch('categories/reorder', [CategoryController::class, 'reorder'])->name('categories.reorder');
        Route::resource('categories', CategoryController::class)->except('show');

        Route::get('pages/{page}/builder', [AdminPageController::class, 'builder'])->name('pages.builder');
        Route::patch('pages/{page}/sections/reorder', [PageSectionController::class, 'reorder'])->name('pages.sections.reorder');
        Route::post('pages/{page}/sections', [PageSectionController::class, 'store'])->name('pages.sections.store');
        Route::put('pages/{page}/sections/{section}', [PageSectionController::class, 'update'])->name('pages.sections.update');
        Route::delete('pages/{page}/sections/{section}', [PageSectionController::class, 'destroy'])->name('pages.sections.destroy');
        Route::resource('pages', AdminPageController::class)->except('show');

        Route::get('menus', [MenuController::class, 'index'])->name('menus.index');
        Route::put('menus/{location}', [MenuController::class, 'update'])->name('menus.update');

        Route::get('blocks', [GlobalBlockController::class, 'index'])->name('blocks.index');
        Route::put('blocks/{block}', [GlobalBlockController::class, 'update'])->name('blocks.update');
        Route::redirect('global-blocks', '/admin/blocks');

        Route::get('inquiries/export', [InquiryController::class, 'export'])->name('inquiries.export');
        Route::get('inquiries', [InquiryController::class, 'index'])->name('inquiries.index');
        Route::redirect('inbox', '/admin/inquiries');
        Route::redirect('leads', '/admin/inquiries');
        Route::get('inquiries/{inquiry}', [InquiryController::class, 'show'])->name('inquiries.show');
        Route::patch('inquiries/{inquiry}/status', [InquiryController::class, 'updateStatus'])->name('inquiries.status');
        Route::patch('inquiries/{inquiry}/notes', [InquiryController::class, 'updateNotes'])->name('inquiries.notes');
        Route::delete('inquiries/{inquiry}', [InquiryController::class, 'destroy'])->name('inquiries.destroy');

        Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

        Route::middleware('super-admin')->group(function (): void {
            Route::get('settings', [SettingController::class, 'edit'])->name('settings.edit');
            Route::put('settings', [SettingController::class, 'update'])->name('settings.update');

            Route::get('email-smtp', [MailSettingController::class, 'edit'])->name('mail.smtp');
            Route::put('email-smtp', [MailSettingController::class, 'update']);
            Route::get('mail', [MailSettingController::class, 'edit'])->name('mail.edit');
            Route::put('mail', [MailSettingController::class, 'update'])->name('mail.update');
            Route::post('mail/test', [MailSettingController::class, 'test'])->name('mail.test');
            Route::redirect('settings/email', '/admin/email-smtp');
            Route::redirect('mail/templates', '/admin/email-templates');

            Route::get('email-templates', [EmailTemplateController::class, 'index'])->name('email-templates.index');
            Route::put('email-templates/{template}', [EmailTemplateController::class, 'update'])->name('email-templates.update');

            Route::get('users', [UserController::class, 'index'])->name('users.index');
            Route::post('users', [UserController::class, 'store'])->name('users.store');
            Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
            Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
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
