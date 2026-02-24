<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        // --- KATEGORI ---
        $catMakanan = Category::create(['name' => 'Makanan Berat']);
        $catMinuman = Category::create(['name' => 'Minuman Segar']);
        $catSnack = Category::create(['name' => 'Cemilan']);

        // --- PRODUK MAKANAN ---
        // Simpan ke variabel $nasiGoreng biar bisa ditambah varian nanti
        $nasiGoreng = Product::create([
            'category_id' => $catMakanan->id,
            'name' => 'Nasi Goreng Spesial',
            'description' => 'Nasi goreng dengan telur mata sapi, ayam suwir, dan kerupuk.',
            'price' => 25000,
            'stock_qty' => 50,
            'is_available' => true,
            'image_url' => 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=60'
        ]);

        Product::create([
            'category_id' => $catMakanan->id,
            'name' => 'Mie Goreng Jawa',
            'description' => 'Mie goreng bumbu kecap manis dengan sayuran segar.',
            'price' => 22000,
            'stock_qty' => 40,
            'is_available' => true,
            'image_url' => 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=500&q=60'
        ]);

        // --- PRODUK MINUMAN ---
        // PENTING: Assign ke variabel $esTeh di sini!
        $esTeh = Product::create([
            'category_id' => $catMinuman->id,
            'name' => 'Es Teh Manis',
            'description' => 'Teh asli dengan gula batu.',
            'price' => 5000,
            'stock_qty' => 100,
            'is_available' => true,
            'image_url' => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=500&q=60'
        ]);

        Product::create([
            'category_id' => $catMinuman->id,
            'name' => 'Kopi Susu Gula Aren',
            'description' => 'Kopi robusta dengan susu fresh milk dan gula aren.',
            'price' => 18000,
            'stock_qty' => 30,
            'is_available' => true,
            'image_url' => 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=500&q=60'
        ]);

        // --- PRODUK SNACK ---
        Product::create([
            'category_id' => $catSnack->id,
            'name' => 'Kentang Goreng',
            'description' => 'Kentang goreng renyah dengan saus sambal.',
            'price' => 15000,
            'stock_qty' => 20,
            'is_available' => true,
            'image_url' => 'https://images.unsplash.com/photo-1573080496987-a199f8cd4054?auto=format&fit=crop&w=500&q=60'
        ]);

        // ==========================================
        // VARIAN PRODUK (LOGIC FIX)
        // ==========================================

        // 1. Varian untuk Es Teh (Sekarang $esTeh sudah dikenali)
        $varGula = $esTeh->variants()->create([
            'name' => 'Level Gula',
            'type' => 'radio',
            'is_required' => true
        ]);
        $varGula->items()->createMany([
            ['name' => 'Normal 100%', 'price' => 0],
            ['name' => 'Less Sugar 50%', 'price' => 0],
            ['name' => 'No Sugar 0%', 'price' => 0],
        ]);

        $varUkuran = $esTeh->variants()->create([
            'name' => 'Ukuran Gelas',
            'type' => 'radio',
            'is_required' => true
        ]);
        $varUkuran->items()->createMany([
            ['name' => 'Regular', 'price' => 0],
            ['name' => 'Jumbo', 'price' => 3000],
        ]);

        // 2. (Opsional) Varian untuk Nasi Goreng
        $varPedas = $nasiGoreng->variants()->create([
            'name' => 'Level Pedas',
            'type' => 'radio',
            'is_required' => true
        ]);
        $varPedas->items()->createMany([
            ['name' => 'Tidak Pedas', 'price' => 0],
            ['name' => 'Sedang', 'price' => 0],
            ['name' => 'Pedas Mampus', 'price' => 0],
        ]);
        
        $varToping = $nasiGoreng->variants()->create([
            'name' => 'Extra Topping',
            'type' => 'checkbox', // Bisa pilih banyak
            'is_required' => false
        ]);
        $varToping->items()->createMany([
            ['name' => 'Telur Dadar', 'price' => 3000],
            ['name' => 'Kerupuk Tambahan', 'price' => 1000],
        ]);
    }
}