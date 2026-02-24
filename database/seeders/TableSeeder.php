<?php

namespace Database\Seeders;

use App\Models\Table;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TableSeeder extends Seeder
{
    public function run(): void
    {
        // Buat 10 Meja
        for ($i = 1; $i <= 10; $i++) {
            Table::create([
                'table_number' => 'M-' . str_pad($i, 2, '0', STR_PAD_LEFT), // M-01, M-02...
                'qr_token' => Str::random(32), // Token rahasia panjang
                'status' => 'available'
            ]);
        }

        // Buat 1 Meja VIP
        Table::create([
            'table_number' => 'VIP-01',
            'qr_token' => Str::random(32),
            'status' => 'available'
        ]);
    }
}