<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * Reusable site-wide content, addressed by key. The announcement banner is
 * the block every layout looks for.
 */
#[Fillable(['key', 'name', 'type', 'content', 'enabled'])]
class GlobalBlock extends Model
{
    public const ANNOUNCEMENT_KEY = 'announcement_banner';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'content' => 'array',
            'enabled' => 'boolean',
        ];
    }

    /**
     * The announcement banner's content when it is switched on, else null.
     *
     * @return array<string, mixed>|null
     */
    public static function announcement(): ?array
    {
        $block = self::query()
            ->where('key', self::ANNOUNCEMENT_KEY)
            ->where('enabled', true)
            ->first();

        return $block?->content ?: null;
    }

    /**
     * @return array{key: string, name: string, type: string, content: array<string, mixed>}
     */
    public function toPublicArray(): array
    {
        return [
            'key' => $this->key,
            'name' => $this->name,
            'type' => $this->type,
            'content' => $this->content ?? [],
        ];
    }
}
