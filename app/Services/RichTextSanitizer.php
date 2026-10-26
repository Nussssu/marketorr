<?php

namespace App\Services;

use DOMDocument;
use DOMElement;
use DOMNode;

/**
 * Cleans rich text written in the page builder before it is stored and
 * rendered as HTML on the site: only basic formatting survives (paragraphs,
 * bold, italic, underline, links, lists, headings, quotes), every attribute
 * but a link's address is dropped, and scripts, styles and embeds go
 * entirely. Text with no markup is returned as it was written.
 */
class RichTextSanitizer
{
    /** Elements kept, with the attributes each may carry. */
    private const ALLOWED = [
        'p' => [], 'br' => [], 'strong' => [], 'b' => [], 'em' => [], 'i' => [], 'u' => [], 's' => [],
        'ul' => [], 'ol' => [], 'li' => [], 'h2' => [], 'h3' => [], 'h4' => [], 'blockquote' => [],
        'a' => ['href', 'target', 'title'],
    ];

    /** Elements removed together with everything inside them. */
    private const DROPPED = ['script', 'style', 'iframe', 'object', 'embed', 'template', 'svg', 'math', 'noscript', 'form', 'input', 'button', 'select', 'textarea', 'link', 'meta', 'title', 'head'];

    public function clean(?string $html): string
    {
        $html = (string) $html;

        if (! str_contains($html, '<')) {
            return $html;
        }

        $document = new DOMDocument;
        $previous = libxml_use_internal_errors(true);
        $document->loadHTML('<?xml encoding="utf-8"?><div id="rich-text-root">'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = $document->getElementById('rich-text-root');

        if ($root === null) {
            return strip_tags($html);
        }

        $this->cleanChildren($root);

        $output = '';
        foreach ($root->childNodes as $child) {
            $output .= $document->saveHTML($child);
        }

        $output = trim($output);

        // Nothing but text left (e.g. "a < b"): keep it as plain text.
        return preg_match('/<[a-z][^>]*>/i', $output) ? $output : html_entity_decode($output, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    private function cleanChildren(DOMNode $node): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child->nodeType === XML_TEXT_NODE) {
                continue;
            }

            if (! $child instanceof DOMElement) {
                // Comments, processing instructions and the like.
                $node->removeChild($child);

                continue;
            }

            $tag = strtolower($child->tagName);

            if (in_array($tag, self::DROPPED, true)) {
                $node->removeChild($child);

                continue;
            }

            $this->cleanChildren($child);

            if (! array_key_exists($tag, self::ALLOWED)) {
                // Unknown wrappers (div, span, font…) give way to their content.
                while ($child->firstChild !== null) {
                    $node->insertBefore($child->firstChild, $child);
                }
                $node->removeChild($child);

                continue;
            }

            $this->cleanAttributes($child, self::ALLOWED[$tag]);
        }
    }

    /**
     * @param  array<int, string>  $allowed
     */
    private function cleanAttributes(DOMElement $element, array $allowed): void
    {
        foreach (iterator_to_array($element->attributes) as $attribute) {
            if (! in_array(strtolower($attribute->name), $allowed, true)) {
                $element->removeAttribute($attribute->name);
            }
        }

        if ($element->tagName !== 'a') {
            return;
        }

        if (! $this->isSafeUrl($element->getAttribute('href'))) {
            $element->removeAttribute('href');
        }

        if ($element->hasAttribute('target')) {
            if ($element->getAttribute('target') === '_blank') {
                $element->setAttribute('rel', 'noopener noreferrer');
            } else {
                $element->removeAttribute('target');
            }
        }
    }

    private function isSafeUrl(string $url): bool
    {
        $url = trim(preg_replace('/[\x00-\x20]+/', '', $url) ?? '');

        if ($url === '') {
            return false;
        }

        // A colon before any slash, ? or # means a scheme; without one the
        // address is relative to the site.
        if (! preg_match('/^([a-z][a-z0-9+.\-]*):/i', $url, $match)) {
            return true;
        }

        return in_array(strtolower($match[1]), ['http', 'https', 'mailto', 'tel'], true);
    }
}
