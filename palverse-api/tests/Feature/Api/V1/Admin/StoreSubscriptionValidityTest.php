<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Enums\StoreStatus;
use App\Enums\SubscriptionStatus;
use App\Models\Store;
use App\Models\StoreSubscription;
use App\Models\SubscriptionPlan;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;
use Tests\Support\TestSetupHelpers;
use Tests\TestCase;

class StoreSubscriptionValidityTest extends TestCase
{
    use RefreshDatabase;
    use TestSetupHelpers;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RolesAndPermissionsSeeder::class);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_freshly_assigned_subscription_is_currently_valid(): void
    {
        $store = Store::factory()->approved()->create(['is_active' => true]);
        $plan = SubscriptionPlan::factory()->create(['duration_days' => 30]);

        $subscription = StoreSubscription::query()->create([
            'store_id' => $store->id,
            'subscription_plan_id' => $plan->id,
            'status' => SubscriptionStatus::ACTIVE->value,
            'starts_at' => now(),
            'ends_at' => now()->addDays(30),
            'activated_at' => now(),
            'price_snapshot' => $plan->price,
            'currency_snapshot' => $plan->currency,
            'plan_name_ar_snapshot' => $plan->name_ar,
            'plan_name_en_snapshot' => $plan->name_en,
        ]);

        $this->assertTrue($subscription->isCurrentlyValid());
        $this->assertNotNull($store->fresh()->currentSubscription);
        $this->assertTrue($store->fresh()->isPubliclyVisible());
    }

    public function test_future_subscription_is_not_currently_valid(): void
    {
        $store = Store::factory()->create(['status' => StoreStatus::APPROVED->value, 'is_active' => true]);
        $plan = SubscriptionPlan::factory()->create(['duration_days' => 30]);

        $subscription = StoreSubscription::query()->create([
            'store_id' => $store->id,
            'subscription_plan_id' => $plan->id,
            'status' => SubscriptionStatus::ACTIVE->value,
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDays(31),
            'activated_at' => now(),
            'price_snapshot' => $plan->price,
            'currency_snapshot' => $plan->currency,
            'plan_name_ar_snapshot' => $plan->name_ar,
            'plan_name_en_snapshot' => $plan->name_en,
        ]);

        $this->assertFalse($subscription->isCurrentlyValid());
        $this->assertNull($store->fresh()->currentSubscription);
    }

    public function test_admin_store_endpoints_expose_visibility_after_assign(): void
    {
        $admin = $this->createAdminUser();
        $token = $admin->createToken('admin')->plainTextToken;

        $store = Store::factory()->approved()->create(['is_active' => true]);
        $plan = SubscriptionPlan::factory()->create(['duration_days' => 30]);

        $this->withToken($token)->postJson('/api/v1/admin/subscriptions/assign', [
            'store_public_id' => $store->public_id,
            'subscription_plan_public_id' => $plan->public_id,
        ])->assertCreated()
            ->assertJsonPath('data.is_currently_valid', true);

        $this->withToken($token)
            ->getJson("/api/v1/admin/stores/{$store->public_id}")
            ->assertOk()
            ->assertJsonPath('data.has_active_subscription', true)
            ->assertJsonPath('data.is_publicly_visible', true);

        $list = $this->withToken($token)
            ->getJson('/api/v1/admin/stores?per_page=100')
            ->assertOk()
            ->json('data');

        $row = collect($list)->firstWhere('public_id', $store->public_id);
        $this->assertNotNull($row);
        $this->assertTrue($row['has_active_subscription']);
        $this->assertTrue($row['is_publicly_visible']);
    }
}
