<?php

namespace App\Enums;

/**
 * Every email the site sends. Each one is an editor-managed template built
 * from widgets (see EmailWidget) and rendered with the placeholders listed
 * here; unknown placeholders are left untouched.
 */
enum EmailTemplateKey: string
{
    case AdminLeadNotification = 'admin_lead_notification';
    case LeadAutoResponder = 'lead_auto_responder';
    case AdminInvitation = 'admin_invitation';
    case AdminPasswordReset = 'admin_password_reset';
    case SmtpTest = 'smtp_test';

    public function label(): string
    {
        return match ($this) {
            self::AdminLeadNotification => 'Admin: new lead notification',
            self::LeadAutoResponder => 'Customer: auto-responder',
            self::AdminInvitation => 'Admin: account invitation',
            self::AdminPasswordReset => 'Admin: password reset',
            self::SmtpTest => 'SMTP test message',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::AdminLeadNotification => 'Sent to the team the moment a lead is submitted.',
            self::LeadAutoResponder => 'Acknowledgement sent to the person who submitted the form.',
            self::AdminInvitation => 'Sent when a new admin user is invited, with the link to set a password.',
            self::AdminPasswordReset => 'Sent when a password reset is requested for an admin user.',
            self::SmtpTest => 'Sent from Email & SMTP to check the mail settings work.',
        };
    }

    /**
     * Whether an editor may switch this email off. Account and SMTP test
     * emails are always sent: without them nobody could sign in or check
     * the mail settings.
     */
    public function canBeDisabled(): bool
    {
        return match ($this) {
            self::AdminLeadNotification, self::LeadAutoResponder => true,
            default => false,
        };
    }

    /**
     * Placeholders available to this template, as `name => explanation`.
     *
     * @return array<string, string>
     */
    public function placeholders(): array
    {
        $site = [
            'site_name' => 'The site name from Settings',
            'contact_email' => 'The contact email from Settings',
        ];

        return match ($this) {
            self::AdminLeadNotification, self::LeadAutoResponder => [
                'name' => 'The name the lead submitted',
                'email' => 'The lead\'s email address',
                'phone' => 'The lead\'s phone number, if given',
                'company' => 'The lead\'s company, if given',
                'type' => 'The selected project type',
                'budget' => 'The selected budget range, if given',
                'message' => 'The message body',
                'source_page' => 'The page the form was submitted from',
                'submitted_at' => 'When the lead arrived',
                'admin_url' => 'Link to the lead in the admin panel',
                ...$site,
            ],
            self::AdminInvitation => [
                'name' => 'The invited person\'s name',
                'email' => 'The invited person\'s email address',
                'inviter_name' => 'Who sent the invitation',
                'action_url' => 'The one-time link to set a password',
                ...$site,
            ],
            self::AdminPasswordReset => [
                'name' => 'The account holder\'s name',
                'email' => 'The account holder\'s email address',
                'action_url' => 'The one-time link to choose a new password',
                ...$site,
            ],
            self::SmtpTest => [
                'recipient' => 'The address the test was sent to',
                'sent_at' => 'When the test was sent',
                ...$site,
            ],
        };
    }

    /**
     * Illustrative values for the admin preview.
     *
     * @return array<string, string>
     */
    public function sampleValues(): array
    {
        return match ($this) {
            self::AdminLeadNotification, self::LeadAutoResponder => [
                'name' => 'Ayesha Rahman',
                'email' => 'ayesha@example.com',
                'phone' => '+880 1700 000000',
                'company' => 'Northwind Studio',
                'type' => 'Web UI/UX',
                'budget' => '$10k – $25k',
                'message' => "We are relaunching our storefront and need a full UI system.\nCan you take this on next quarter?",
                'source_page' => '/contact',
                'submitted_at' => now()->format('d M Y, H:i'),
                'admin_url' => url('/admin/inquiries'),
            ],
            self::AdminInvitation => [
                'name' => 'Ayesha Rahman',
                'email' => 'ayesha@example.com',
                'inviter_name' => 'Marketorr Admin',
                'action_url' => url('/admin/invitation/sample'),
            ],
            self::AdminPasswordReset => [
                'name' => 'Ayesha Rahman',
                'email' => 'ayesha@example.com',
                'action_url' => url('/admin/reset-password/sample'),
            ],
            self::SmtpTest => [
                'recipient' => 'ayesha@example.com',
                'sent_at' => now()->format('d M Y, H:i'),
            ],
        };
    }

    /**
     * Subject and widgets used when the template has never been edited.
     *
     * @return array{subject: string, blocks: list<array<string, mixed>>}
     */
    public function defaults(): array
    {
        return match ($this) {
            self::AdminLeadNotification => [
                'subject' => 'New project inquiry: {{ name }}',
                'blocks' => [
                    ['type' => 'heading', 'text' => 'New project inquiry'],
                    ['type' => 'text', 'text' => '<strong>{{ name }}</strong> got in touch via {{ source_page }} on {{ submitted_at }}.'],
                    ['type' => 'details', 'rows' => [
                        ['label' => 'Name', 'value' => '{{ name }}'],
                        ['label' => 'Email', 'value' => '{{ email }}'],
                        ['label' => 'Phone', 'value' => '{{ phone }}'],
                        ['label' => 'Company', 'value' => '{{ company }}'],
                        ['label' => 'Project type', 'value' => '{{ type }}'],
                        ['label' => 'Budget', 'value' => '{{ budget }}'],
                    ]],
                    ['type' => 'quote', 'text' => '{{ message }}'],
                    ['type' => 'button', 'label' => 'Open in admin', 'url' => '{{ admin_url }}'],
                ],
            ],
            self::LeadAutoResponder => [
                'subject' => 'Thanks for reaching out to {{ site_name }}',
                'blocks' => [
                    ['type' => 'heading', 'text' => 'Thanks, {{ name }}.'],
                    ['type' => 'text', 'text' => "We have your note about <strong>{{ type }}</strong> and someone from the team will reply within 24–48 hours.\n\nIf anything changes in the meantime, just reply to this email or write to {{ contact_email }}."],
                    ['type' => 'text', 'text' => 'The {{ site_name }} team'],
                ],
            ],
            self::AdminInvitation => [
                'subject' => "You're invited to the {{ site_name }} admin panel",
                'blocks' => [
                    ['type' => 'heading', 'text' => 'Join the {{ site_name }} admin panel'],
                    ['type' => 'text', 'text' => 'Hi {{ name }}, {{ inviter_name }} has invited you to help manage the site. Set your password to activate your account.'],
                    ['type' => 'button', 'label' => 'Accept invitation', 'url' => '{{ action_url }}'],
                    ['type' => 'note', 'text' => 'This link expires in 7 days and works once. If you were not expecting it, you can ignore this email.'],
                    ['type' => 'note', 'text' => '{{ action_url }}'],
                ],
            ],
            self::AdminPasswordReset => [
                'subject' => 'Reset your {{ site_name }} admin password',
                'blocks' => [
                    ['type' => 'heading', 'text' => 'Reset your password'],
                    ['type' => 'text', 'text' => 'Hi {{ name }}, a password reset was requested for your admin account. Choose a new password to sign in again.'],
                    ['type' => 'button', 'label' => 'Choose a new password', 'url' => '{{ action_url }}'],
                    ['type' => 'note', 'text' => 'This link expires in 60 minutes. If you did not expect it, you can ignore this email: your password stays the same.'],
                    ['type' => 'note', 'text' => '{{ action_url }}'],
                ],
            ],
            self::SmtpTest => [
                'subject' => 'SMTP test: {{ site_name }}',
                'blocks' => [
                    ['type' => 'heading', 'text' => 'Your SMTP settings work'],
                    ['type' => 'text', 'text' => 'This is a test message from the {{ site_name }} admin panel. If you are reading it, emails are being delivered.'],
                    ['type' => 'note', 'text' => 'Sent to {{ recipient }} on {{ sent_at }}.'],
                ],
            ],
        };
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
