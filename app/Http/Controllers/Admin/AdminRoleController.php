<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AdminSection;
use App\Http\Controllers\Controller;
use App\Models\AdminRole;
use App\Models\UserActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Customisable admin roles and their per-section permissions (Super Admins
 * only). The Super Admin role always grants everything and cannot be
 * edited; a role still assigned to someone cannot be deleted.
 */
class AdminRoleController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        $role = AdminRole::query()->create([
            'name' => $validated['name'],
            'slug' => $this->uniqueSlug($validated['name']),
            'description' => $validated['description'] ?? null,
            'permissions' => $validated['permissions'],
            'is_system' => false,
        ]);

        UserActivityLog::record($request, 'role_created', null, ['name' => $role->name, 'permissions' => count($role->permissions ?? [])]);

        return back()->with('success', "Role \"{$role->name}\" created.");
    }

    public function update(Request $request, AdminRole $role): RedirectResponse
    {
        if ($role->isSuperAdmin()) {
            throw ValidationException::withMessages(['name' => 'The Super Admin role always has every permission and cannot be changed.']);
        }

        $validated = $this->validated($request, $role);
        $before = $role->grantedKeys();

        $role->update([
            'name' => $role->is_system ? $role->name : $validated['name'],
            'description' => $validated['description'] ?? null,
            'permissions' => $validated['permissions'],
        ]);

        UserActivityLog::record($request, 'role_updated', null, array_filter([
            'name' => $role->name,
            'added' => array_values(array_diff($role->grantedKeys(), $before)),
            'removed' => array_values(array_diff($before, $role->grantedKeys())),
        ]));

        return back()->with('success', "Role \"{$role->name}\" saved.");
    }

    public function destroy(Request $request, AdminRole $role): RedirectResponse
    {
        if ($role->is_system) {
            throw ValidationException::withMessages(['role' => 'System roles cannot be deleted.']);
        }

        if ($role->users()->exists()) {
            throw ValidationException::withMessages(['role' => 'Move everyone with this role to another role first.']);
        }

        UserActivityLog::record($request, 'role_deleted', null, ['name' => $role->name]);
        $role->delete();

        return back()->with('success', 'Role deleted.');
    }

    /**
     * @return array{name: string, description?: string|null, permissions: array<int, string>}
     */
    private function validated(Request $request, ?AdminRole $role = null): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:80', Rule::unique('admin_roles', 'name')->ignore($role)],
            'description' => ['nullable', 'string', 'max:255'],
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string', Rule::in(AdminSection::permissionKeys())],
        ]);

        // Manage implies view, so a managed section is always viewable too.
        $permissions = collect($validated['permissions'])
            ->flatMap(fn (string $key): array => str_ends_with($key, '.manage') ? [$key, Str::replaceLast('.manage', '.view', $key)] : [$key])
            ->unique()
            ->values()
            ->all();

        return [...$validated, 'permissions' => array_values(array_intersect(AdminSection::permissionKeys(), $permissions))];
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name, '_') ?: 'role';
        $slug = $base;
        $suffix = 2;

        while (AdminRole::query()->where('slug', $slug)->exists()) {
            $slug = $base.'_'.$suffix++;
        }

        return $slug;
    }
}
