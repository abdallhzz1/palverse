<?php

namespace Tests\Feature\Api\V1;

use App\Models\Store;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Services\StoreSubscriptionService;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class NotificationTriggerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_approving_store_notifies_owner()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $store = Store::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($admin)->patchJson("/api/v1/admin/stores/{$store->public_id}/approve");

        $response->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $store->owner->id,
            'type' => 'App\Notifications\StoreApprovedNotification',
        ]);

        $notification = $store->owner->notifications()->first();
        $this->assertEquals('store_approved', $notification->data['type']);
        $this->assertEquals($store->public_id, $notification->data['entity_public_id']);
    }

    public function test_rejecting_store_notifies_owner()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $store = Store::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($admin)->patchJson("/api/v1/admin/stores/{$store->public_id}/reject", [
            'rejection_reason' => 'Incomplete information',
        ]);

        $response->assertStatus(200);

        $notification = $store->owner->notifications()->where('type', 'App\Notifications\StoreRejectedNotification')->first();
        $this->assertNotNull($notification);
        $this->assertEquals('store_rejected', $notification->data['type']);
        $this->assertEquals('Incomplete information', $notification->data['metadata']['rejection_reason']);
    }

    public function test_activating_store_notifies_owner()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $store = Store::factory()->create(['status' => 'approved', 'is_active' => false]);

        $response = $this->actingAs($admin)->patchJson("/api/v1/admin/stores/{$store->public_id}/activate");

        $response->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $store->owner->id,
            'type' => 'App\Notifications\StoreActivatedNotification',
        ]);
    }

    public function test_deactivating_store_notifies_owner()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $store = Store::factory()->create(['status' => 'approved', 'is_active' => true]);

        $response = $this->actingAs($admin)->patchJson("/api/v1/admin/stores/{$store->public_id}/deactivate");

        $response->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $store->owner->id,
            'type' => 'App\Notifications\StoreDeactivatedNotification',
        ]);
    }

    public function test_assigning_subscription_notifies_owner()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $store = Store::factory()->create();
        $plan = SubscriptionPlan::factory()->create(['is_active' => true, 'duration_days' => 30]);

        $response = $this->actingAs($admin)->postJson('/api/v1/admin/subscriptions/assign', [
            'store_public_id' => $store->public_id,
            'subscription_plan_public_id' => $plan->public_id,
        ]);

        $response->assertStatus(201);

        $notification = $store->owner->notifications()->where('type', 'App\Notifications\SubscriptionAssignedNotification')->first();
        $this->assertNotNull($notification);
        $this->assertEquals('subscription_assigned', $notification->data['type']);
    }

    public function test_cancelling_subscription_notifies_owner()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $store = Store::factory()->withSubscription()->create();
        $subscription = $store->currentSubscription;

        $response = $this->actingAs($admin)->patchJson("/api/v1/admin/subscriptions/{$subscription->public_id}/cancel", [
            'cancellation_reason' => 'Requested by user',
        ]);

        $response->assertStatus(200);

        $notification = $store->owner->notifications()->where('type', 'App\Notifications\SubscriptionCancelledNotification')->first();
        $this->assertNotNull($notification);
        $this->assertEquals('Requested by user', $notification->data['metadata']['cancellation_reason']);
    }

    public function test_expiring_soon_command_notifies_owner_and_is_idempotent()
    {
        $store = Store::factory()->withSubscription()->create();
        $subscription = $store->currentSubscription;

        // Update subscription to expire in exactly 5 days
        $subscription->update(['ends_at' => now()->addDays(5)]);

        // Run command looking for subscriptions expiring within 7 days
        Artisan::call('subscriptions:notify-expiring', ['--days' => 7]);

        $notifications = $store->owner->notifications()->where('type', 'App\Notifications\SubscriptionExpiringSoonNotification')->get();
        $this->assertCount(1, $notifications);

        // Run again, should be deduplicated
        Artisan::call('subscriptions:notify-expiring', ['--days' => 7]);

        $notificationsAfter = $store->owner->notifications()->where('type', 'App\Notifications\SubscriptionExpiringSoonNotification')->get();
        $this->assertCount(1, $notificationsAfter); // Still 1
    }

    public function test_expiration_command_notifies_owner_and_is_idempotent()
    {
        $store = Store::factory()->withSubscription()->create();
        $subscription = $store->currentSubscription;

        // Update subscription to be expired time-wise but still active status
        $subscription->update(['ends_at' => now()->subDay()]);

        Artisan::call('subscriptions:expire');

        $notifications = $store->owner->notifications()->where('type', 'App\Notifications\SubscriptionExpiredNotification')->get();
        $this->assertCount(1, $notifications);

        // Force it back to test deduplication explicitly even if status prevents selection
        // Actually, if we just check the deduplication, we can call the service directly
        $service = app(StoreSubscriptionService::class);
        $subscription->update(['status' => 'active', 'ends_at' => now()->subDay()]);

        $service->expireOutdatedSubscriptions();

        $notificationsAfter = $store->owner->notifications()->where('type', 'App\Notifications\SubscriptionExpiredNotification')->get();
        $this->assertCount(1, $notificationsAfter); // Still 1
    }
}
