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
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->string('entity_type')->nullable()->after('action'); // Msl: 'ORDER', 'PRODUCT'
            $table->string('entity_id')->nullable()->after('entity_type'); // Msl: '12', 'INV-001'
            $table->json('old_values')->nullable()->after('description'); // Harga lama, dll
            $table->json('new_values')->nullable()->after('old_values'); // Harga baru, dll
            $table->string('ip_address', 45)->nullable()->after('new_values');
            $table->string('user_agent')->nullable()->after('ip_address');
            $table->string('severity')->default('INFO')->after('user_agent'); // INFO, WARNING, CRITICAL
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            //
        });
    }
};
