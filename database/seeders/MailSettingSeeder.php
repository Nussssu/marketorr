<?php

namespace Database\Seeders;

use App\Models\MailSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MailSettingSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        MailSetting::query()->firstOrCreate(['id' => 1], MailSetting::defaults());
        MailSetting::forgetCurrent();
    }
}
