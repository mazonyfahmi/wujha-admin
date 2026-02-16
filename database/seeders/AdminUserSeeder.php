<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@wujha.com');
        $password = env('ADMIN_PASSWORD', $this->generatePassword());

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Super Admin',
                'password' => Hash::make($password),
                'email_verified_at' => now(),
                'role' => 'admin',
                'phone' => '0000000000',
            ]
        );

        // Display the password (useful when running from CLI)
        $this->command->info('========================================');
        $this->command->info("Admin user created with password: {$password}");
        $this->command->info('Please change this password immediately!');
        $this->command->info('========================================');
    }

    /**
     * Generate a random password if none provided.
     */
    private function generatePassword(): string
    {
        return substr(str_shuffle('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 16);
    }
}
