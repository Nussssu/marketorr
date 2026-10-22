<?php

namespace App\Enums;

/**
 * The admin panel's sections a role can be granted, each with a "view"
 * permission (read) and, where it has anything to change, "manage" (write).
 * Manage implies view.
 *
 * Custom Code and User Management are not listed: they stay with Super
 * Admins only, as does everything when the role is Super Admin.
 */
enum AdminSection: string
{
    case Inquiries = 'inquiries';
    case Pages = 'pages';
    case Projects = 'projects';
    case Services = 'services';
    case Media = 'media';
    case Menus = 'menus';
    case AuditLogs = 'audit_logs';
    case Settings = 'settings';
    case Email = 'email';

    public function label(): string
    {
        return match ($this) {
            self::Inquiries => 'Inbox',
            self::Pages => 'Pages & blocks',
            self::Projects => 'Projects & categories',
            self::Services => 'Services',
            self::Media => 'Media Library',
            self::Menus => 'Menus',
            self::AuditLogs => 'Audit Logs',
            self::Settings => 'Settings',
            self::Email => 'Email & SMTP',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Inquiries => 'Leads and contact form inquiries, notes, import and export.',
            self::Pages => 'Every page, its sections and SEO, and the global blocks.',
            self::Projects => 'Projects, the UI/UX showcase and project categories.',
            self::Services => 'Services, service tabs and sub-services.',
            self::Media => 'Uploading and managing files. Content editors usually need at least view, to pick images.',
            self::Menus => 'Header, footer and mega menus.',
            self::AuditLogs => 'Reading the activity history.',
            self::Settings => 'Site-wide settings, SEO defaults and social links.',
            self::Email => 'SMTP, email templates and the email log.',
        };
    }

    /**
     * Whether the section has anything to change, beyond viewing.
     */
    public function hasManage(): bool
    {
        return $this !== self::AuditLogs;
    }

    /**
     * Every permission key, e.g. "projects.view", "projects.manage".
     *
     * @return array<int, string>
     */
    public static function permissionKeys(): array
    {
        return collect(self::cases())
            ->flatMap(fn (self $section): array => $section->hasManage()
                ? ["{$section->value}.view", "{$section->value}.manage"]
                : ["{$section->value}.view"])
            ->all();
    }

    /**
     * What an Editor could reach before roles were customisable: everything
     * but Settings and Email & SMTP.
     *
     * @return array<int, string>
     */
    public static function editorDefaults(): array
    {
        return collect(self::permissionKeys())
            ->reject(fn (string $key): bool => str_starts_with($key, self::Settings->value.'.') || str_starts_with($key, self::Email->value.'.'))
            ->values()
            ->all();
    }

    /**
     * The sections for the role editor's permission grid.
     *
     * @return array<int, array{key: string, label: string, description: string, actions: array<int, string>}>
     */
    public static function matrix(): array
    {
        return array_map(fn (self $section): array => [
            'key' => $section->value,
            'label' => $section->label(),
            'description' => $section->description(),
            'actions' => $section->hasManage() ? ['view', 'manage'] : ['view'],
        ], self::cases());
    }
}
