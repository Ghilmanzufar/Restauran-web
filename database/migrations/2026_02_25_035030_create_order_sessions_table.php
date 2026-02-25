<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('order_sessions', function (Blueprint $table) {
            // 1. Primary Key (UUID)
            $table->uuid('id')->primary(); 

            // 2. Foreign Key (PENTING: Gunakan foreignUuid, HAPUS foreignId)
            $table->foreignUuid('table_id')
                ->constrained('tables')
                ->cascadeOnDelete();
            
            // 3. Kode Sesi (Token Unik)
            $table->string('session_code')->unique();
            
            // 4. Status (Pilih satu tipe saja, disini kita pakai string agar fleksibel)
            $table->string('status')->default('active'); // active, locked, closed
            
            // 5. Data Keuangan
            $table->decimal('total_amount', 12, 2)->default(0);
            
            // 6. Waktu-waktu penting
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('locked_at')->nullable(); // Saat checkout
            $table->timestamp('closed_at')->nullable(); // Saat bayar lunas
            $table->timestamp('expires_at')->nullable(); // Auto close security
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('order_sessions');
    }
};