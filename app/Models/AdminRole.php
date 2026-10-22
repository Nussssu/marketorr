<?php

namespace App\Models;

use App\Enums\AdminSection;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * An admin role and the section permissions it grants. Super Admin and
 * Editor are system roles; Super Admin always grants everything.
 */
#[Fillable(['name', 'slug', 'description', 'permissions', 'is_system'])]
class AdminRole extends Model
{
    public const SUPER_ADMIN = 'super_admin';

    public const EDITOR = 'editor';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'permissions' => 'array',
            'is_system' => 'boolean',
        ];
    }

    /**
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->slug === self::SUPER_ADMIN;
    }

    /**
     * Whether the role grants a permission such as "projects.view". Manage
     * implies view.
     */
    public function grants(string $permission): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        $granted = $this->permissions ?? [];

        if (in_array($permission, $granted, true)) {
            return true;
        }

        return str_ends_with($permission, '.view')
            && in_array(substr($permission, 0, -strlen('.view')).'.manage', $granted, true);
    }

    /**
     * The permission keys this role grants, as the role editor shows them.
     *
     * @return array<int, string>
     */
    public function grantedKeys(): array
    {
        return $this->isSuperAdmin()
            ? AdminSection::permissionKeys()
            : array_values(array_intersect(AdminSection::permissionKeys(), $this->permissions ?? []));
    }

    public static function forSlug(string $slug): ?self
    {
        return self::query()->where('slug', $slug)->first();
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'permissions' => $this->grantedKeys(),
            'isSystem' => $this->is_system,
            'isSuperAdmin' => $this->isSuperAdmin(),
            'usersCount' => $this->users_count ?? $this->users()->count(),
        ];
    }
}
