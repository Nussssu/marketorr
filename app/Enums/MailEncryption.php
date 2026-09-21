<?php

namespace App\Enums;

enum MailEncryption: string
{
    case None = 'none';
    case Tls = 'tls';
    case Ssl = 'ssl';

    public function label(): string
    {
        return match ($this) {
            self::None => 'None',
            self::Tls => 'TLS',
            self::Ssl => 'SSL',
        };
    }

    /**
     * The value Laravel's SMTP transport expects — it wants null, not 'none'.
     */
    public function transportValue(): ?string
    {
        return $this === self::None ? null : $this->value;
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
