<?php

namespace Tests\Feature\Api\V1;

use App\Models\Category;
use App\Models\City;
use App\Models\Offer;
use App\Models\Store;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\Zone;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Tests\TestCase;

class StoreSearchTest extends TestCase
{
    use RefreshDatabase;

    protected User $merchant;

    protected Category $category;

    protected City $city;

    protected Zone $zone;

    protected SubscriptionPlan $plan;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->merchant = User::factory()->create();
        $this->merchant->assignRole('merchant');

        $this->category = Category::factory()->create(['name_ar' => 'ملابس', 'name_en' => 'Clothing', 'slug' => 'clothing']);
        $this->city = City::factory()->create(['name_ar' => 'رام الله', 'name_en' => 'Ramallah']);
        $this->zone = Zone::factory()->create(['city_id' => $this->city->id, 'name_ar' => 'المنارة', 'name_en' => 'Al-Manara']);

        $this->plan = SubscriptionPlan::factory()->create(['is_active' => true]);
    }

    protected function createPublicStore(array $attributes = []): Store
    {
        return Store::factory()->withSubscription()->create(array_merge([
            'owner_id' => $this->merchant->id,
            'category_id' => $this->category->id,
            'city_id' => $this->city->id,
            'zone_id' => $this->zone->id,
            'status' => 'approved',
            'is_active' => true,
        ], $attributes));
    }

    /**
     * Test guest can search stores by Arabic and English text query.
     */
    public function test_text_search(): void
    {
        // 1. Create matching stores
        $store1 = $this->createPublicStore(['name_ar' => 'أحمد للملبوسات', 'name_en' => 'Ahmed Clothing']);
        $store2 = $this->createPublicStore(['name_ar' => 'ياسمين بازار', 'name_en' => 'Yasmin Bazar', 'description_ar' => 'أرقى الأزياء']);

        // 2. Exact match & Arabic normalization check (أ/ا Yeh/Maksura)
        $response = $this->getJson('/api/v1/stores?query=احمد');
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals($store1->public_id, $response->json('data.0.public_id'));

        // 3. Case-insensitive English search
        $response = $this->getJson('/api/v1/stores?query=yAsMiN');
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));

        // 4. Description search
        $response = $this->getJson('/api/v1/stores?query=أزياء');
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    /**
     * Test hidden stores or stores without active subscriptions are excluded from search.
     */
    public function test_visibility_in_search(): void
    {
        // 1. Pending store
        Store::factory()->create([
            'name_ar' => 'معلق',
            'status' => 'pending',
            'is_active' => true,
        ]);

        // 2. Approved but inactive store
        Store::factory()->create([
            'name_ar' => 'غير نشط',
            'status' => 'approved',
            'is_active' => false,
        ]);

        // 3. Approved & Active but no subscription
        Store::factory()->create([
            'name_ar' => 'بدون اشتراك',
            'status' => 'approved',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/stores');
        $response->assertStatus(200);
        $this->assertCount(0, $response->json('data'));
    }

    /**
     * Test filter parameters.
     */
    public function test_filters(): void
    {
        $store = $this->createPublicStore();

        // 1. Filter by category slug
        $this->getJson('/api/v1/stores?category=clothing')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/stores?category=invalid-slug')->assertJsonCount(0, 'data');

        // 2. Filter by city & zone
        $this->getJson("/api/v1/stores?city={$this->city->public_id}")->assertJsonCount(1, 'data');
        $this->getJson("/api/v1/stores?zone={$this->zone->public_id}")->assertJsonCount(1, 'data');

        // 3. Mismatched city and zone returns 422
        $otherCity = City::factory()->create();
        $response = $this->getJson("/api/v1/stores?city={$otherCity->public_id}&zone={$this->zone->public_id}");
        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'SEARCH_ZONE_CITY_MISMATCH');
    }

    /**
     * Test offers filters.
     */
    public function test_offers_filters(): void
    {
        $store = $this->createPublicStore();

        // Initially no offers
        $this->getJson('/api/v1/stores?has_offers=true')->assertJsonCount(0, 'data');

        // Create an offer
        $offer = Offer::create([
            'store_id' => $store->id,
            'public_id' => (string) Str::ulid(),
            'title_ar' => 'خصم',
            'title_en' => 'Discount',
            'is_active' => true,
            'starts_at' => now()->subDays(1),
            'ends_at' => now()->addDays(5),
        ]);

        $this->getJson('/api/v1/stores?has_offers=true')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/stores?offer_active_now=true')->assertJsonCount(1, 'data');

        // Expire offer
        $offer->update(['ends_at' => now()->subDays(1)]);
        $this->getJson('/api/v1/stores?offer_active_now=true')->assertJsonCount(0, 'data');
    }

    /**
     * Test open now filter.
     */
    public function test_open_now_filter(): void
    {
        $store = $this->createPublicStore();
        $now = Carbon::now(config('app.timezone'));

        // No schedule -> excluded
        $this->getJson('/api/v1/stores?open_now=true')->assertJsonCount(0, 'data');

        // Open schedule
        $store->workingHours()->create([
            'day_of_week' => $now->dayOfWeek,
            'period_index' => 1,
            'opens_at' => '00:00:00',
            'closes_at' => '23:59:59',
            'is_closed' => false,
        ]);

        $this->getJson('/api/v1/stores?open_now=true')->assertJsonCount(1, 'data');
    }

    /**
     * Test sorting options.
     */
    public function test_sorting(): void
    {
        $storeA = $this->createPublicStore(['name_ar' => 'أ متجر', 'name_en' => 'A Store', 'created_at' => now()->subDays(2)]);
        $storeB = $this->createPublicStore(['name_ar' => 'ب متجر', 'name_en' => 'B Store', 'created_at' => now()->subDays(1)]);

        // 1. newest
        $response = $this->getJson('/api/v1/stores?sort=newest');
        $this->assertEquals($storeB->public_id, $response->json('data.0.public_id'));

        // 2. oldest
        $response = $this->getJson('/api/v1/stores?sort=oldest');
        $this->assertEquals($storeA->public_id, $response->json('data.0.public_id'));

        // 3. name_ar
        $response = $this->getJson('/api/v1/stores?sort=name_ar');
        $this->assertEquals($storeA->public_id, $response->json('data.0.public_id'));
    }

    /**
     * Test suggestions endpoint.
     */
    public function test_suggestions_endpoint(): void
    {
        $this->createPublicStore(['name_ar' => 'بيت ياسمين', 'name_en' => 'Yasmin House']);

        // Query required & min length 2 check
        $this->getJson('/api/v1/search/suggestions?query=a')->assertStatus(422);

        $response = $this->getJson('/api/v1/search/suggestions?query=ياسمين');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'type',
                        'public_id',
                        'slug',
                        'label_ar',
                        'label_en',
                        'secondary_label_ar',
                        'secondary_label_en',
                        'url',
                    ],
                ],
                'meta',
            ]);
    }

    /**
     * Test related stores endpoint.
     */
    public function test_related_stores(): void
    {
        $storeMain = $this->createPublicStore(['slug' => 'main-store']);
        $storeRelated = $this->createPublicStore(['slug' => 'related-store']);

        // Related stores
        $response = $this->getJson('/api/v1/stores/main-store/related');
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals($storeRelated->public_id, $response->json('data.0.public_id'));

        // Invalid slug returns 404
        $this->getJson('/api/v1/stores/invalid-slug/related')->assertStatus(404);
    }
}
