<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;

/**
 * One admin action on custom code (create, edit, publish, enable, placement
 * change, delete, ...), kept for the Audit Logs. It outlives the snippet, and
 * never stores the code itself: only that it changed and by how much.
 */
#[Fillable(['code_snippet_id', 'snippet_name', 'action', 'changes', 'user_id', 'ip_address'])]
class CodeSnippetAuditLog extends Model
{
    /** The fields whose old and new values are safe to show in the log. */
    private const VISIBLE = ['name', 'description', 'type', 'location', 'priority', 'target', 'target_paths', 'status', 'enabled'];

    /** The fields that decide where a snippet runs. */
    private const PLACEMENT = ['location', 'priority', 'target', 'target_paths'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'changes' => 'array',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Records one action on a snippet. `$before` is the snapshot taken before
     * the change; without it, the snippet's current state is logged instead.
     *
     * @param  array<string, mixed>|null  $before
     */
    public static function record(Request $request, string $action, ?CodeSnippet $snippet, ?array $before = null, ?string $snippetName = null): self
    {
        $after = $snippet?->snapshot() ?? [];

        return self::query()->create([
            'code_snippet_id' => $snippet?->exists ? $snippet->id : null,
            'snippet_name' => $snippetName ?? $snippet?->name ?? ($before['name'] ?? null),
            'action' => $action,
            'changes' => $before === null ? self::summary($after) : self::diff($before, $after),
            'user_id' => $request->user()?->id,
            'ip_address' => $request->ip(),
        ]);
    }

    /**
     * The most telling action for an edit: publishing and enabling outrank a
     * placement change, which outranks a plain edit.
     *
     * @param  array<string, mixed>  $before
     * @param  array<string, mixed>  $after
     */
    public static function actionFor(array $before, array $after): string
    {
        $changed = array_keys(self::diff($before, $after));

        return match (true) {
            in_array('status', $changed, true) => self::plain('status', $after['status'] ?? null) === 'published' ? 'published' : 'unpublished',
            in_array('enabled', $changed, true) => self::plain('enabled', $after['enabled'] ?? null) ? 'enabled' : 'disabled',
            array_intersect(self::PLACEMENT, $changed) !== [] => 'placement_changed',
            default => 'updated',
        };
    }

    /**
     * Field-by-field changes; the code shows only its length before and after.
     *
     * @param  array<string, mixed>  $before
     * @param  array<string, mixed>  $after
     * @return array<string, array{from: mixed, to: mixed}>
     */
    public static function diff(array $before, array $after): array
    {
        $changes = [];

        foreach (self::VISIBLE as $field) {
            $from = self::plain($field, $before[$field] ?? null);
            $to = self::plain($field, $after[$field] ?? null);

            if ($from !== $to) {
                $changes[$field] = ['from' => $from, 'to' => $to];
            }
        }

        $codeBefore = (string) ($before['code'] ?? '');
        $codeAfter = (string) ($after['code'] ?? '');

        if ($codeBefore !== $codeAfter) {
            $changes['code'] = ['from' => mb_strlen($codeBefore).' chars', 'to' => mb_strlen($codeAfter).' chars'];
        }

        return $changes;
    }

    /**
     * The snippet's visible fields as they stand, for a create or delete.
     *
     * @param  array<string, mixed>  $state
     * @return array<string, mixed>
     */
    private static function summary(array $state): array
    {
        if ($state === []) {
            return [];
        }

        return [
            ...collect(self::VISIBLE)->mapWithKeys(fn (string $field): array => [$field => self::plain($field, $state[$field] ?? null)])->all(),
            'code' => mb_strlen((string) ($state['code'] ?? '')).' chars',
        ];
    }

    /**
     * One raw attribute as a comparable value, whether it came from the
     * database or from the request.
     */
    private static function plain(string $field, mixed $value): mixed
    {
        if ($value instanceof \BackedEnum) {
            return $value->value;
        }

        return match ($field) {
            'enabled' => $value === null ? null : (bool) $value,
            'priority' => $value === null ? null : (int) $value,
            'target_paths' => is_string($value) ? (json_decode($value, true) ?: []) : ($value ?: []),
            default => $value,
        };
    }

    /**
     * A readable label for the action, e.g. "placement_changed" → "Placement changed".
     */
    public function actionLabel(): string
    {
        return ucfirst(str_replace('_', ' ', $this->action));
    }

    /**
     * The changes as one line for the Audit Logs list.
     */
    public function changesLine(): string
    {
        $format = fn (mixed $value): string => match (true) {
            is_bool($value) => $value ? 'on' : 'off',
            is_array($value) => $value === [] ? '—' : implode(', ', $value),
            $value === null || $value === '' => '—',
            default => (string) $value,
        };

        return collect($this->changes ?? [])
            ->map(fn (mixed $change, string $field): string => is_array($change) && array_key_exists('from', $change)
                ? "{$field}: {$format($change['from'])} → {$format($change['to'])}"
                : "{$field}: {$format($change)}")
            ->implode(' · ');
    }
}
