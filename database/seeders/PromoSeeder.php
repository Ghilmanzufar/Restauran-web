<?php

namespace Database\Seeders;

use App\Models\Promo;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PromoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // SKENARIO 1: Diskon Ceban (Fixed)
    // "Potongan 10rb, minimal belanja 50rb"
    Promo::create([
        'name' => 'Potongan Ceban',
        'code' => 'CEBAN10',
        'description' => 'Potongan langsung Rp 10.000 untuk jajan kenyang!',
        'type' => 'fixed',
        'discount_amount' => 10000, // Rp 10.000
        'min_spend' => 50000,       // Syarat belanja 50rb
        'start_date' => now(),
        'end_date' => now()->addMonth(),
        'quota_total' => 100,
        'is_active' => true
    ]);

    // SKENARIO 2: Diskon Gajian (Percentage dengan Max Cap)
    // "Diskon 20%, Maksimal 15rb. Min belanja 75rb"
    // Ini logic paling aman biar boncos gak kegedean.
    Promo::create([
        'name' => 'Promo Gajian 20%',
        'code' => 'GAJIAN20',
        'description' => 'Diskon 20% (Max 15rb) spesial tanggal muda.',
        'type' => 'percentage',
        'discount_amount' => 20,    // 20%
        'max_discount' => 15000,    // Mentok di 15rb walau belanja 1 juta
        'min_spend' => 75000,       // Syarat
        'start_date' => now(),
        'end_date' => now()->addWeeks(2),
        'quota_total' => 50,
        'is_active' => true
    ]);
    }
}
