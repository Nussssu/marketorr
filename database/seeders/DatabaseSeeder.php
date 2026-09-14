<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->seedFirstAdmin();

        $this->call([
            SettingSeeder::class,
            ServiceSeeder::class,
            ProjectSeeder::class,
        ]);
    }

    /**
     * Create the first super admin with a random password printed once.
     *
     * An existing admin is left untouched so re-seeding never silently
     * invalidates the credentials already in use.
     */
    private function seedFirstAdmin(): void
    {
        $email = 'admin@marketorr.com';

        if (User::query()->where('email', $email)->exists()) {
            $this->command?->warn("Admin {$email} already exists — password unchanged.");

            return;
        }

        $password = Str::password(16, symbols: false);

        User::query()->create([
            'name' => 'Marketorr Admin',
            'email' => $email,
            'password' => Hash::make($password),
            'role' => UserRole::SuperAdmin,
            'email_verified_at' => now(),
        ]);

        $this->command?->newLine();
        $this->command?->info('Admin account created — save these credentials now, they are not shown again:');
        $this->command?->table(['Email', 'Password'], [[$email, $password]]);
    }
}
