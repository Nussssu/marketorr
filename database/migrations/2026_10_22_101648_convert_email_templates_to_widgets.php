<?php

use App\Enums\EmailTemplateKey;
use App\Services\EmailWidgetRenderer;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Email templates move from one HTML body to a list of widgets. A body still
 * on its shipped default becomes the new default widgets; a body an editor
 * rewrote is kept, unchanged, as a single Custom HTML widget.
 */
return new class extends Migration
{
    /** The bodies the templates shipped with, before widgets. */
    private const OLD_DEFAULTS = [
        'admin_lead_notification' => '<h1>New project inquiry</h1> <p><strong>{{ name }}</strong> got in touch via {{ source_page }} on {{ submitted_at }}.</p> <ul> <li><strong>Email:</strong> {{ email }}</li> <li><strong>Phone:</strong> {{ phone }}</li> <li><strong>Company:</strong> {{ company }}</li> <li><strong>Project type:</strong> {{ type }}</li> <li><strong>Budget:</strong> {{ budget }}</li> </ul> <p>{{ message }}</p>',
        'lead_auto_responder' => '<h1>Thanks, {{ name }}.</h1> <p>We have your note about <strong>{{ type }}</strong> and someone from the team will reply within 24–48 hours.</p> <p>For reference, this is what you sent us:</p> <blockquote>{{ message }}</blockquote> <p>If anything changes in the meantime, just reply to this email or write to {{ contact_email }}.</p> <p>The {{ site_name }} team</p>',
    ];

    public function up(): void
    {
        Schema::table('email_templates', function (Blueprint $table) {
            $table->json('blocks')->nullable()->after('subject');
        });

        DB::table('email_templates')->orderBy('id')->get()->each(function (object $row): void {
            $key = EmailTemplateKey::tryFrom($row->key);
            $body = trim((string) $row->body_html);
            $isDefault = $key !== null && $this->normalize($body) === (self::OLD_DEFAULTS[$key->value] ?? null);

            $blocks = $isDefault || $body === ''
                ? ($key?->defaults()['blocks'] ?? [])
                : [['type' => 'html', 'html' => $body]];

            DB::table('email_templates')->where('id', $row->id)->update(['blocks' => json_encode($blocks)]);
        });

        Schema::table('email_templates', function (Blueprint $table) {
            $table->dropColumn('body_html');
        });
    }

    public function down(): void
    {
        Schema::table('email_templates', function (Blueprint $table) {
            $table->longText('body_html')->nullable()->after('subject');
        });

        $renderer = app(EmailWidgetRenderer::class);

        DB::table('email_templates')->orderBy('id')->get()->each(function (object $row) use ($renderer): void {
            DB::table('email_templates')->where('id', $row->id)->update([
                'body_html' => $renderer->render(json_decode((string) $row->blocks, true) ?: [], []),
            ]);
        });

        Schema::table('email_templates', function (Blueprint $table) {
            $table->dropColumn('blocks');
        });
    }

    private function normalize(string $html): string
    {
        return trim((string) preg_replace('/\s+/', ' ', $html));
    }
};
