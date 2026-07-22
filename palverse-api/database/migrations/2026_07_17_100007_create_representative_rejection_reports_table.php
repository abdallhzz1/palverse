<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('representative_rejection_reports', function (Blueprint $table) {
            $table->id();
            $table->ulid('public_id')->unique();
            $table->foreignId('representative_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('zone_id')->constrained('zones')->restrictOnDelete();
            
            $table->string('business_name');
            $table->string('owner_name')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('refusal_reason_code', 50);
            $table->text('refusal_reason_text')->nullable();
            
            $table->timestamp('contacted_at');
            $table->boolean('follow_up_required')->default(false)->index();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['representative_id', 'zone_id'], 'rep_rej_reports_rep_zone_idx');
        });
    }

    public function down(): void {
        Schema::dropIfExists('representative_rejection_reports');
    }
};
