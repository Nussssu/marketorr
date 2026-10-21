<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One saved state of a custom code snippet, kept so any earlier version can
 * be looked at again and restored.
 */
#[Fillable(['code_snippet_id', 'version', 'snapshot', 'note', 'user_id'])]
class CodeSnippetVersion extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'snapshot' => 'array',
            'version' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<CodeSnippet, $this>
     */
    public function snippet(): BelongsTo
    {
        return $this->belongsTo(CodeSnippet::class, 'code_snippet_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
