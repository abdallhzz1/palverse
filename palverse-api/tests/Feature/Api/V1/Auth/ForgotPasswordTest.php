<?php

namespace Tests\Feature\Api\V1\Auth;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ForgotPasswordTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        Notification::fake();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Generic response (anti-enumeration)
    // ──────────────────────────────────────────────────────────────────────────

    public function test_known_email_returns_generic_success_200(): void
    {
        User::factory()->create(['email' => 'merchant@example.com', 'status' => 'active']);

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'merchant@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'If an account exists for this email, password reset instructions have been sent.');
    }

    public function test_unknown_email_returns_same_generic_success_200(): void
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'doesnotexist@example.com',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'If an account exists for this email, password reset instructions have been sent.');
    }

    public function test_known_and_unknown_email_return_identical_response_shape(): void
    {
        User::factory()->create(['email' => 'real@example.com', 'status' => 'active']);

        $responseKnown = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'real@example.com']);
        $responseUnknown = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'fake@example.com']);

        $this->assertEquals($responseKnown->json('message'), $responseUnknown->json('message'));
        $this->assertEquals($responseKnown->json('success'), $responseUnknown->json('success'));
    }

    public function test_response_does_not_contain_token(): void
    {
        User::factory()->create(['email' => 'merchant@example.com', 'status' => 'active']);

        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'merchant@example.com',
        ]);

        $this->assertNull($response->json('data'));
        $responseBody = $response->getContent();
        $this->assertStringNotContainsStringIgnoringCase('token', $responseBody);
    }

    public function test_response_does_not_expose_user_existence(): void
    {
        $responseUnknown = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'ghost@example.com',
        ]);

        // Must not reveal "user not found", "email not registered" etc.
        $this->assertStringNotContainsStringIgnoringCase('not found', $responseUnknown->getContent());
        $this->assertStringNotContainsStringIgnoringCase('not registered', $responseUnknown->getContent());
        $this->assertStringNotContainsStringIgnoringCase('no account', $responseUnknown->getContent());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Notification dispatching
    // ──────────────────────────────────────────────────────────────────────────

    public function test_known_active_user_receives_reset_notification(): void
    {
        $user = User::factory()->create(['email' => 'merchant@example.com', 'status' => 'active']);

        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'merchant@example.com']);

        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function test_unknown_email_sends_no_notification(): void
    {
        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'ghost@example.com']);

        Notification::assertNothingSent();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Account status policy
    // ──────────────────────────────────────────────────────────────────────────

    public function test_suspended_user_receives_reset_notification(): void
    {
        $user = User::factory()->create(['email' => 'suspended@example.com', 'status' => 'suspended']);

        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'suspended@example.com']);

        // Suspended users CAN receive reset links (reset doesn't reactivate them)
        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function test_inactive_user_receives_reset_notification(): void
    {
        $user = User::factory()->create(['email' => 'inactive@example.com', 'status' => 'inactive']);

        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'inactive@example.com']);

        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Email normalization
    // ──────────────────────────────────────────────────────────────────────────

    public function test_email_is_normalized_to_lowercase_before_lookup(): void
    {
        $user = User::factory()->create(['email' => 'merchant@example.com', 'status' => 'active']);

        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'MERCHANT@EXAMPLE.COM']);

        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Validation
    // ──────────────────────────────────────────────────────────────────────────

    public function test_missing_email_returns_422(): void
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', []);
        $response->assertStatus(422);
    }

    public function test_invalid_email_format_returns_422(): void
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'not-an-email']);
        $response->assertStatus(422);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Response structure
    // ──────────────────────────────────────────────────────────────────────────

    public function test_response_follows_api_standard_structure(): void
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'any@example.com']);

        $response->assertJsonStructure(['success', 'message', 'data', 'meta']);
    }
}
