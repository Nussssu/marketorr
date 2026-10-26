<?php

namespace App\Enums;

/**
 * Where an email log entry came from.
 */
enum EmailLogSource: string
{
    case LeadNotification = 'lead_notification';
    case LeadAutoResponder = 'lead_auto_responder';
    case SmtpTest = 'smtp_test';
    case SmtpSettings = 'smtp_settings';
    case EmailTemplate = 'email_template';
    case AdminInvitation = 'admin_invitation';
    case AdminPasswordReset = 'admin_password_reset';

    public function label(): string
    {
        return match ($this) {
            self::LeadNotification => 'Lead notification',
            self::LeadAutoResponder => 'Lead auto-reply',
            self::SmtpTest => 'SMTP test',
            self::SmtpSettings => 'SMTP settings',
            self::EmailTemplate => 'Email template',
            self::AdminInvitation => 'Admin invitation',
            self::AdminPasswordReset => 'Admin password reset',
        };
    }

    /**
     * The source an email template sends as.
     */
    public static function forTemplate(EmailTemplateKey $key): self
    {
        return match ($key) {
            EmailTemplateKey::AdminLeadNotification => self::LeadNotification,
            EmailTemplateKey::LeadAutoResponder => self::LeadAutoResponder,
            EmailTemplateKey::AdminInvitation => self::AdminInvitation,
            EmailTemplateKey::AdminPasswordReset => self::AdminPasswordReset,
            EmailTemplateKey::SmtpTest => self::SmtpTest,
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
