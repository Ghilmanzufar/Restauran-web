<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Role
        $roleAdmin = Role::create(['name' => 'admin']);
        $roleCashier = Role::create(['name' => 'cashier']);
        $roleKitchen = Role::create(['name' => 'kitchen']);
        $roleOwner = Role::create(['name' => 'owner']);

        // 2. Buat User Admin
        $admin = User::create([
            'name' => 'Admin Ganteng',
            'email' => 'admin@resto.com',
            'password' => bcrypt('password'),
        ]);
        $admin->assignRole($roleAdmin);

        // 3. Buat User Kasir
        $cashier = User::create([
            'name' => 'Kasir Cantik',
            'email' => 'kasir@resto.com',
            'password' => bcrypt('password'),
        ]);
        $cashier->assignRole($roleCashier);

        // 4. Buat User Dapur
        $kitchen = User::create([
            'name' => 'Chef Juna',
            'email' => 'dapur@resto.com',
            'password' => bcrypt('password'),
        ]);
        $kitchen->assignRole($roleKitchen);
    }
}