<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;

/**
 * One admin account event for the Audit Logs: sign-ins, invitations, role
 * and status changes, password and two-factor changes, revoked sessions and
 * role edits. Never holds passwords, secrets or tokens.
 */
#[Fillable(['actor_id', 'user_id', 'subject_name', 'action', 'details', 'ip_address', 'user_agent'])]
class UserActivityLog extends Model
{
    /** Actions shown as warnings in the Audit Logs. */
    public const WARNING_ACTIONS = ['login_failed', 'suspended', 'deleted', 'sessions_revoked', 'session_revoked', 'two_factor_reset', 'two_factor_disabled', 'role_deleted'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'details' => 'array',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Record an event. `$subject` is the account it concerns; its name is
     * kept so the entry still reads after the account is deleted.
     *
     * @param  array<string, mixed>  $details
     */
    public static function record(Request $request, string $action, ?User $subject = null, array $details = [], ?User $actor = null): self
    {
        return self::query()->create([
            'actor_id' => ($actor ?? $request->user())?->id,
            'user_id' => $subject?->exists ? $subject->id : null,
            'subject_name' => $subject?->name ?? ($details['name'] ?? null),
            'action' => $action,
            'details' => $details === [] ? null : $details,
            'ip_address' => $request->ip(),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 500),
        ]);
    }

    /**
     * A readable label for the action, e.g. "two_factor_enabled" → "Two-factor enabled".
     */
    public function actionLabel(): string
    {
        return match ($this->action) {
            'login' => 'Signed in',
            'login_failed' => 'Failed sign-in',
            'logout' => 'Signed out',
            'invited' => 'Invited',
            'invitation_resent' => 'Invitation resent',
            'invitation_accepted' => 'Invitation accepted',
            'updated' => 'Account updated',
            'role_changed' => 'Role changed',
            'suspended' => 'Suspended',
            'reactivated' => 'Reactivated',
            'deleted' => 'Deleted',
            'password_reset_sent' => 'Password reset sent',
            'password_reset' => 'Password reset',
            'two_factor_enabled' => 'Two-factor enabled',
            'two_factor_disabled' => 'Two-factor disabled',
            'two_factor_reset' => 'Two-factor reset',
            'recovery_codes_regenerated' => 'Recovery codes regenerated',
            'session_revoked' => 'Session revoked',
            'sessions_revoked' => 'All sessions revoked',
            'role_created' => 'Role created',
            'role_updated' => 'Role updated',
            'role_deleted' => 'Role deleted',
            default => ucfirst(str_replace('_', ' ', $this->action)),
        };
    }

    /**
     * The details as one readable line.
     */
    public function detailsLine(): string
    {
        return collect($this->details ?? [])
            ->map(function (mixed $value, string $key): string {
                if (is_array($value) && array_key_exists('from', $value)) {
                    return "{$key}: ".($value['from'] ?? '—').' → '.($value['to'] ?? '—');
                }

                return "{$key}: ".(is_array($value) ? implode(', ', $value) : (is_bool($value) ? ($value ? 'yes' : 'no') : (string) $value));
            })
            ->implode(' · ');
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'label' => $this->actionLabel(),
            'details' => $this->detailsLine(),
            'actor' => $this->actor?->name,
            'subject' => $this->subject_name,
            'ip' => $this->ip_address,
            'at' => $this->created_at?->format('d M Y, h:i A'),
            'ago' => $this->created_at?->diffForHumans(),
            'warning' => in_array($this->action, self::WARNING_ACTIONS, true),
        ];
    }
}
