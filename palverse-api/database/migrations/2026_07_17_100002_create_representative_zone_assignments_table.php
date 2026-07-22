<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('representative_zone_assignments', function (Blueprint $table) {
            $table->id();
            $table->ulid('public_id')->unique();
            $table->foreignId('representative_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('zone_id')->constrained('zones')->restrictOnDelete();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamp('assigned_at')->nullable();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['representative_id', 'zone_id'], 'rep_zone_unique_idx');
            $table->index(['representative_id', 'is_active'], 'rep_zone_active_idx');
        });
    }

    public function down(): void {
        Schema::dropIfExists('representative_zone_assignments');
    }
};
