<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;

/**
 * Time-based one-time passwords (RFC 6238), as Google Authenticator, Authy,
 * 1Password and Microsoft Authenticator generate them: a shared base32
 * secret, 6 digits, a new code every 30 seconds. One step either side is
 * accepted for clock drift. Recovery codes are single-use fallbacks.
 */
class TwoFactorAuthenticator
{
    private const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    private const PERIOD = 30;

    private const DIGITS = 6;

    private const WINDOW = 1;

    /**
     * A new random secret, base32-encoded (160 bits).
     */
    public function generateSecret(): string
    {
        $bytes = random_bytes(20);
        $bits = '';

        foreach (str_split($bytes) as $byte) {
            $bits .= str_pad(decbin(ord($byte)), 8, '0', STR_PAD_LEFT);
        }

        return collect(str_split($bits, 5))
            ->map(fn (string $chunk): string => self::ALPHABET[bindec(str_pad($chunk, 5, '0'))])
            ->implode('');
    }

    /**
     * Whether `$code` is the current code for `$secret` (or one step either side).
     */
    public function verify(string $secret, string $code): bool
    {
        $code = preg_replace('/\s+/', '', $code) ?? '';

        if (! preg_match('/^\d{'.self::DIGITS.'}$/', $code)) {
            return false;
        }

        $step = intdiv(time(), self::PERIOD);

        for ($offset = -self::WINDOW; $offset <= self::WINDOW; $offset++) {
            if (hash_equals($this->codeAt($secret, $step + $offset), $code)) {
                return true;
            }
        }

        return false;
    }

    /**
     * The code for a given 30-second step.
     */
    public function codeAt(string $secret, int $step): string
    {
        $key = $this->base32Decode($secret);
        $counter = pack('N*', 0).pack('N*', $step);
        $hash = hash_hmac('sha1', $counter, $key, true);
        $offset = ord($hash[19]) & 0x0F;
        $value = ((ord($hash[$offset]) & 0x7F) << 24)
            | ((ord($hash[$offset + 1]) & 0xFF) << 16)
            | ((ord($hash[$offset + 2]) & 0xFF) << 8)
            | (ord($hash[$offset + 3]) & 0xFF);

        return str_pad((string) ($value % (10 ** self::DIGITS)), self::DIGITS, '0', STR_PAD_LEFT);
    }

    /**
     * The `otpauth://` link authenticator apps import the account from.
     */
    public function provisioningUri(string $issuer, string $account, string $secret): string
    {
        return 'otpauth://totp/'.rawurlencode($issuer.':'.$account)
            .'?secret='.$secret
            .'&issuer='.rawurlencode($issuer)
            .'&algorithm=SHA1&digits='.self::DIGITS.'&period='.self::PERIOD;
    }

    /**
     * Eight fresh single-use recovery codes, e.g. "K7Q2M-9XWPA".
     *
     * @return array<int, string>
     */
    public function generateRecoveryCodes(): array
    {
        return collect(range(1, 8))
            ->map(fn (): string => Str::upper(Str::random(5)).'-'.Str::upper(Str::random(5)))
            ->all();
    }

    /**
     * Check a code from the sign-in form: an authenticator code, or one of
     * the user's recovery codes (which is then used up).
     */
    public function attempt(User $user, string $code): bool
    {
        if (! $user->hasTwoFactor()) {
            return false;
        }

        if ($this->verify((string) $user->two_factor_secret, $code)) {
            return true;
        }

        $normalised = Str::upper(trim($code));
        $codes = $user->two_factor_recovery_codes ?? [];

        foreach ($codes as $index => $recovery) {
            if (hash_equals((string) $recovery, $normalised)) {
                unset($codes[$index]);
                $user->forceFill(['two_factor_recovery_codes' => array_values($codes)])->save();

                return true;
            }
        }

        return false;
    }

    private function base32Decode(string $secret): string
    {
        $secret = strtoupper(preg_replace('/[^A-Za-z2-7]/', '', $secret) ?? '');
        $bits = '';

        foreach (str_split($secret) as $character) {
            $bits .= str_pad(decbin((int) strpos(self::ALPHABET, $character)), 5, '0', STR_PAD_LEFT);
        }

        return collect(str_split($bits, 8))
            ->filter(fn (string $byte): bool => strlen($byte) === 8)
            ->map(fn (string $byte): string => chr(bindec($byte)))
            ->implode('');
    }
}
