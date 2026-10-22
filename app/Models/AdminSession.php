<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One signed-in admin session (browser), tracked so it can be listed and
 * revoked whatever session driver the site uses. Only a hash of the session
 * id is kept.
 */
#[Fillable(['user_id', 'session_hash', 'ip_address', 'user_agent', 'last_active_at', 'revoked_at'])]
class AdminSession extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_active_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function hashFor(string $sessionId): string
    {
        return hash('sha256', $sessionId);
    }

    /**
     * A readable device summary from the user agent, e.g. "Chrome on Windows".
     */
    public function device(): string
    {
        $agent = (string) $this->user_agent;

        $browser = match (true) {
            str_contains($agent, 'Edg/') => 'Edge',
            str_contains($agent, 'OPR/') || str_contains($agent, 'Opera') => 'Opera',
            str_contains($agent, 'Firefox/') => 'Firefox',
            str_contains($agent, 'Chrome/') => 'Chrome',
            str_contains($agent, 'Safari/') => 'Safari',
            default => 'Browser',
        };

        $platform = match (true) {
            str_contains($agent, 'Windows') => 'Windows',
            str_contains($agent, 'iPhone') || str_contains($agent, 'iPad') => 'iOS',
            str_contains($agent, 'Mac OS') => 'macOS',
            str_contains($agent, 'Android') => 'Android',
            str_contains($agent, 'Linux') => 'Linux',
            default => 'Unknown device',
        };

        return "{$browser} on {$platform}";
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(?string $currentHash = null): array
    {
        return [
            'id' => $this->id,
            'device' => $this->device(),
            'ip' => $this->ip_address,
            'lastActive' => $this->last_active_at?->diffForHumans(),
            'lastActiveAt' => $this->last_active_at?->format('d M Y, h:i A'),
            'startedAt' => $this->created_at?->format('d M Y, h:i A'),
            'current' => $currentHash !== null && $this->session_hash === $currentHash,
        ];
    }
}
