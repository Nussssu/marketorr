<x-mail::message>
# New project inquiry

**{{ $submission->name }}** got in touch through the website.

<x-mail::table>
| Field | Value |
| :---- | :---- |
| Name | {{ $submission->name }} |
| Email | {{ $submission->email }} |
| Company | {{ $submission->company ?: '—' }} |
| Project type | {{ $submission->type->value }} |
| Budget | {{ $submission->budget ?: '—' }} |
| Submitted | {{ $submission->created_at?->format('j M Y, H:i') }} |
</x-mail::table>

**Message**

{{ $submission->message }}

<x-mail::button :url="route('admin.inquiries.show', $submission)">
Open in admin
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
