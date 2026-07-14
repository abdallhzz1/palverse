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
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->ulid('public_id')->nullable()->unique()->after('id');
            $table->string('device_name', 100)->nullable()->after('name');
            $table->string('device_type', 50)->nullable()->after('device_name');
            $table->string('ip_address', 45)->nullable()->after('device_type');
            $table->text('user_agent')->nullable()->after('ip_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropColumn([
                'public_id',
                'device_name',
                'device_type',
                'ip_address',
                'user_agent',
            ]);
        });
    }
};
