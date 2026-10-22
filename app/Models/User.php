<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable([
    'name', 'email', 'password', 'role', 'admin_role_id', 'status', 'is_primary',
    'last_login_at', 'last_login_ip', 'invited_at', 'invited_by',
    'two_factor_secret', 'two_factor_recovery_codes', 'two_factor_confirmed_at',
])]
#[Hidden(['password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'status' => UserStatus::class,
            'is_primary' => 'boolean',
            'last_login_at' => 'datetime',
            'invited_at' => 'datetime',
            'two_factor_secret' => 'encrypted',
            'two_factor_recovery_codes' => 'encrypted:array',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<AdminRole, $this>
     */
    public function adminRole(): BelongsTo
    {
        return $this->belongsTo(AdminRole::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function inviter(): BelongsTo
    {
        return $this->belongsTo(self::class, 'invited_by');
    }

    /**
     * @return HasMany<AdminSession, $this>
     */
    public function adminSessions(): HasMany
    {
        return $this->hasMany(AdminSession::class);
    }

    /**
     * Whether this account may reach the admin panel at all.
     */
    public function isAdmin(): bool
    {
        return $this->role instanceof UserRole;
    }

    /**
     * Super admins additionally manage site settings and other admin users.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === UserRole::SuperAdmin;
    }

    /**
     * Whether the account may sign in and use the panel right now.
     */
    public function isActive(): bool
    {
        return ($this->status ?? UserStatus::Active) === UserStatus::Active;
    }

    /**
     * The protected primary Super Admin: never suspended, demoted or deleted.
     */
    public function isPrimary(): bool
    {
        return (bool) $this->is_primary;
    }

    public function hasTwoFactor(): bool
    {
        return $this->two_factor_confirmed_at !== null && filled($this->two_factor_secret);
    }

    /**
     * The role whose permissions apply: the assigned one, or the system role
     * matching the account's base role.
     */
    public function effectiveRole(): ?AdminRole
    {
        if ($this->isSuperAdmin()) {
            return $this->adminRole?->isSuperAdmin() ? $this->adminRole : AdminRole::forSlug(AdminRole::SUPER_ADMIN);
        }

        return $this->adminRole ?? AdminRole::forSlug(AdminRole::EDITOR);
    }

    /**
     * Whether the account holds a permission such as "projects.manage".
     * Super Admins hold every permission.
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return (bool) $this->effectiveRole()?->grants($permission);
    }

    /**
     * Every permission key the account holds, for the panel's navigation.
     *
     * @return array<int, string>
     */
    public function permissionKeys(): array
    {
        return $this->effectiveRole()?->grantedKeys() ?? [];
    }
}
