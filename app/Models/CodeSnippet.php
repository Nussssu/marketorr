<?php

namespace App\Models;

use App\Enums\ContentStatus;
use App\Enums\SnippetLocation;
use App\Enums\SnippetTarget;
use App\Enums\SnippetType;
use Database\Factories\CodeSnippetFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * One piece of custom code (CSS, JavaScript or HTML) injected into the
 * public pages it targets, at its placement, in priority order.
 */
#[Fillable([
    'name', 'description', 'type', 'location', 'code', 'priority',
    'target', 'target_paths', 'status', 'enabled', 'created_by', 'updated_by',
])]
class CodeSnippet extends Model
{
    /** @use HasFactory<CodeSnippetFactory> */
    use HasFactory;

    /** The fields a version snapshot keeps and a rollback restores. */
    public const VERSIONED = ['name', 'description', 'type', 'location', 'code', 'priority', 'target', 'target_paths', 'status', 'enabled'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => SnippetType::class,
            'location' => SnippetLocation::class,
            'target' => SnippetTarget::class,
            'status' => ContentStatus::class,
            'target_paths' => 'array',
            'enabled' => 'boolean',
            'priority' => 'integer',
        ];
    }

    /**
     * @return HasMany<CodeSnippetVersion, $this>
     */
    public function versions(): HasMany
    {
        return $this->hasMany(CodeSnippetVersion::class)->latest('version');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Whether the snippet runs on the public site at all.
     */
    public function isLive(): bool
    {
        return $this->enabled && $this->status === ContentStatus::Published;
    }

    /**
     * Whether the snippet runs on the given request path, e.g. "/services/branding".
     * Paths may end in `*` to cover everything beneath them.
     */
    public function appliesTo(string $path): bool
    {
        return self::targets($this->target, $this->target_paths ?? [], $path);
    }

    /**
     * @param  array<int, string>  $patterns
     */
    public static function targets(SnippetTarget $target, array $patterns, string $path): bool
    {
        if ($target === SnippetTarget::All) {
            return true;
        }

        $path = self::normalisePath($path);
        $matches = collect($patterns)
            ->map(fn (string $pattern): string => self::normalisePath($pattern))
            ->contains(fn (string $pattern): bool => Str::is($pattern, $path));

        return $target === SnippetTarget::Only ? $matches : ! $matches;
    }

    /**
     * "/Services/" and "services" both become "/services"; "/" stays "/".
     */
    public static function normalisePath(string $path): string
    {
        $path = '/'.trim(strtolower(trim($path)), '/');

        return $path === '' ? '/' : $path;
    }

    /**
     * The code as it goes into the page: CSS in a style tag, JavaScript in a
     * script tag, HTML as written. Each snippet is its own tag, so an error in
     * one never stops another from running.
     */
    public function renderedCode(): string
    {
        $marker = 'data-snippet="'.$this->id.'"';

        return match ($this->type) {
            SnippetType::Css => "<style {$marker}>\n{$this->code}\n</style>",
            SnippetType::Js => "<script {$marker}>\n{$this->code}\n</script>",
            SnippetType::Html => "<!-- snippet:{$this->id} -->\n{$this->code}\n<!-- /snippet:{$this->id} -->",
        };
    }

    /**
     * The fields a version stores, as plain values.
     *
     * @return array<string, mixed>
     */
    public function snapshot(): array
    {
        return collect(self::VERSIONED)
            ->mapWithKeys(fn (string $field): array => [$field => $this->getAttributes()[$field] ?? null])
            ->map(fn ($value, string $field) => $field === 'target_paths' && is_string($value) ? json_decode($value, true) : $value)
            ->all();
    }

    /**
     * Records the snippet's current state as its next version.
     */
    public function recordVersion(string $note, ?int $userId = null): CodeSnippetVersion
    {
        return $this->versions()->create([
            'version' => (int) $this->versions()->max('version') + 1,
            'snapshot' => $this->snapshot(),
            'note' => $note,
            'user_id' => $userId,
        ]);
    }

    /**
     * The row the admin list shows.
     *
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'type' => $this->type->value,
            'typeLabel' => $this->type->label(),
            'location' => $this->location->value,
            'locationLabel' => $this->location->label(),
            'priority' => $this->priority,
            'target' => $this->target->value,
            'targetLabel' => $this->target->label(),
            'targetPaths' => $this->target_paths ?? [],
            'status' => $this->status->value,
            'enabled' => $this->enabled,
            'live' => $this->isLive(),
            'size' => mb_strlen($this->code),
            'updatedBy' => $this->editor?->name,
            'updatedAt' => $this->updated_at?->diffForHumans(),
        ];
    }
}
