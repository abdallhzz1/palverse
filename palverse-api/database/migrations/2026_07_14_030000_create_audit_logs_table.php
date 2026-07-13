<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table): void {
            $table->id();
            $table->ulid('public_id')->unique();

            // Actor
            $table->string('actor_type')->nullable();
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->string('actor_public_id')->nullable()->index();
            $table->string('actor_name')->nullable();
            $table->string('actor_email')->nullable();

            // Action & Subject
            $table->string('action')->index();
            $table->string('subject_type')->nullable()->index();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('subject_public_id')->nullable()->index();
            $table->string('subject_label')->nullable();

            // Request Metadata
            $table->string('route')->nullable();
            $table->string('method')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('request_id')->nullable()->index();

            // Payloads
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->json('metadata')->nullable();

            // Timestamps (append-only, no updated_at)
            $table->timestamp('created_at')->useCurrent()->index();

            // Composite indexes for efficient querying
            $table->index(['actor_public_id', 'created_at']);
            $table->index(['subject_type', 'subject_public_id', 'created_at'], 'audit_subject_created_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
