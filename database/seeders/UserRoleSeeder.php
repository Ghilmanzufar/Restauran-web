<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserRoleSeeder extends Seeder
{
    public function run(): void
    {
        // Kita gunakan updateOrCreate agar jika email sudah ada, 
        // datanya hanya di-update (rolenya diperbaiki) tanpa membuat duplikat.

        // 1. Akun OWNER (Super Admin / Bos)
        User::updateOrCreate(
            ['email' => 'owner@resto.com'], // Patokan pencarian
            [
                'name' => 'Juragan Resto',
                'password' => Hash::make('password'),
                'role' => 'owner',
                'is_active' => true,
            ]
        );

        // 2. Akun ADMIN (Operator Backoffice)
        User::updateOrCreate(
            ['email' => 'admin@resto.com'],
            [
                'name' => 'Admin Ganteng',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        // 3. Akun KASIR (Front of House)
        User::updateOrCreate(
            ['email' => 'kasir@resto.com'],
            [
                'name' => 'Kasir Cantik',
                'password' => Hash::make('password'),
                'role' => 'kasir',
                'is_active' => true,
            ]
        );

        // 4. Akun DAPUR (Kitchen Display)
        User::updateOrCreate(
            ['email' => 'dapur@resto.com'],
            [
                'name' => 'Chef Juna',
                'password' => Hash::make('password'),
                'role' => 'dapur',
                'is_active' => true,
            ]
        );
    }
}