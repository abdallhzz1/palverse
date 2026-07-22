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
        Schema::table('store_registration_requests', function (Blueprint $table) {
            $table->string('email')->nullable()->after('whatsapp');
            $table->string('website')->nullable()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_registration_requests', function (Blueprint $table) {
            $table->dropColumn(['email', 'website']);
        });
    }
};
