<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call all seeders in the correct order
        $this->call([
            RolePermissionSeeder::class,
            AdminUserSeeder::class,
            ProductSeeder::class,
        ]);

        // Optional: Create additional test users if needed
        // User::factory(10)->create();

        // Create a test buyer user
        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'), // Use bcrypt for password hashing
        ]);

        // Assign buyer role to test user
        $testUser->assignRole('buyer');
    }
}
