<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_retrieve_verification_status()
    {
        $user = User::factory()->create(['email_verified_at' => null]);
        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/v1/auth/email/status');

        $response->assertOk()
            ->assertJsonPath('data.is_verified', false)
            ->assertJsonPath('data.can_resend', true);
    }

    public function test_can_send_verification_notification()
    {
        Notification::fake();

        $user = User::factory()->create(['email_verified_at' => null]);
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/v1/auth/email/verification-notification');

        $response->assertOk();
        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function test_does_not_resend_if_already_verified()
    {
        Notification::fake();

        $user = User::factory()->create(['email_verified_at' => now()]);
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/v1/auth/email/verification-notification');

        $response->assertOk()
            ->assertJsonPath('message', 'Email is already verified.');

        Notification::assertNothingSent();
    }

    public function test_can_verify_email()
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $url = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $user->getKey(),
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );
        // The URL generated is absolute like http://localhost/api/v1/auth/email/verify/...
        // We can just call it via getJson
        $response = $this->getJson($url);

        $response->assertOk();
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_fails_verification_with_invalid_hash()
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $url = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id' => $user->getKey(),
                'hash' => 'invalid-hash',
            ]
        );

        $response = $this->getJson($url);

        $response->assertStatus(400);
        $this->assertNull($user->fresh()->email_verified_at);
    }
}
