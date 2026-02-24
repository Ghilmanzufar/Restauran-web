<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Relasi ke tabel categories. 
            // restrictOnDelete: Cegah kategori dihapus kalau masih ada produknya (Data Integrity!)
            $table->foreignUuid('category_id')->constrained('categories')->restrictOnDelete();
            
            $table->string('name');
            $table->text('description')->nullable();
            
            // Harga pakai decimal. 12 digit total, 2 di belakang koma (standar akuntansi)
            $table->decimal('price', 12, 2); 
            
            $table->integer('stock_qty')->default(0);
            $table->integer('stock_threshold')->default(5); // Batas minimum untuk notif warning
            $table->boolean('is_available')->default(true);
            $table->string('image_url')->nullable();
            
            $table->timestamps();
            $table->softDeletes(); // Wajib untuk audit finansial (deleted_at)

            // Database Indexing (Mempercepat query saat pelanggan buka menu)
            $table->index('stock_qty');
            $table->index('is_available');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};