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
        Schema::table('promos', function (Blueprint $table) {
            $table->string('target_type')->default('all')->after('description'); // all, category, product
            $table->uuid('target_id')->nullable()->after('target_type');
            $table->boolean('auto_apply')->default(false)->after('is_stackable');
            $table->string('order_type')->default('all')->after('target_type'); // all, dine_in, takeaway, delivery
            $table->integer('used_count')->default(0)->after('quota_total');
        });
    }

    public function down(): void
    {
        Schema::table('promos', function (Blueprint $table) {
            $table->dropColumn(['target_type', 'target_id', 'auto_apply', 'order_type', 'used_count']);
        });
    }
};
