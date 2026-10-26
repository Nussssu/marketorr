<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * One item in the trash: a soft-deleted record (or, for menu items, a
 * snapshot of it), who moved it there and when, and whatever its restore
 * needs to put back (links it had, children it held).
 */
#[Fillable(['type', 'trashable_type', 'trashable_id', 'label', 'detail', 'context', 'deleted_by'])]
class TrashEntry extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'context' => 'array',
        ];
    }

    /**
     * The trashed record itself, still in the table until deleted for good.
     *
     * @return MorphTo<Model, $this>
     */
    public function trashable(): MorphTo
    {
        return $this->morphTo()->withTrashed();
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function deleter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}
