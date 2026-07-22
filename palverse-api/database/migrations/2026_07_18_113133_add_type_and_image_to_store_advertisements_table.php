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
        Schema::table('store_advertisements', function (Blueprint $table) {
            $table->string('ad_type')->default('featured_store')->after('store_id');
            $table->string('image_path')->nullable()->after('ad_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_advertisements', function (Blueprint $table) {
            $table->dropColumn(['ad_type', 'image_path']);
        });
    }
};
