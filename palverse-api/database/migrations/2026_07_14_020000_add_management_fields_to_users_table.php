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
        Schema::table('users', function (Blueprint $table): void {
            $table->timestamp('suspended_at')->nullable()->after('last_login_at')->index();
            $table->unsignedBigInteger('suspended_by')->nullable()->after('suspended_at');
            $table->text('suspension_reason')->nullable()->after('suspended_by');

            $table->timestamp('deactivated_at')->nullable()->after('suspension_reason');
            $table->unsignedBigInteger('deactivated_by')->nullable()->after('deactivated_at');

            $table->unsignedBigInteger('created_by')->nullable()->after('deactivated_by');
            $table->timestamp('password_changed_at')->nullable()->after('created_by');

            // Foreign keys
            $table->foreign('suspended_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('deactivated_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropForeign(['suspended_by']);
            $table->dropForeign(['deactivated_by']);
            $table->dropForeign(['created_by']);

            $table->dropIndex(['suspended_at']);

            $table->dropColumn([
                'suspended_at',
                'suspended_by',
                'suspension_reason',
                'deactivated_at',
                'deactivated_by',
                'created_by',
                'password_changed_at',
            ]);
        });
    }
};
