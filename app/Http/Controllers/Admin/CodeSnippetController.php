<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Enums\SnippetLocation;
use App\Enums\SnippetTarget;
use App\Enums\SnippetType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveCodeSnippetRequest;
use App\Models\CodeSnippet;
use App\Models\CodeSnippetAuditLog;
use App\Models\CodeSnippetVersion;
use App\Models\Page;
use App\Models\Project;
use App\Models\ServiceGroup;
use App\Models\Setting;
use App\Services\CodeInjector;
use App\Services\CodeSnippetValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Custom code snippets injected into the public site: CSS, JavaScript and
 * HTML (pixels, embeds), each with its placement, targeting and priority,
 * a draft/published state and a full version history.
 */
class CodeSnippetController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', Rule::in(['live', 'published', 'draft', 'disabled'])],
            'type' => ['nullable', Rule::enum(SnippetType::class)],
            'location' => ['nullable', Rule::enum(SnippetLocation::class)],
        ]);

        $snippets = CodeSnippet::query()
            ->with('editor:id,name')
            ->when($filters['search'] ?? null, fn ($query, string $search) => $query->where(fn ($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%")))
            ->when($filters['type'] ?? null, fn ($query, string $type) => $query->where('type', $type))
            ->when($filters['location'] ?? null, fn ($query, string $location) => $query->where('location', $location))
            ->when($filters['status'] ?? null, fn ($query, string $status) => match ($status) {
                'live' => $query->where('status', ContentStatus::Published)->where('enabled', true),
                'disabled' => $query->where('enabled', false),
                default => $query->where('status', $status),
            })
            ->orderBy('location')
            ->orderBy('priority')
            ->orderBy('id')
            ->get()
            ->map(fn (CodeSnippet $snippet) => [...$snippet->toAdminArray(), 'code' => $snippet->code]);

        return Inertia::render('Admin/CustomCode/Index', [
            'snippets' => $snippets,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? '',
                'type' => $filters['type'] ?? '',
                'location' => $filters['location'] ?? '',
            ],
            'masterEnabled' => (bool) Setting::current()->custom_code_enabled,
            // Adding and editing happen in a popup on this page; these open it.
            'openNew' => $request->boolean('new'),
            'openSnippet' => $request->integer('edit') ?: null,
            'pageOptions' => $this->pageOptions(),
            ...$this->options(),
        ]);
    }

    /**
     * Adding opens the popup on the list.
     */
    public function create(): RedirectResponse
    {
        return redirect()->route('admin.custom-code.index', ['new' => 1]);
    }

    public function store(SaveCodeSnippetRequest $request): RedirectResponse
    {
        $snippet = DB::transaction(function () use ($request): CodeSnippet {
            $snippet = CodeSnippet::query()->create([
                ...$request->validated(),
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]);
            $snippet->recordVersion('Created', $request->user()->id);
            CodeSnippetAuditLog::record($request, 'created', $snippet);

            return $snippet;
        });

        CodeInjector::forget();

        return redirect()
            ->route('admin.custom-code.index')
            ->with('success', $snippet->isLive() ? 'Snippet published.' : 'Snippet saved as a draft.');
    }

    /**
     * Editing opens the popup on the list.
     */
    public function edit(CodeSnippet $snippet): RedirectResponse
    {
        return redirect()->route('admin.custom-code.index', ['edit' => $snippet->id]);
    }

    public function update(SaveCodeSnippetRequest $request, CodeSnippet $snippet): RedirectResponse
    {
        DB::transaction(function () use ($request, $snippet): void {
            $before = $snippet->snapshot();
            $snippet->fill([...$request->validated(), 'updated_by' => $request->user()->id]);

            if (! $snippet->isDirty(CodeSnippet::VERSIONED)) {
                return;
            }

            $snippet->save();
            $snippet->recordVersion('Updated', $request->user()->id);
            CodeSnippetAuditLog::record($request, CodeSnippetAuditLog::actionFor($before, $snippet->snapshot()), $snippet, $before);
        });

        CodeInjector::forget();

        return back()->with('success', $snippet->isLive() ? 'Snippet saved and live.' : 'Snippet saved.');
    }

    public function destroy(Request $request, CodeSnippet $snippet): RedirectResponse
    {
        DB::transaction(function () use ($request, $snippet): void {
            CodeSnippetAuditLog::record($request, 'deleted', $snippet);
            $snippet->delete();
        });
        CodeInjector::forget();

        return redirect()->route('admin.custom-code.index')->with('success', 'Snippet deleted.');
    }

    /**
     * A copy starts as a disabled draft, so it never runs twice by accident.
     */
    public function duplicate(Request $request, CodeSnippet $snippet): RedirectResponse
    {
        $copy = DB::transaction(function () use ($request, $snippet): CodeSnippet {
            $copy = $snippet->replicate(['created_by', 'updated_by']);
            $copy->name = $snippet->name.' (Copy)';
            $copy->status = ContentStatus::Draft;
            $copy->enabled = false;
            $copy->created_by = $request->user()->id;
            $copy->updated_by = $request->user()->id;
            $copy->save();
            $copy->recordVersion("Copied from \"{$snippet->name}\"", $request->user()->id);
            CodeSnippetAuditLog::record($request, 'duplicated', $copy);

            return $copy;
        });

        return redirect()->route('admin.custom-code.index', ['edit' => $copy->id])->with('success', 'Snippet copied as a disabled draft.');
    }

    /**
     * Switch one snippet on or off straight from the list.
     */
    public function toggle(Request $request, CodeSnippet $snippet, CodeSnippetValidator $validator): RedirectResponse
    {
        $validated = $request->validate(['enabled' => ['required', 'boolean']]);

        if ($validated['enabled'] && $snippet->status === ContentStatus::Published) {
            $this->ensurePublishable($validator, $snippet->type, $snippet->code);
        }

        DB::transaction(function () use ($request, $snippet, $validated): void {
            $before = $snippet->snapshot();
            $snippet->update(['enabled' => $validated['enabled'], 'updated_by' => $request->user()->id]);
            $snippet->recordVersion($validated['enabled'] ? 'Enabled' : 'Disabled', $request->user()->id);
            CodeSnippetAuditLog::record($request, $validated['enabled'] ? 'enabled' : 'disabled', $snippet, $before);
        });
        CodeInjector::forget();

        return back()->with('success', $validated['enabled'] ? 'Snippet enabled.' : 'Snippet disabled.');
    }

    /**
     * Roll back to an earlier version. The rollback is itself a new version,
     * so it can be undone the same way.
     */
    public function restore(Request $request, CodeSnippet $snippet, CodeSnippetVersion $version, CodeSnippetValidator $validator): RedirectResponse
    {
        abort_unless($version->code_snippet_id === $snippet->id, 404);

        // A rollback that would go live passes the same checks as publishing.
        $restored = collect($version->snapshot)->only(CodeSnippet::VERSIONED);
        $type = SnippetType::tryFrom((string) $restored->get('type'));

        abort_if($type === null, 422, 'This version cannot be restored.');

        if ($restored->get('status') === ContentStatus::Published->value && (bool) $restored->get('enabled', true)) {
            $this->ensurePublishable($validator, $type, (string) $restored->get('code'));
        }

        DB::transaction(function () use ($request, $snippet, $version): void {
            $before = $snippet->snapshot();
            $snippet->fill([
                ...collect($version->snapshot)->only(CodeSnippet::VERSIONED)->all(),
                'updated_by' => $request->user()->id,
            ])->save();
            $snippet->recordVersion("Restored version {$version->version}", $request->user()->id);
            CodeSnippetAuditLog::record($request, 'restored', $snippet, $before);
        });

        CodeInjector::forget();

        return back()->with('success', "Version {$version->version} restored.");
    }

    /**
     * The master switch: turns every snippet off (or back on) at once,
     * e.g. when a snippet breaks the site and needs finding.
     */
    public function master(Request $request): RedirectResponse
    {
        $validated = $request->validate(['enabled' => ['required', 'boolean']]);

        Setting::current()->update(['custom_code_enabled' => $validated['enabled']]);
        Setting::forgetCurrent();
        CodeSnippetAuditLog::record($request, $validated['enabled'] ? 'master_enabled' : 'master_disabled', null, snippetName: 'All custom code');

        return back()->with('success', $validated['enabled'] ? 'Custom code is running on the site again.' : 'All custom code is switched off on the site.');
    }

    /**
     * Live checks for the editor while typing.
     */
    public function check(Request $request, CodeSnippetValidator $validator): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::enum(SnippetType::class)],
            'code' => ['nullable', 'string', 'max:100000'],
        ]);

        return response()->json($validator->check(SnippetType::from($validated['type']), (string) ($validated['code'] ?? '')));
    }

    /**
     * Code going live must pass the publish checks, however it gets there.
     *
     * @throws ValidationException
     */
    private function ensurePublishable(CodeSnippetValidator $validator, SnippetType $type, string $code): void
    {
        $errors = $validator->check($type, $code)['errors'];

        if ($errors !== []) {
            throw ValidationException::withMessages(['code' => $errors]);
        }
    }

    /**
     * The site's pages a snippet can be aimed at, grouped for the dropdown:
     * whole sections, the CMS pages, each project and each service page.
     *
     * @return array<int, array{group: string, items: array<int, array{path: string, label: string}>}>
     */
    private function pageOptions(): array
    {
        $pages = Page::query()->published()->orderBy('sort_order')->orderBy('id')->get()
            ->map(fn (Page $page): array => ['path' => $page->slug === 'home' ? '/' : '/'.$page->slug, 'label' => $page->title])
            ->values()
            ->all();

        $projects = Project::query()->published()->orderBy('sort_order')->orderBy('id')->get()
            ->map(fn (Project $project): array => ['path' => $project->publicPath(), 'label' => $project->title])
            ->values()
            ->all();

        $services = collect(ServiceGroup::catalogue())
            ->flatMap(fn (array $group) => collect($group['items'] ?? [])->map(fn (array $item): array => [
                'path' => '/services/'.$group['slug'].'/'.$item['slug'],
                'label' => $group['name'].' · '.$item['name'],
            ]))
            ->values()
            ->all();

        return array_values(array_filter([
            ['group' => 'Whole sections', 'items' => [
                ['path' => '/work/*', 'label' => 'Every project page'],
                ['path' => '/services/*', 'label' => 'Every service page'],
            ]],
            ['group' => 'Pages', 'items' => $pages],
            ['group' => 'Projects', 'items' => $projects],
            ['group' => 'Services', 'items' => $services],
        ], fn (array $group): bool => $group['items'] !== []));
    }

    /**
     * @return array<string, mixed>
     */
    private function options(): array
    {
        $options = fn (array $cases): array => array_map(fn ($case): array => ['value' => $case->value, 'label' => $case->label()], $cases);

        return [
            'types' => $options(SnippetType::cases()),
            'locations' => $options(SnippetLocation::cases()),
            'targets' => $options(SnippetTarget::cases()),
        ];
    }
}
