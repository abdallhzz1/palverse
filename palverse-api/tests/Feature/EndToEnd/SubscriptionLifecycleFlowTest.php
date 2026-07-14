<?php

namespace Tests\Feature\EndToEnd;

use App\Enums\StoreStatus;
use App\Models\Store;
use App\Notifications\SubscriptionExpiringSoonNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class SubscriptionLifecycleFlowTest extends EndToEndTestCase
{
    public function test_subscription_lifecycle_flow()
    {
        Notification::fake();

        $admin = $this->createAdminUser();
        $adminToken = $admin->createToken('admin')->plainTextToken;

        $merchant = $this->createMerchantUser();
        $store = Store::factory()->create([
            'owner_id' => $merchant->id,
            'status' => StoreStatus::APPROVED->value,
            'is_active' => true,
        ]);

        // 1. Admin creates plan.
        $planResponse = $this->withToken($adminToken)->postJson('/api/v1/admin/subscription-plans', [
            'name_ar' => 'خطة جديدة',
            'name_en' => 'New Plan',
            'code' => 'new-plan',
            'price' => 100,
            'duration_days' => 30,
            'is_active' => true,
        ]);
        $this->assertApiSuccess($planResponse);
        $planId = $planResponse->json('data.public_id');

        // 2. Admin assigns plan to approved store.
        $now = Carbon::now();
        Carbon::setTestNow($now);

        $assignResponse = $this->withToken($adminToken)->postJson('/api/v1/admin/subscriptions/assign', [
            'store_public_id' => $store->public_id,
            'subscription_plan_public_id' => $planId,
            'starts_at' => $now->toDateString(),
            'ends_at' => $now->copy()->addDays(30)->toDateString(),
        ]);
        $this->assertApiSuccess($assignResponse);

        // 3. Merchant sees active subscription.
        Auth::forgetGuards();
        $merchantToken = $merchant->createToken('dev')->plainTextToken;
        $merchantSubResponse = $this->withToken($merchantToken)->getJson("/api/v1/merchant/stores/{$store->public_id}/subscriptions");
        $this->assertApiSuccess($merchantSubResponse);

        // 4. Public visibility becomes true.
        $store->refresh();
        $this->assertTrue(Store::publicVisible()->where('id', $store->id)->exists());

        // 5. Second active subscription assignment returns 409 (if implemented, else assert 422/400).
        Auth::forgetGuards();
        $assignResponse2 = $this->withToken($adminToken)->postJson('/api/v1/admin/subscriptions/assign', [
            'store_public_id' => $store->public_id,
            'subscription_plan_public_id' => $planId,
            'starts_at' => $now->toDateString(),
            'ends_at' => $now->copy()->addDays(30)->toDateString(),
        ]);
        $assignResponse2->assertStatus(409); // Conflict because store already has an active subscription

        // 6. Expiring-soon command sends one notification.
        Carbon::setTestNow($now->copy()->addDays(24)); // 6 days before expiry

        Artisan::call('subscriptions:notify-expiring', ['--days' => 7]);

        Notification::assertSentTo($merchant, SubscriptionExpiringSoonNotification::class);

        // 8. Expiration command changes status.
        Carbon::setTestNow($now->copy()->addDays(31)); // 1 day after expiry

        Artisan::call('subscriptions:expire');

        // 9. Public store becomes hidden.
        $store->refresh();
        $this->assertFalse(Store::publicVisible()->where('id', $store->id)->exists());

        // Restore time
        Carbon::setTestNow();
    }
}
