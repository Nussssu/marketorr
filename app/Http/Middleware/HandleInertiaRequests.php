<?php

namespace App\Http\Middleware;

use App\Models\GlobalBlock;
use App\Models\Menu;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],
            'settings' => fn () => Setting::current()->toPublicArray(),
            // Header and footer navigation, keyed by location.
            'menus' => fn () => Menu::publicTree(),
            // The site-wide banner, or null when it is switched off.
            'announcement' => fn () => GlobalBlock::announcement(),
            // The header and footer Services menus list the two disciplines and
            // their sub-services, each linking straight to its page. Fields
            // stay minimal — only what the menus render.
            'serviceCategories' => fn () => collect(config('subservices'))
                ->map(fn (array $category) => [
                    'slug' => $category['slug'],
                    'name' => $category['name'],
                    'short' => $category['tagline'] ?? null,
                    'accent' => $category['accent'] ?? null,
                    'items' => collect($category['items'] ?? [])
                        ->map(fn (array $item) => [
                            'slug' => $item['slug'],
                            'name' => $item['name'],
                            'accent' => $item['accent'] ?? null,
                        ])
                        ->values(),
                ])
                ->values(),
            'auth' => [
                'user' => fn () => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role->value,
                    'isSuperAdmin' => $request->user()->isSuperAdmin(),
                ] : null,
            ],
        ];
    }
}
