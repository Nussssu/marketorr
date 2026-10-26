<?php

namespace App\Console\Commands;

use App\Services\MediaCatalogue;
use Illuminate\Console\Command;

/**
 * Adds every image the Branding and UI/UX projects and services use to the
 * media library, one entry per file, and points uses of a file stored twice
 * at the one copy kept. Safe to run again.
 */
class OrganizeMediaLibrary extends Command
{
    protected $signature = 'media:organize';

    protected $description = 'Add the Branding and UI/UX images to the media library, one entry per file';

    public function handle(MediaCatalogue $catalogue): int
    {
        $result = $catalogue->sync();

        $this->info("Added {$result['added']} image(s), merged {$result['merged']} duplicate entr".($result['merged'] === 1 ? 'y' : 'ies').", pointed {$result['repointed']} use(s) at the kept copy.");

        return self::SUCCESS;
    }
}
