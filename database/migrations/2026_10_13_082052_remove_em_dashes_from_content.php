<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Rewrite every em dash in editable content (titles, descriptions, alt text,
 * email templates and JSON section copy) the way the seeders now write it:
 * " | " in page titles, a colon before a list, a comma otherwise, and
 * parentheses around a dash-wrapped list.
 *
 * Seeders cover fresh installs; this carries the same copy onto rows that
 * were seeded or edited before it. One-way: the original dashes are not kept.
 */
return new class extends Migration
{
    private const EM_DASH = '—';

    /** @var list<string> */
    private const TABLES = ['site_settings', 'pages', 'projects', 'services', 'categories', 'menus', 'menu_items', 'global_blocks', 'email_templates'];

    /** @var list<string> */
    private const TEXT_TYPES = ['varchar', 'char', 'text', 'tinytext', 'mediumtext', 'longtext', 'json'];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            $columns = collect(Schema::getColumns($table))
                ->filter(fn (array $column): bool => in_array($column['type_name'], self::TEXT_TYPES, true))
                ->pluck('name');

            DB::table($table)->orderBy('id')->each(function (object $row) use ($table, $columns): void {
                $changes = [];

                foreach ($columns as $column) {
                    $value = $row->{$column};

                    if (! is_string($value) || ! $this->containsDash($value)) {
                        continue;
                    }

                    $changes[$column] = $this->rewriteValue($value);
                }

                if ($changes !== []) {
                    DB::table($table)->where('id', $row->id)->update($changes);
                }
            });
        }
    }

    public function down(): void
    {
        //
    }

    private function containsDash(string $value): bool
    {
        return str_contains($value, self::EM_DASH) || str_contains($value, '\u2014');
    }

    /**
     * JSON columns are decoded so escaped dashes are found and the column is
     * written back as valid JSON; anything else is treated as plain copy.
     */
    private function rewriteValue(string $value): string
    {
        $decoded = json_decode($value, true);

        if (is_array($decoded)) {
            array_walk_recursive($decoded, function (mixed &$item): void {
                if (is_string($item)) {
                    $item = $this->rewrite($item);
                }
            });

            return json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        return $this->rewrite($value);
    }

    private function rewrite(string $text): string
    {
        $text = str_replace([' — Marketorr', 'Marketorr — '], [' | Marketorr', 'Marketorr | '], $text);
        $text = preg_replace('/(^|>)— /u', '$1', $text);
        $text = preg_replace('/^(Footer|Admin|Customer) — /u', '$1: ', $text);
        $text = preg_replace('/^(New project inquiry) — /u', '$1: ', $text);

        $parts = preg_split('/(?<=[.!?])(\s+)/u', $text, -1, PREG_SPLIT_DELIM_CAPTURE);
        $text = implode('', array_map(fn (string $part): string => $this->rewriteSentence($part), $parts));

        return str_replace(self::EM_DASH, '-', $text);
    }

    private function rewriteSentence(string $sentence): string
    {
        $count = substr_count($sentence, ' — ');

        if ($count === 0) {
            return $sentence;
        }

        if ($count === 2) {
            [$before, $inner, $after] = explode(' — ', $sentence, 3);

            return str_contains($inner, ', ')
                ? $before.' ('.$inner.') '.$after
                : $before.', '.$inner.', '.$after;
        }

        if ($count > 2) {
            return str_replace(' — ', ', ', $sentence);
        }

        [$before, $after] = explode(' — ', $sentence, 2);

        return $before.(str_contains($after, ', ') ? ': ' : ', ').$after;
    }
};
