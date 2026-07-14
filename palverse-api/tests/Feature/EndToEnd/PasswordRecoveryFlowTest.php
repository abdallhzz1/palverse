<?php

namespace Tests\Feature\EndToEnd;

use App\Notifications\ResetPasswordNotification;
use Illuminate\Support\Facades\Notification;

class PasswordRecoveryFlowTest extends EndToEndTestCase
{
    public function test_complete_password_recovery_flow()
    {
        Notification::fake();

        $merchant = $this->createMerchantUser();

        // 1. Existing merchant requests password reset.
        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => $merchant->email,
        ]);
        $this->assertApiSuccess($response);

        // 2. Unknown email receives same response (security: don't leak existence).
        $unknownResponse = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'doesnotexist@example.com',
        ]);
        $this->assertApiSuccess($unknownResponse);

        // 3. Reset notification is sent only to existing user.
        Notification::assertSentTo($merchant, ResetPasswordNotification::class, function ($notification) {
            $this->resetToken = (fn () => $this->token)->call($notification);

            return true;
        });

        // 5. Reset password.
        $resetResponse = $this->postJson('/api/v1/auth/reset-password', [
            'email' => $merchant->email,
            'token' => $this->resetToken,
            'password' => 'NewSecurePass123!',
            'password_confirmation' => 'NewSecurePass123!',
        ]);
        $this->assertApiSuccess($resetResponse);

        // 6. Old password fails.
        $loginOldResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $merchant->email,
            'password' => 'password', // Default factory password
            'device_name' => 'test',
        ]);
        $loginOldResponse->assertStatus(422);
        $loginOldResponse->assertJsonFragment(['code' => 'INVALID_CREDENTIALS']);

        // 7. New password works.
        $loginNewResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $merchant->email,
            'password' => 'NewSecurePass123!',
            'device_name' => 'test',
        ]);
        $this->assertApiSuccess($loginNewResponse);

        // 12. Used token cannot be reused.
        $resetResponse2 = $this->postJson('/api/v1/auth/reset-password', [
            'email' => $merchant->email,
            'token' => $this->resetToken,
            'password' => 'AnotherNewPass1!',
            'password_confirmation' => 'AnotherNewPass1!',
        ]);
        $resetResponse2->assertStatus(422); // Token is invalid
    }
}
