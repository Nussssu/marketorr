<?php

namespace App\Models;

use App\Enums\EmailLogSource;
use App\Enums\EmailLogStatus;
use App\Mail\TemplatedMail;
use Database\Factories\EmailLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One entry in the email history: a message that was sent, failed or was
 * skipped, or an admin action on the email setup (SMTP or a template).
 */
#[Fillable([
    'status', 'source', 'recipients', 'from_address', 'subject', 'body',
    'error', 'mailer', 'meta', 'user_id', 'contact_submission_id',
])]
class EmailLog extends Model
{
    /** @use HasFactory<EmailLogFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => EmailLogStatus::class,
            'source' => EmailLogSource::class,
            'meta' => 'array',
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
     * @return BelongsTo<ContactSubmission, $this>
     */
    public function contactSubmission(): BelongsTo
    {
        return $this->belongsTo(ContactSubmission::class);
    }

    /**
     * The row the admin list shows; the body only comes with `$withBody`.
     *
     * @return array<string, mixed>
     */
    public function toAdminArray(bool $withBody = false): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'source' => $this->source->value,
            'sourceLabel' => $this->source->label(),
            'recipients' => $this->recipients,
            'from' => $this->from_address,
            'subject' => $this->subject,
            'error' => $this->error,
            'mailer' => $this->mailer,
            'meta' => $this->meta ?? [],
            'user' => $this->user?->name,
            'inquiryId' => $this->contact_submission_id,
            'createdAt' => $this->created_at?->format('d M Y, h:i A'),
            'createdAgo' => $this->created_at?->diffForHumans(),
            ...($withBody ? ['body' => $this->viewableBody()] : []),
        ];
    }

    /**
     * Entries logged before embedded images were stored with the body point
     * at `cid:` parts a browser cannot load. The only image emails embed is
     * the logo, so those references are shown with the current email logo.
     */
    private function viewableBody(): ?string
    {
        if ($this->body === null || ! str_contains($this->body, 'src="cid:')) {
            return $this->body;
        }

        $logoUrl = TemplatedMail::layoutData('')['logoUrl'];

        return $logoUrl === null
            ? $this->body
            : (string) preg_replace('/src="cid:[^"]*"/', 'src="'.e($logoUrl).'"', $this->body);
    }
}
