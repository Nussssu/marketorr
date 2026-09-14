<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        Setting::query()->updateOrCreate(['id' => 1], Setting::defaults());
        Setting::forgetCurrent();
    }
}
