<?php

namespace App\Services;

use App\Enums\EmailLogSource;
use App\Enums\EmailLogStatus;
use App\Models\EmailLog;
use Illuminate\Mail\SentMessage;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;
use Throwable;

/**
 * Writes the email history the admin's Email Logs tab shows. Logging is
 * best-effort: a failure here is reported to the app log and never breaks
 * the email or the admin action being recorded.
 */
class EmailLogger
{
    /**
     * A message the mailer accepted, recorded from what was actually sent.
     *
     * @param  array<string, mixed>  $context
     */
    public function sent(EmailLogSource $source, ?SentMessage $sent, array $context = []): void
    {
        $message = $sent?->getOriginalMessage();

        $this->write([
            'status' => EmailLogStatus::Sent,
            'source' => $source,
            ...($message instanceof Email ? [
                'recipients' => $this->addresses($message->getTo()),
                'from_address' => $this->addresses($message->getFrom()),
                'subject' => $message->getSubject(),
                'body' => $message->getHtmlBody() ?? $message->getTextBody(),
            ] : []),
            ...$context,
        ]);
    }

    /**
     * A message that could not be sent, with the transport's reason.
     *
     * @param  array<string, mixed>  $context
     */
    public function failed(EmailLogSource $source, Throwable|string $error, array $context = []): void
    {
        $this->write([
            'status' => EmailLogStatus::Failed,
            'source' => $source,
            'error' => $error instanceof Throwable ? $error->getMessage() : $error,
            ...$context,
        ]);
    }

    /**
     * A message deliberately not sent, with why.
     *
     * @param  array<string, mixed>  $context
     */
    public function skipped(EmailLogSource $source, string $reason, array $context = []): void
    {
        $this->write([
            'status' => EmailLogStatus::Skipped,
            'source' => $source,
            'error' => $reason,
            ...$context,
        ]);
    }

    /**
     * An admin action on the email setup, attributed to whoever is signed in.
     *
     * @param  array<string, mixed>  $meta
     */
    public function activity(EmailLogSource $source, string $summary, array $meta = []): void
    {
        $this->write([
            'status' => EmailLogStatus::Activity,
            'source' => $source,
            'subject' => $summary,
            'meta' => $meta ?: null,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function write(array $attributes): void
    {
        try {
            EmailLog::query()->create([
                'user_id' => auth()->id(),
                'mailer' => $attributes['status'] === EmailLogStatus::Activity ? null : config('mail.default'),
                ...$attributes,
            ]);
        } catch (Throwable $exception) {
            Log::warning('Email log entry could not be written', ['error' => $exception->getMessage()]);
        }
    }

    /**
     * @param  array<int, Address>  $addresses
     */
    private function addresses(array $addresses): ?string
    {
        $list = implode(', ', array_map(fn (Address $address): string => $address->getAddress(), $addresses));

        return $list === '' ? null : $list;
    }
}
