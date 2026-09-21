<?php

namespace Database\Seeders;

use App\Enums\EmailTemplateKey;
use App\Models\EmailTemplate;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        foreach (EmailTemplateKey::cases() as $key) {
            EmailTemplate::forKey($key);
        }
    }
}
