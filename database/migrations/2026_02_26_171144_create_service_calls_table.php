<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('service_calls', function (Blueprint $table) {
            $table->id();
            $table->string('table_number'); // Nomor Meja (Dari URL)
            $table->string('type'); // Contoh: 'call_staff', 'bill', 'cutlery'
            $table->text('notes')->nullable(); // Catatan tambahan
            $table->enum('status', ['pending', 'resolved'])->default('pending'); // Status pengerjaan
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_calls');
    }
};
