<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class BuyerSeeder extends Seeder
{
    public function run()
    {
        // Pastikan role buyer sudah ada
        $buyerRole = Role::firstOrCreate(['name' => 'buyer']);

        // Data pembeli sample (hanya dengan kolom yang ada)
        $buyers = [
            [
                'name' => 'Abi',
                'email' => 'Abi@example.com',
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane.smith@example.com',
            ],
            [
                'name' => 'Ahmad Rahman',
                'email' => 'ahmad.rahman@example.com',
            ],
            [
                'name' => 'Siti Nurhaliza',
                'email' => 'siti.nurhaliza@example.com',
            ],
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@example.com',
            ],
            [
                'name' => 'Maria Garcia',
                'email' => 'maria.garcia@example.com',
            ],
            [
                'name' => 'David Wilson',
                'email' => 'david.wilson@example.com',
            ],
            [
                'name' => 'Lisa Anderson',
                'email' => 'lisa.anderson@example.com',
            ],
            [
                'name' => 'Michael Brown',
                'email' => 'michael.brown@example.com',
            ],
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@example.com',
            ],
        ];

        // Buat user pembeli dengan data spesifik
        foreach ($buyers as $buyerData) {
            $user = User::create([
                'name' => $buyerData['name'],
                'email' => $buyerData['email'],
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'is_active' => true, // tambahkan ini
            ]);

            // Assign role buyer
            $user->assignRole($buyerRole);
        }

        // Buat 15 pembeli tambahan menggunakan factory
        User::factory()->count(15)->create([
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
            'is_active' => true, // tambahkan ini
        ])->each(function ($user) use ($buyerRole) {
            $user->assignRole($buyerRole);
        });

        $this->command->info('✅ Berhasil membuat ' . (count($buyers) + 15) . ' user pembeli');
    }
}
