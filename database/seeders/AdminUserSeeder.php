<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@grocery.com',
            'password' => Hash::make('password'),
            'phone' => '08123456789',
            'address' => 'Admin Address',
        ]);

        $admin->assignRole('admin');
    }
}
