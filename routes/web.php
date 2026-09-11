<?php

use App\Http\Controllers\ContactController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

$projectSlugs = implode('|', [
    'imperial-jute-b2b-seo',
    'commercial-cleaning-seo',
    'all-city-duct-cleaning-ads',
    'city-online-brand-design',
    'city-online-web',
    'dusty-vision',
    'virgin-trend',
    'imperial-jute-brand-design',
    'un-point-brand-design',
    'nature-to-near',
    'sabdita-fashion',
    'animateuix-brand-design',
    'ecohub-essentials',
    'photo-fix-zone',
]);
$serviceSlugs = 'branding|web-ui-ux|software-ui-ux|mobile-app-ui-ux';

Route::get('/', fn () => Inertia::render('Home'))->name('home');

Route::get('/about', fn () => Inertia::render('About'))->name('about');

Route::get('/services', fn () => Inertia::render('Services/Index'))->name('services.index');

Route::get('/work', fn () => Inertia::render('Work/Index'))->name('work.index');
Route::get('/work/{slug}', fn (string $slug) => Inertia::render('Work/Show', [
    'slug' => $slug,
]))->where('slug', $projectSlugs)->name('work.show');

Route::get('/services/{slug}', fn (string $slug) => Inertia::render('Services/Show', [
    'slug' => $slug,
]))->where('slug', $serviceSlugs)->name('services.show');

Route::get('/contact', fn () => Inertia::render('ContactPage'))->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

Route::get('/privacy', fn () => Inertia::render('Privacy'))->name('privacy');
Route::get('/terms', fn () => Inertia::render('Terms'))->name('terms');
