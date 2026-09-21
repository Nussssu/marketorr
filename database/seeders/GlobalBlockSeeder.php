<?php

namespace Database\Seeders;

use App\Models\GlobalBlock;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GlobalBlockSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        GlobalBlock::query()->firstOrCreate(
            ['key' => GlobalBlock::ANNOUNCEMENT_KEY],
            [
                'name' => 'Announcement banner',
                'type' => 'banner',
                'enabled' => false,
                'content' => [
                    'message' => 'We are booking new projects for next quarter.',
                    'linkLabel' => 'Start a project',
                    'linkUrl' => '/contact',
                    'accent' => '#891FFB',
                ],
            ],
        );
    }
}
