<?php

namespace Tests\Unit;

use App\Services\RichTextSanitizer;
use PHPUnit\Framework\TestCase;

class RichTextSanitizerTest extends TestCase
{
    private function clean(string $html): string
    {
        return (new RichTextSanitizer)->clean($html);
    }

    public function test_plain_text_is_returned_as_written(): void
    {
        $this->assertSame("Line one\n\nLine two & more", $this->clean("Line one\n\nLine two & more"));
    }

    public function test_basic_formatting_is_kept(): void
    {
        $html = '<p>We <strong>build</strong> <em>brands</em>.</p><ul><li>One</li></ul><h2>Title</h2>';

        $this->assertSame($html, $this->clean($html));
    }

    public function test_scripts_styles_and_event_handlers_are_removed(): void
    {
        $clean = $this->clean('<p onclick="steal()" style="color:red">Hi<script>alert(1)</script></p><style>p{}</style><img src=x onerror=alert(1)>');

        $this->assertSame('<p>Hi</p>', $clean);
    }

    public function test_unsafe_link_addresses_are_dropped_and_new_tabs_are_isolated(): void
    {
        $this->assertSame('<a>bad</a>', $this->clean('<a href="javascript:alert(1)">bad</a>'));
        $this->assertSame('<a href="/contact">ok</a>', $this->clean('<a href="/contact" class="x">ok</a>'));
        $this->assertSame(
            '<a href="https://example.com" target="_blank" rel="noopener noreferrer">out</a>',
            $this->clean('<a href="https://example.com" target="_blank">out</a>'),
        );
    }

    public function test_unknown_wrappers_give_way_to_their_content(): void
    {
        $this->assertSame('<p>Kept <strong>bold</strong></p>', $this->clean('<div><p><span style="x">Kept</span> <strong>bold</strong></p></div>'));
    }

    public function test_text_that_only_looks_like_markup_stays_plain(): void
    {
        $this->assertSame('a < b', $this->clean('a < b'));
    }
}
