<?php

namespace App\Services;

use App\Enums\SnippetType;

/**
 * Checks a snippet before it can be published. Errors are things that would
 * break the page or the tag the snippet is wrapped in; warnings flag code
 * that works but deserves a second look.
 */
class CodeSnippetValidator
{
    /**
     * @return array{errors: array<int, string>, warnings: array<int, string>}
     */
    public function check(SnippetType $type, string $code): array
    {
        $errors = [];
        $warnings = [];
        $lower = strtolower($code);

        if (trim($code) === '') {
            $errors[] = 'The code is empty.';
        }

        if ($type === SnippetType::Css) {
            if (str_contains($lower, '<style') || str_contains($lower, '</style')) {
                $errors[] = 'Write only the CSS rules: the <style> tag is added for you.';
            }
            if (str_contains($lower, '<script')) {
                $errors[] = 'CSS snippets cannot contain <script> tags. Use an HTML snippet for that.';
            }
            if (substr_count($code, '{') !== substr_count($code, '}')) {
                $warnings[] = 'The curly braces { } do not look balanced.';
            }
        }

        if ($type === SnippetType::Js) {
            if (str_contains($lower, '</script')) {
                $errors[] = 'JavaScript snippets cannot contain </script>: the tag is added for you. To paste full <script> tags, use an HTML snippet. Inside a string, write <\/script> instead.';
            } elseif (str_contains($lower, '<!--') && str_contains($lower, '<script')) {
                // The HTML parser reads "<!-- ... <script" inside a script as a
                // nested script, so the closing tag added for you would no
                // longer end it and the rest of the page would become code.
                $errors[] = 'JavaScript snippets cannot combine <!-- with <script: it would swallow the rest of the page. Inside a string, write <\!-- or <\script instead.';
            } elseif (preg_match('/^\s*<script\b/i', $code)) {
                $warnings[] = 'This looks like a full <script> tag. Choose the HTML type to paste tags as they are.';
            }
            foreach (['()', '{}', '[]'] as $pair) {
                if (substr_count($code, $pair[0]) !== substr_count($code, $pair[1])) {
                    $warnings[] = "The {$pair[0]} {$pair[1]} brackets do not look balanced.";
                }
            }
        }

        if ($type === SnippetType::Html) {
            foreach (['script', 'style', 'noscript', 'iframe'] as $tag) {
                $opened = preg_match_all('/<'.$tag.'\b/i', $code);
                $closed = preg_match_all('/<\/'.$tag.'\s*>/i', $code);
                if ($opened !== $closed) {
                    $errors[] = "There are {$opened} <{$tag}> tag(s) but {$closed} closing </{$tag}> tag(s).";
                }
            }

            if (preg_match('/<base\b/i', $code)) {
                $errors[] = 'A <base> tag would change where every link and file on the page points. Remove it.';
            }
        }

        if ($type !== SnippetType::Js && preg_match_all('/<(?:script|iframe|img|link|embed|source)\b[^>]*\b(?:src|href)\s*=\s*["\']?http:\/\/([^\/"\'\s>]+)/i', $code, $insecure)) {
            $errors[] = 'Third-party files must load over https:// (insecure http:// from: '.implode(', ', array_unique($insecure[1])).').';
        }

        if ($type !== SnippetType::Css) {
            if (str_contains($lower, 'document.write')) {
                $warnings[] = 'document.write can blank the page when it runs after load.';
            }
            if (preg_match('/\beval\s*\(/', $code)) {
                $warnings[] = 'eval() runs text as code; make sure that text can never come from a visitor.';
            }
            if (preg_match_all('/src\s*=\s*["\']?(?:https?:)?\/\/([^\/"\'\s>]+)/i', $code, $matches)) {
                $hosts = implode(', ', array_unique($matches[1]));
                $warnings[] = "Loads files from: {$hosts}. Only keep sources you trust.";
            }
        }

        if (mb_strlen($code) > 50000) {
            $warnings[] = 'This snippet is large and adds weight to every page it runs on.';
        }

        return ['errors' => $errors, 'warnings' => $warnings];
    }
}
