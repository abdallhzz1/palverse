<?php

namespace Tests\Feature\EndToEnd;

use App\Models\City;
use App\Models\User;
use App\Notifications\NewJoinRequestNotification;
use Illuminate\Support\Facades\Notification;

class MerchantOnboardingFlowTest extends EndToEndTestCase
{
    public function test_merchant_onboarding_uses_join_request_not_self_registration(): void
    {
        Notification::fake();

        $selfRegister = $this->postJson('/api/v1/auth/register/merchant', [
            'name' => 'New Merchant',
            'email' => 'new.merchant@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ]);
        $selfRegister->assertForbidden()
            ->assertJsonPath('error.code', 'MERCHANT_SELF_REGISTRATION_DISABLED');

        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $followUp = User::factory()->create();
        $followUp->assignRole('follow_up');

        $city = City::factory()->create();

        $joinResponse = $this->postJson('/api/v1/merchant-join-requests', [
            'merchant_name' => 'تاجر جديد',
            'phone' => '0599000111',
            'email' => 'join.merchant@example.com',
            'store_name' => 'محل الانضمام',
            'city_id' => $city->public_id,
            'notes' => 'طلب تجريبي',
        ]);

        $joinResponse->assertCreated();
        $this->assertDatabaseHas('merchant_join_requests', [
            'store_name' => 'محل الانضمام',
            'phone' => '0599000111',
        ]);

        Notification::assertSentTo($admin, NewJoinRequestNotification::class);
        Notification::assertSentTo($followUp, NewJoinRequestNotification::class);
    }
}
