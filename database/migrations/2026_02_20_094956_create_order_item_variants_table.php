<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_item_variants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // INI YANG HILANG TADI: Penghubung ke tabel order_items
            $table->foreignUuid('order_item_id')->constrained('order_items')->cascadeOnDelete();
            
            // Data Master (Referensi)
            $table->foreignUuid('product_variant_id')->constrained('product_variants');
            $table->foreignUuid('product_variant_item_id')->constrained('product_variant_items');
            
            // Snapshot Data (Nama & Harga saat transaksi terjadi)
            $table->string('variant_name'); // Contoh: "Level Pedas"
            $table->string('item_name');    // Contoh: "Pedas Mampus"
            $table->decimal('extra_price', 12, 2)->default(0);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_item_variants');
    }
};