<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('store_request_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('store_registration_requests')->cascadeOnDelete();
            $table->foreignId('actor_id')->constrained('users')->restrictOnDelete();
            $table->string('from_status', 20)->nullable();
            $table->string('to_status', 20);
            $table->text('note')->nullable();
            $table->timestamps();
            
            $table->index(['request_id', 'created_at']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('store_request_status_history');
    }
};
