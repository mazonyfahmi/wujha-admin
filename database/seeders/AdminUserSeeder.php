<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if user exists
        if (!User::where('email', 'admin@wujha.com')->exists()) {
            // Use environment variable or generate secure random password
            $password = env('ADMIN_PASSWORD', Str::random(16));
            
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@wujha.com',
                'password' => Hash::make($password),
                'role' => 'admin',
                'phone' => '0500000000',
            ]);
            
            // Log the generated password for first-time setup
            if (!env('ADMIN_PASSWORD')) {
                $this->command->info('========================================');
                $this->command->info("Admin user created with password: {$password}");
                $this->command->info('Please change this password immediately!');
                $this->command->info('========================================');
            }
        }
    }
}

