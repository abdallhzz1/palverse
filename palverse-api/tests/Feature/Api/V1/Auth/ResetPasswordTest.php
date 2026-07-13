<?php

namespace Tests\Feature\Api\V1\Auth;

use App\Enums\AuditAction;
use App\Enums\UserStatus;
use App\Models\AuditLog;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class ResetPasswordTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        Notification::fake();
    }

    protected function createActiveUser(array $attrs = []): User
    {
        return User::factory()->create(array_merge([
            'email' => 'merchant@example.com',
            'password' => Hash::make('OldPassword123'),
            'status' => UserStatus::Active->value,
        ], $attrs));
    }

    /**
     * Generate a valid reset token for the given user via the Password broker.
     */
    protected function generateToken(User $user): string
    {
        return Password::broker()->createToken($user);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Happy path
    // ──────────────────────────────────────────────────────────────────────────

    public function test_valid_token_resets_password_successfully(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_old_password_no_longer_works_after_reset(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $user->refresh();
        $this->assertFalse(Hash::check('OldPassword123', $user->password));
    }

    public function test_new_password_works_after_reset(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $user->refresh();
        $this->assertTrue(Hash::check('NewPassword123', $user->password));
    }

    public function test_password_changed_at_is_updated_after_reset(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        $before = now()->subSecond();

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $user->refresh();
        $this->assertNotNull($user->password_changed_at);
        $this->assertTrue($user->password_changed_at->isAfter($before));
    }

    public function test_old_sanctum_tokens_are_revoked_after_reset(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        // Issue tokens before reset
        $user->createToken('device-1');
        $user->createToken('device-2');
        $this->assertCount(2, $user->tokens);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $user->refresh();
        $this->assertCount(0, $user->tokens);
    }

    public function test_account_status_is_unchanged_after_reset(): void
    {
        $user = $this->createActiveUser(['status' => UserStatus::Suspended->value]);
        $token = $this->generateToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $user->refresh();
        $this->assertEquals(UserStatus::Suspended, $user->status);
    }

    public function test_inactive_user_can_reset_password_but_stays_inactive(): void
    {
        $user = $this->createActiveUser(['status' => UserStatus::Inactive->value]);
        $token = $this->generateToken($user);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(200);
        $user->refresh();
        $this->assertEquals(UserStatus::Inactive, $user->status);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Token failures
    // ──────────────────────────────────────────────────────────────────────────

    public function test_invalid_token_returns_422(): void
    {
        $this->createActiveUser();

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => 'this-is-a-wrong-token',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'PASSWORD_RESET_TOKEN_INVALID');
    }

    public function test_used_token_cannot_be_reused(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        // First use — should succeed
        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        // Second use of the same token — should fail
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'AnotherPass456',
            'password_confirmation' => 'AnotherPass456',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'PASSWORD_RESET_TOKEN_INVALID');
    }

    public function test_unknown_email_with_any_token_returns_422(): void
    {
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'nobody@example.com',
            'token' => 'some-token',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'PASSWORD_RESET_TOKEN_INVALID');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Validation
    // ──────────────────────────────────────────────────────────────────────────

    public function test_weak_password_rejected(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'weak',
            'password_confirmation' => 'weak',
        ]);

        $response->assertStatus(422);
    }

    public function test_password_confirmation_required(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'WrongConfirmation',
        ]);

        $response->assertStatus(422);
    }

    public function test_email_is_required(): void
    {
        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => 'some-token',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(422);
    }

    public function test_token_is_required(): void
    {
        $this->createActiveUser();

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(422);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Email normalization
    // ──────────────────────────────────────────────────────────────────────────

    public function test_email_normalized_to_lowercase_during_reset(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'MERCHANT@EXAMPLE.COM',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertStatus(200);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Security – no sensitive data in response
    // ──────────────────────────────────────────────────────────────────────────

    public function test_response_does_not_expose_user_object(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $this->assertNull($response->json('data'));
        $this->assertArrayNotHasKey('user', $response->json() ?? []);
    }

    public function test_response_does_not_expose_token(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $this->assertStringNotContainsStringIgnoringCase($token, $response->getContent());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Audit log
    // ──────────────────────────────────────────────────────────────────────────

    public function test_audit_log_created_on_successful_reset(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => AuditAction::UserPasswordResetSelfService->value,
        ]);
    }

    public function test_audit_log_contains_no_password_or_token(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $log = AuditLog::where('action', AuditAction::UserPasswordResetSelfService->value)->first();
        $this->assertNotNull($log);

        $allData = json_encode([
            $log->old_values,
            $log->new_values,
            $log->metadata,
        ]);

        $this->assertStringNotContainsStringIgnoringCase('NewPassword123', $allData);
        $this->assertStringNotContainsStringIgnoringCase($token, $allData);
    }

    public function test_audit_log_contains_reset_source_metadata(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $log = AuditLog::where('action', AuditAction::UserPasswordResetSelfService->value)->first();
        $this->assertEquals('public_api', $log?->metadata['reset_source'] ?? null);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Login regression after reset
    // ──────────────────────────────────────────────────────────────────────────

    public function test_active_user_cannot_login_with_old_password_after_reset(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'merchant@example.com',
            'password' => 'OldPassword123',
        ]);

        $loginResponse->assertStatus(422);
    }

    public function test_active_user_can_login_with_new_password_after_reset(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'merchant@example.com',
            'password' => 'NewPassword123',
        ]);

        $loginResponse->assertStatus(200);
    }

    public function test_suspended_user_cannot_login_after_successful_reset(): void
    {
        $user = $this->createActiveUser(['status' => UserStatus::Suspended->value]);
        $token = $this->generateToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'merchant@example.com',
            'password' => 'NewPassword123',
        ]);

        // Still blocked – reset does not reactivate suspended accounts
        $loginResponse->assertStatus(403);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Response structure
    // ──────────────────────────────────────────────────────────────────────────

    public function test_success_response_follows_api_standard(): void
    {
        $user = $this->createActiveUser();
        $token = $this->generateToken($user);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => $token,
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertJsonStructure(['success', 'message', 'data', 'meta']);
    }

    public function test_error_response_follows_api_standard(): void
    {
        $this->createActiveUser();

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'merchant@example.com',
            'token' => 'bad-token',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ]);

        $response->assertJsonStructure(['success', 'message', 'error' => ['code'], 'meta']);
    }
}
