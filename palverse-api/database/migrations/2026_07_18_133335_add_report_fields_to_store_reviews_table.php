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
        Schema::table('store_reviews', function (Blueprint $table) {
            $table->boolean('is_reported')->default(false);
            $table->text('report_reason')->nullable();
            $table->timestamp('reported_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_reviews', function (Blueprint $table) {
            $table->dropColumn(['is_reported', 'report_reason', 'reported_at']);
        });
    }
};
