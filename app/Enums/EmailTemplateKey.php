<?php

namespace App\Enums;

/**
 * The transactional emails an editor can rewrite. Each key is rendered with
 * the placeholders listed here; unknown placeholders are left untouched.
 */
enum EmailTemplateKey: string
{
    case AdminLeadNotification = 'admin_lead_notification';
    case LeadAutoResponder = 'lead_auto_responder';

    public function label(): string
    {
        return match ($this) {
            self::AdminLeadNotification => 'Admin — new lead notification',
            self::LeadAutoResponder => 'Customer — auto-responder',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::AdminLeadNotification => 'Sent to the team the moment a lead is submitted.',
            self::LeadAutoResponder => 'Acknowledgement sent to the person who submitted the form.',
        };
    }

    /**
     * Placeholders available to this template, as `name => explanation`.
     *
     * @return array<string, string>
     */
    public function placeholders(): array
    {
        return [
            'name' => 'The name the lead submitted',
            'email' => 'The lead\'s email address',
            'phone' => 'The lead\'s phone number, if given',
            'company' => 'The lead\'s company, if given',
            'type' => 'The selected project type',
            'budget' => 'The selected budget range, if given',
            'message' => 'The message body',
            'source_page' => 'The page the form was submitted from',
            'submitted_at' => 'When the lead arrived',
            'site_name' => 'The site name from Settings',
            'contact_email' => 'The contact email from Settings',
        ];
    }

    /**
     * Subject and body used when the template has never been edited.
     *
     * @return array{subject: string, body_html: string}
     */
    public function defaults(): array
    {
        return match ($this) {
            self::AdminLeadNotification => [
                'subject' => 'New project inquiry — {{ name }}',
                'body_html' => <<<'HTML'
                    <h1>New project inquiry</h1>
                    <p><strong>{{ name }}</strong> got in touch via {{ source_page }} on {{ submitted_at }}.</p>
                    <ul>
                        <li><strong>Email:</strong> {{ email }}</li>
                        <li><strong>Phone:</strong> {{ phone }}</li>
                        <li><strong>Company:</strong> {{ company }}</li>
                        <li><strong>Project type:</strong> {{ type }}</li>
                        <li><strong>Budget:</strong> {{ budget }}</li>
                    </ul>
                    <p>{{ message }}</p>
                    HTML,
            ],
            self::LeadAutoResponder => [
                'subject' => 'Thanks for reaching out to {{ site_name }}',
                'body_html' => <<<'HTML'
                    <h1>Thanks, {{ name }}.</h1>
                    <p>We have your note about <strong>{{ type }}</strong> and someone from the team will reply within 24–48 hours.</p>
                    <p>For reference, this is what you sent us:</p>
                    <blockquote>{{ message }}</blockquote>
                    <p>If anything changes in the meantime, just reply to this email or write to {{ contact_email }}.</p>
                    <p>— The {{ site_name }} team</p>
                    HTML,
            ],
        };
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
