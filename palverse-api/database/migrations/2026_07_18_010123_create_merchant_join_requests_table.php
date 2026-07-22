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
        Schema::create('merchant_join_requests', function (Blueprint $table) {
            $table->id();
            $table->ulid('public_id')->unique();
            $table->string('merchant_name');
            $table->string('phone', 30);
            $table->string('email')->nullable();
            $table->string('store_name');
            $table->foreignId('city_id')->constrained('cities')->restrictOnDelete();
            $table->text('notes')->nullable();
            $table->string('status', 20)->default('new')->index();
            $table->foreignId('handled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('merchant_join_requests');
    }
};
