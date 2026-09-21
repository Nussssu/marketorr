<?php

namespace App\Models;

use App\Enums\InquiryStatus;
use App\Enums\InquiryType;
use Database\Factories\ContactSubmissionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name', 'email', 'phone', 'company', 'type', 'budget',
    'message', 'source_page', 'status', 'admin_notes',
    'responded_at', 'ip_address', 'user_agent',
])]
class ContactSubmission extends Model
{
    /** @use HasFactory<ContactSubmissionFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => InquiryType::class,
            'status' => InquiryStatus::class,
            'responded_at' => 'datetime',
        ];
    }

    /**
     * The placeholder values the lead emails are rendered with.
     *
     * @return array<string, string|null>
     */
    public function mailPlaceholders(): array
    {
        $settings = Setting::current();

        return [
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'company' => $this->company,
            'type' => $this->type->value,
            'budget' => $this->budget,
            'message' => $this->message,
            'source_page' => $this->source_page,
            'submitted_at' => $this->created_at?->format('d M Y, H:i'),
            'site_name' => $settings->site_name,
            'contact_email' => $settings->contact_email,
        ];
    }

    /**
     * One row of the CSV export.
     *
     * @return array<int, string>
     */
    public function toCsvRow(): array
    {
        return [
            (string) $this->id,
            $this->created_at?->toDateTimeString() ?? '',
            $this->name,
            $this->email,
            $this->phone ?? '',
            $this->company ?? '',
            $this->type->value,
            $this->budget ?? '',
            str_replace(["\r\n", "\n", "\r"], ' ', $this->message),
            $this->source_page ?? '',
            $this->status->value,
        ];
    }

    /**
     * Header row matching `toCsvRow()`.
     *
     * @return array<int, string>
     */
    public static function csvHeader(): array
    {
        return [
            'ID', 'Received', 'Name', 'Email', 'Phone', 'Company',
            'Type', 'Budget', 'Message', 'Source page', 'Status',
        ];
    }
}
