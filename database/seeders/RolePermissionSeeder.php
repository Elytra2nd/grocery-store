<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = [
            'manage products',
            'manage orders',
            'view orders',
            'manage users',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles
        $adminRole = Role::create(['name' => 'admin']);
        $buyerRole = Role::create(['name' => 'buyer']);

        // Assign permissions to admin
        $adminRole->givePermissionTo(Permission::all());
    }
}
