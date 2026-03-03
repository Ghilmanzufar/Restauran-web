<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Jika user dihapus, log tetap ada
            $table->string('action'); // Msl: 'CREATE_MENU', 'DELETE_ORDER', 'LOGIN'
            $table->text('description'); // Msl: 'Kasir Budi menghapus pesanan #123'
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};