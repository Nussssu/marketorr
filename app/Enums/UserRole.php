<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Editor = 'editor';

    /**
     * Human label for admin UI selects.
     */
    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Editor => 'Editor',
        };
    }

    /**
     * Super admins additionally manage settings and other admin users.
     */
    public function canManageAdministration(): bool
    {
        return $this === self::SuperAdmin;
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
