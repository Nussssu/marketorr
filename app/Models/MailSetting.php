<?php

namespace App\Models;

use App\Enums\MailEncryption;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;

/**
 * Single-row SMTP configuration (always id 1), applied over the mail config
 * at runtime by the app service provider. The password uses the `encrypted`
 * cast, so it is unreadable in the table and never leaves the server.
 */
#[Guarded([])]
class MailSetting extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'port' => 'integer',
            'encryption' => MailEncryption::class,
            'password' => 'encrypted',
            'last_tested_at' => 'datetime',
        ];
    }

    /**
     * The one SMTP row, created from defaults if it does not exist yet.
     *
     * Resolved from the container as a request-scoped instance rather than a
     * static, so a long-lived worker never serves another request's copy.
     */
    public static function current(): self
    {
        return app(self::class);
    }

    /**
     * Drop the request-scoped instance — used after an admin saves the form.
     */
    public static function forgetCurrent(): void
    {
        app()->forgetInstance(self::class);
    }

    /**
     * Read the SMTP row straight from the database, bypassing the container.
     */
    public static function loadFromDatabase(): self
    {
        return self::query()->firstOrCreate(['id' => 1], self::defaults());
    }

    /**
     * @return array<string, mixed>
     */
    public static function defaults(): array
    {
        return [
            'enabled' => false,
            'host' => null,
            'port' => 587,
            'encryption' => MailEncryption::Tls,
            'username' => null,
            'password' => null,
            'from_address' => null,
            'from_name' => null,
            'admin_notification_email' => null,
        ];
    }

    /**
     * Whether these settings are complete enough to send through.
     */
    public function isUsable(): bool
    {
        return $this->enabled && filled($this->host) && filled($this->port);
    }

    /**
     * The mail config overrides to merge, or an empty array when the stored
     * settings are off or incomplete and `.env` should keep winning.
     *
     * @return array<string, mixed>
     */
    public function configOverrides(): array
    {
        if (! $this->isUsable()) {
            return [];
        }

        $overrides = [
            'mail.default' => 'smtp',
            'mail.mailers.smtp.host' => $this->host,
            'mail.mailers.smtp.port' => $this->port,
            'mail.mailers.smtp.scheme' => $this->encryption->transportValue() === 'ssl' ? 'smtps' : 'smtp',
            'mail.mailers.smtp.encryption' => $this->encryption->transportValue(),
            'mail.mailers.smtp.username' => $this->username,
            'mail.mailers.smtp.password' => $this->password,
        ];

        if (filled($this->from_address)) {
            $overrides['mail.from.address'] = $this->from_address;
        }

        if (filled($this->from_name)) {
            $overrides['mail.from.name'] = $this->from_name;
        }

        return $overrides;
    }

    /**
     * Where admin lead notifications go — the dedicated inbox if one is set,
     * otherwise the site's public contact address.
     */
    public function notificationRecipient(): string
    {
        return $this->admin_notification_email ?: Setting::current()->contact_email;
    }

    /**
     * The shape the admin form binds to. The password is deliberately never
     * sent to the browser; a blank field means "leave it unchanged".
     *
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        return [
            'enabled' => $this->enabled,
            'host' => $this->host,
            'port' => $this->port,
            'encryption' => $this->encryption->value,
            'username' => $this->username,
            'hasPassword' => filled($this->password),
            'fromAddress' => $this->from_address,
            'fromName' => $this->from_name,
            'adminNotificationEmail' => $this->admin_notification_email,
            'lastTestedAt' => $this->last_tested_at?->diffForHumans(),
            'lastTestResult' => $this->last_test_result,
        ];
    }
}
