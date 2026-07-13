<?php

namespace Tests\Feature\Api\V1;

use App\Models\Category;
use App\Models\City;
use App\Models\Store;
use App\Models\User;
use App\Models\Zone;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class DashboardStatsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $merchant;

    protected User $otherMerchant;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->merchant = User::factory()->create();
        $this->merchant->assignRole('merchant');

        $this->otherMerchant = User::factory()->create();
        $this->otherMerchant->assignRole('merchant');
    }

    /**
     * Test guest cannot access admin dashboard.
     */
    public function test_guest_cannot_access_admin_dashboard(): void
    {
        $this->getJson('/api/v1/admin/dashboard/summary')->assertStatus(401);
    }

    /**
     * Test merchant cannot access admin dashboard.
     */
    public function test_merchant_cannot_access_admin_dashboard(): void
    {
        $this->actingAs($this->merchant)
            ->getJson('/api/v1/admin/dashboard/summary')
            ->assertStatus(403);
    }

    /**
     * Test admin can access summary stats.
     */
    public function test_admin_can_access_summary(): void
    {
        // Create 2 users (including admin/merchant, so 4 total)
        User::factory()->create(['status' => 'suspended']);

        // Create categories
        $category = Category::factory()->create();
        $city = City::factory()->create();
        $zone = Zone::factory()->create(['city_id' => $city->id]);

        // Create a store with active subscription
        $store = Store::factory()->withSubscription()->create([
            'owner_id' => $this->merchant->id,
            'category_id' => $category->id,
            'city_id' => $city->id,
            'zone_id' => $zone->id,
            'status' => 'approved',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/dashboard/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'users',
                    'stores',
                    'subscriptions',
                    'offers',
                    'taxonomy',
                    'notifications',
                ],
                'meta',
            ])
            ->assertJsonPath('data.users.total_users', 4) // admin, merchant, otherMerchant, suspended
            ->assertJsonPath('data.users.suspended_users', 1)
            ->assertJsonPath('data.stores.total_stores', 1)
            ->assertJsonPath('data.stores.publicly_visible_stores', 1)
            ->assertJsonPath('data.subscriptions.active_subscriptions', 1)
            ->assertJsonPath('data.taxonomy.active_categories', 1);
    }

    /**
     * Test date range filters boundary validation.
     */
    public function test_date_range_validation(): void
    {
        // 1. Default range is last 30 days
        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/dashboard/summary');

        $meta = $response->json('meta');
        $this->assertEquals('last_30_days', $meta['period']);

        $expectedFrom = now()->subDays(29)->startOfDay()->toIso8601String();
        $this->assertEquals(Carbon::parse($expectedFrom)->toDateString(), Carbon::parse($meta['from'])->toDateString());

        // 2. Custom period requires from and to
        $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/dashboard/summary?period=custom')
            ->assertStatus(422);

        // 3. Custom period to must be >= from
        $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/dashboard/summary?period=custom&from=2026-07-15&to=2026-07-10')
            ->assertStatus(422);

        // 4. Excessive range fails (> 366 days)
        $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/dashboard/summary?period=custom&from=2025-01-01&to=2026-02-01')
            ->assertStatus(422);
    }

    /**
     * Test admin breakdown endpoints and limit parameter.
     */
    public function test_admin_breakdown_endpoints(): void
    {
        $category1 = Category::factory()->create(['name_ar' => 'أ']);
        $category2 = Category::factory()->create(['name_ar' => 'ب']);

        Store::factory()->create(['category_id' => $category1->id, 'status' => 'approved']);
        Store::factory()->create(['category_id' => $category1->id, 'status' => 'pending']);
        Store::factory()->create(['category_id' => $category2->id, 'status' => 'rejected']);

        // Test stores-by-status
        $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/dashboard/stores-by-status')
            ->assertStatus(200)
            ->assertJsonPath('data.0.key', 'approved')
            ->assertJsonPath('data.0.count', 1);

        // Test stores-by-category with limit
        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/dashboard/stores-by-category?limit=1');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    /**
     * Test trend endpoint results are zero-filled and chronologically ordered.
     */
    public function test_trend_endpoint(): void
    {
        Carbon::setTestNow('2026-07-14 12:00:00');

        // Create 2 stores on 2026-07-12
        Store::factory()->create(['created_at' => '2026-07-12 10:00:00']);
        Store::factory()->create(['created_at' => '2026-07-12 15:00:00']);
        // Create 1 store on 2026-07-14
        Store::factory()->create(['created_at' => '2026-07-14 11:00:00']);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/dashboard/trends?metric=stores&grouping=day&period=custom&from=2026-07-10&to=2026-07-15');

        $response->assertStatus(200);
        $data = $response->json('data');

        // Total 6 days (10, 11, 12, 13, 14, 15)
        $this->assertCount(6, $data);

        // Verify chronological order and counts
        $this->assertEquals('2026-07-10', $data[0]['period']);
        $this->assertEquals(0, $data[0]['count']);

        $this->assertEquals('2026-07-12', $data[2]['period']);
        $this->assertEquals(2, $data[2]['count']);

        $this->assertEquals('2026-07-14', $data[4]['period']);
        $this->assertEquals(1, $data[4]['count']);

        Carbon::setTestNow();
    }

    /**
     * Test merchant dashboard scopes summary to owned stores.
     */
    public function test_merchant_summary_scopes_to_ownership(): void
    {
        // Store owned by merchant
        $myStore = Store::factory()->create(['owner_id' => $this->merchant->id, 'status' => 'approved']);
        // Store owned by someone else
        $otherStore = Store::factory()->create(['owner_id' => $this->otherMerchant->id, 'status' => 'approved']);

        // Eagerly assert merchant summary
        $response = $this->actingAs($this->merchant)
            ->getJson('/api/v1/merchant/dashboard/summary');

        $response->assertStatus(200)
            ->assertJsonPath('data.stores.total_stores', 1)
            ->assertJsonPath('data.stores.approved_stores', 1);
    }

    /**
     * Test store-level merchant dashboard profile completeness and readiness.
     */
    public function test_merchant_store_dashboard(): void
    {
        $store = Store::factory()->create([
            'owner_id' => $this->merchant->id,
            'status' => 'pending',
            'is_active' => false,
            'name_ar' => 'محل ياسمين',
            'description_ar' => 'وصف محل ياسمين',
            'phone' => '0599000000',
        ]);

        // 1. Unrelated merchant cannot view it
        $this->actingAs($this->otherMerchant)
            ->getJson("/api/v1/merchant/stores/{$store->public_id}/dashboard")
            ->assertStatus(403);

        // 2. Owner can view it
        $response = $this->actingAs($this->merchant)
            ->getJson("/api/v1/merchant/stores/{$store->public_id}/dashboard");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'store_status',
                    'subscription',
                    'offers',
                    'profile_completion' => [
                        'percentage',
                        'completed',
                        'total',
                        'checks',
                    ],
                    'public_readiness' => [
                        'ready',
                        'blocking_reasons',
                    ],
                ],
            ]);

        // Verify blocking reasons due to pending status, inactive status, and no subscription
        $reasons = $response->json('data.public_readiness.blocking_reasons');
        $this->assertContains('NOT_APPROVED', $reasons);
        $this->assertContains('INACTIVE', $reasons);
        $this->assertContains('NO_ACTIVE_SUBSCRIPTION', $reasons);
    }
}
