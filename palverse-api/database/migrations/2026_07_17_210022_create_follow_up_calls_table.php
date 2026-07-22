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
        Schema::create('follow_up_calls', function (Blueprint $table) {
            $table->id();
            $table->ulid('public_id')->unique();
            $table->foreignId('follow_up_user_id')->constrained('users')->restrictOnDelete();
            
            // Optional polymorphic or specific foreign keys. Since the requirements mentioned tracking
            // store, merchant, subscription, or representative, we can add them as nullable foreign keys.
            $table->foreignId('merchant_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('store_id')->nullable()->constrained('stores')->nullOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained('store_subscriptions')->nullOnDelete();
            $table->foreignId('representative_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->string('call_type', 30)->index();
            $table->string('outcome', 30)->index();
            $table->string('contact_phone', 30)->nullable();
            
            $table->timestamp('contacted_at')->useCurrent();
            $table->timestamp('next_action_at')->nullable();
            
            $table->text('notes')->nullable();
            $table->unsignedTinyInteger('satisfaction_score')->nullable(); // 1-5 or 1-10
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('follow_up_calls');
    }
};
