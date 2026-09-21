<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * Creates an admin account, or resets the password of an existing one.
 *
 * The seeder mints the first admin and prints its password once; this is the
 * way back in after that, without reaching for tinker or re-seeding.
 */
class AdminAccountCommand extends Command
{
    protected $signature = 'admin:account
        {email : The account email}
        {--name= : Display name, defaults to the part before the @}
        {--password= : The password to set, or omit to generate one}
        {--role=super_admin : super_admin or editor}';

    protected $description = 'Create an admin account or reset an existing one\'s password';

    public function handle(): int
    {
        $email = (string) $this->argument('email');
        $role = UserRole::tryFrom((string) $this->option('role'));

        if ($role === null) {
            $this->error('Role must be one of: '.implode(', ', UserRole::values()));

            return self::FAILURE;
        }

        $password = (string) ($this->option('password') ?: Str::password(20, symbols: false));

        $validator = Validator::make(
            ['email' => $email, 'password' => $password],
            [
                'email' => ['required', 'email', 'max:190'],
                'password' => ['required', 'string', 'min:12'],
            ],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        $existing = User::query()->where('email', $email)->first();

        $user = User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $this->option('name') ?: ($existing->name ?? Str::title(Str::before($email, '@'))),
                'password' => Hash::make($password),
                'role' => $role,
                'email_verified_at' => $existing->email_verified_at ?? now(),
            ],
        );

        $this->newLine();
        $this->info($existing ? 'Password reset — save these now, they are not shown again:' : 'Admin created — save these now, they are not shown again:');
        $this->table(['Email', 'Password', 'Role'], [[$user->email, $password, $user->role->value]]);

        return self::SUCCESS;
    }
}
