<?php

namespace App\Enums;

/**
 * Where an admin account stands: invited (has not set a password yet),
 * active (may sign in) or suspended (blocked, every session ended).
 */
enum UserStatus: string
{
    case Active = 'active';
    case Invited = 'invited';
    case Suspended = 'suspended';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Invited => 'Invited',
            self::Suspended => 'Suspended',
        };
    }
}
