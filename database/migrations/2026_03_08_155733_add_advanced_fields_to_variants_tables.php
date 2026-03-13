<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->integer('max_select')->nullable()->after('is_required');
        });

        Schema::table('product_variant_items', function (Blueprint $table) {
            $table->boolean('is_default')->default(false)->after('price');
            $table->boolean('is_active')->default(true)->after('is_default');
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn('max_select');
        });

        Schema::table('product_variant_items', function (Blueprint $table) {
            $table->dropColumn(['is_default', 'is_active']);
        });
    }
};
