<?php

namespace Tests\Feature\EndToEnd;

use App\Enums\StoreStatus;
use App\Models\Store;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\Notification;

class StorePublicationFlowTest extends EndToEndTestCase
{
    public function test_complete_store_publication_and_unpublication_flow()
    {
        Notification::fake();

        // 1. Admin logs in.
        $admin = $this->createAdminUser();
        $adminToken = $admin->createToken('admin-device')->plainTextToken;

        // 2. Merchant owns a pending submitted store.
        $merchant = $this->createMerchantUser();
        $store = Store::factory()->create([
            'owner_id' => $merchant->id,
            'status' => StoreStatus::PENDING->value,
            'is_active' => true,
        ]);

        $this->assertEquals(StoreStatus::PENDING, $store->status);

        // 3. Admin approves store.
        $approveResponse = $this->withToken($adminToken)->patchJson("/api/v1/admin/stores/{$store->public_id}/approve");
        $this->assertApiSuccess($approveResponse);

        $store->refresh();
        $this->assertEquals(StoreStatus::APPROVED, $store->status);

        // 4. Permanent slug generated.
        $this->assertNotEmpty($store->slug);

        // 5. Store remains hidden without active subscription.
        $publicStoreResponse = $this->getJson("/api/v1/stores/{$store->slug}");
        $publicStoreResponse->assertStatus(404);

        // 6. Admin creates or selects active subscription plan.
        $plan = SubscriptionPlan::factory()->create(['duration_days' => 30]);

        // 7. Admin assigns subscription.
        $assignSubResponse = $this->withToken($adminToken)->postJson('/api/v1/admin/subscriptions/assign', [
            'store_public_id' => $store->public_id,
            'subscription_plan_public_id' => $plan->public_id,
            'starts_at' => now()->toDateString(),
            'ends_at' => now()->addDays(30)->toDateString(),
        ]);
        $this->assertApiSuccess($assignSubResponse);

        // 8. Store becomes publicly visible.
        $store->refresh();
        $this->assertTrue(Store::publicVisible()->where('id', $store->id)->exists());

        // 9. Public store detail works.
        $publicStoreResponse = $this->getJson("/api/v1/stores/{$store->slug}");
        $this->assertApiSuccess($publicStoreResponse);
        $this->assertNoInternalIds($publicStoreResponse);

        // 10. Store appears in public list.
        $publicListResponse = $this->getJson('/api/v1/stores');
        $this->assertApiSuccess($publicListResponse);
        $publicListResponse->assertJsonFragment(['public_id' => $store->public_id]);

        // 16. Admin cancels subscription.
        $subscription = $store->currentSubscription;
        $this->assertNotNull($subscription);

        $cancelSubResponse = $this->withToken($adminToken)->patchJson("/api/v1/admin/subscriptions/{$subscription->public_id}/cancel", [
            'cancellation_reason' => 'Test',
        ]);
        $this->assertApiSuccess($cancelSubResponse);

        // 17. Public store becomes hidden.
        $store->refresh();
        $this->assertFalse(Store::publicVisible()->where('id', $store->id)->exists());

        $hiddenPublicStoreResponse = $this->getJson("/api/v1/stores/{$store->slug}");
        $hiddenPublicStoreResponse->assertStatus(404);

        // 18. Merchant API remains accessible.
        \Illuminate\Support\Facades\Auth::forgetGuards();
        $merchantToken = $merchant->createToken('device')->plainTextToken;
        $merchantStoreResponse = $this->withToken($merchantToken)->getJson("/api/v1/merchant/stores/{$store->public_id}");
        $this->assertApiSuccess($merchantStoreResponse);

        // 19. Slug remains unchanged.
        $this->assertNotEmpty($store->slug);
    }
}
