<?php

namespace App\Services;

use App\Enums\ContentStatus;
use App\Enums\SnippetLocation;
use App\Enums\SnippetTarget;
use App\Models\CodeSnippet;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\HtmlString;
use Throwable;

/**
 * Puts the published custom code snippets into the public pages.
 *
 * Site-wide snippets are written into the page by the root view. Snippets
 * aimed at particular pages go to the browser as a shared prop instead, so
 * they follow the visitor through in-app navigation, not just the first load.
 *
 * Nothing is ever injected into the admin panel, the master switch turns all
 * of it off at once, and a failure here never breaks a page.
 */
class CodeInjector
{
    private const CACHE_KEY = 'code-snippets';

    /**
     * Site-wide snippets for one placement, in priority order.
     */
    public function render(string $location, Request $request): HtmlString
    {
        if (! $this->shouldInject($request)) {
            return new HtmlString('');
        }

        try {
            $html = collect($this->liveSnippets())
                ->where('location', $location)
                ->where('target', SnippetTarget::All->value)
                ->pluck('html')
                ->implode("\n");

            return new HtmlString($html);
        } catch (Throwable $exception) {
            Log::error('Custom code could not be rendered', ['location' => $location, 'error' => $exception->getMessage()]);

            return new HtmlString('');
        }
    }

    /**
     * Snippets aimed at particular pages that apply to this request's page.
     *
     * @return array<int, array{id: int, location: string, html: string}>
     */
    public function pageSpecific(Request $request): array
    {
        if (! $this->shouldInject($request)) {
            return [];
        }

        try {
            $path = '/'.ltrim($request->path(), '/');

            return collect($this->liveSnippets())
                ->reject(fn (array $snippet): bool => $snippet['target'] === SnippetTarget::All->value)
                ->filter(fn (array $snippet): bool => CodeSnippet::targets(SnippetTarget::from($snippet['target']), $snippet['paths'], $path))
                ->map(fn (array $snippet): array => collect($snippet)->only(['id', 'location', 'html'])->all())
                ->values()
                ->all();
        } catch (Throwable $exception) {
            Log::error('Page-specific custom code could not be resolved', ['error' => $exception->getMessage()]);

            return [];
        }
    }

    /**
     * Drop the cached snippet list; called after any change.
     */
    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Public pages only, and only while the master switch is on.
     */
    private function shouldInject(Request $request): bool
    {
        if ($request->is('admin', 'admin/*')) {
            return false;
        }

        try {
            return (bool) (Setting::current()->custom_code_enabled ?? true);
        } catch (Throwable) {
            return false;
        }
    }

    /**
     * Every published, enabled snippet, ready to output, cached until the
     * next change so a page view costs one cache read.
     *
     * @return array<int, array{id: int, location: string, target: string, paths: array<int, string>, html: string}>
     */
    private function liveSnippets(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, fn (): array => CodeSnippet::query()
            ->where('status', ContentStatus::Published)
            ->where('enabled', true)
            ->orderBy('priority')
            ->orderBy('id')
            ->get()
            ->map(fn (CodeSnippet $snippet): array => [
                'id' => $snippet->id,
                'location' => $snippet->location->value,
                'target' => $snippet->target->value,
                'paths' => $snippet->target_paths ?? [],
                'html' => $snippet->renderedCode(),
            ])
            ->all());
    }

    /**
     * The placements in the order the page has them.
     *
     * @return array<int, string>
     */
    public static function locations(): array
    {
        return SnippetLocation::values();
    }
}
