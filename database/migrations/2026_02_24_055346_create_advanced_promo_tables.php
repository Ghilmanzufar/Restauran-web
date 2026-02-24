<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. TABEL UTAMA PROMO
        Schema::create('promos', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();

            $table->string('type')->default('fixed'); 
            
            $table->decimal('discount_amount', 12, 2)->default(0); 
            $table->decimal('max_discount', 12, 2)->nullable(); 
            
            $table->decimal('min_spend', 12, 2)->default(0);
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();

            $table->integer('quota_total')->default(0); 
            $table->integer('usage_per_user')->default(1); 
            
            $table->boolean('is_active')->default(true);
            $table->boolean('is_stackable')->default(false); 
            
            $table->json('meta')->nullable(); 

            $table->timestamps();
        });

        // 2. TABEL SCOPE
        Schema::create('promo_scopes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promo_id')->constrained('promos')->onDelete('cascade');
            $table->string('scope_type'); 
            $table->unsignedBigInteger('scope_id'); 
            $table->index(['promo_id', 'scope_type', 'scope_id']);
        });

        // 3. TABEL USAGE (PERBAIKAN DI SINI)
        Schema::create('promo_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promo_id')->constrained('promos');
            
            // --- PERBAIKAN: GUNAKAN UUID ---
            $table->foreignUuid('order_id')->nullable()->constrained('orders')->onDelete('cascade'); 
            // -------------------------------
            
            $table->string('user_identifier')->index(); 
            $table->decimal('discount_value', 12, 2); 
            $table->timestamp('used_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('promo_usages');
        Schema::dropIfExists('promo_scopes');
        Schema::dropIfExists('promos');
    }
};