<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use App\Services\AuditLogService;
use App\Services\UserManagementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_updating_email_clears_verification_status()
    {
        $service = new UserManagementService(app(AuditLogService::class));

        $user = User::factory()->create([
            'email' => 'old@example.com',
            'email_verified_at' => now(),
        ]);

        $this->assertNotNull($user->email_verified_at);

        // Update with the same email
        $service->updateUser($user, ['email' => 'old@example.com']);
        $this->assertNotNull($user->fresh()->email_verified_at);

        // Update with a new email
        $service->updateUser($user, ['email' => 'new@example.com']);
        $this->assertNull($user->fresh()->email_verified_at);
    }
}
