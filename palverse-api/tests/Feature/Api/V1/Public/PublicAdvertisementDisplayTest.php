<?php

namespace Tests\Feature\Api\V1\Public;

use App\Enums\AdPlacement;
use App\Models\Store;
use App\Models\StoreAdvertisement;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class PublicAdvertisementDisplayTest extends TestCase
{
    use RefreshDatabase;

    private Store $store;

    private User $creator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->creator = User::factory()->create();
        $this->creator->assignRole('follow_up');

        $owner = User::factory()->create();
        $owner->assignRole('merchant');

        $this->store = Store::factory()->create([
            'owner_id' => $owner->id,
            'status' => 'approved',
            'is_active' => true,
            'slug' => 'test-ad-store',
        ]);

        $plan = SubscriptionPlan::factory()->create();
        $this->store->currentSubscription()->create([
            'public_id' => (string) Str::ulid(),
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
            'price_snapshot' => 100,
            'currency_snapshot' => 'ILS',
            'plan_name_ar_snapshot' => 'خطة',
            'plan_name_en_snapshot' => 'Plan',
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addYear(),
        ]);
    }

    public function test_public_banners_endpoint_requires_placement_and_filters_by_it(): void
    {
        StoreAdvertisement::create([
            'store_id' => $this->store->id,
            'ad_type' => 'banner',
            'placement' => AdPlacement::HOME_HERO,
            'image_path' => 'advertisements/demo-banner.jpg',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
            'amount_paid' => 120,
            'notes' => null,
            'created_by' => $this->creator->id,
            'is_active' => true,
        ]);

        StoreAdvertisement::create([
            'store_id' => $this->store->id,
            'ad_type' => 'banner',
            'placement' => AdPlacement::STORE_SIDEBAR,
            'image_path' => 'advertisements/sidebar.jpg',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
            'amount_paid' => 90,
            'created_by' => $this->creator->id,
            'is_active' => true,
        ]);

        StoreAdvertisement::create([
            'store_id' => $this->store->id,
            'ad_type' => 'featured_store',
            'image_path' => null,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
            'amount_paid' => 80,
            'notes' => null,
            'created_by' => $this->creator->id,
            'is_active' => true,
        ]);

        $this->getJson('/api/v1/advertisements/banners')
            ->assertStatus(422);

        $this->getJson('/api/v1/advertisements/banners?placement=home_hero')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.store.slug', 'test-ad-store')
            ->assertJsonPath('data.0.placement', 'home_hero')
            ->assertJsonPath('meta.placement_meta.recommended_size', '1400×600');

        $this->getJson('/api/v1/advertisements/banners?placement=store_sidebar')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.placement', 'store_sidebar');
    }

    public function test_store_search_is_featured_returns_only_featured_store_ads(): void
    {
        StoreAdvertisement::create([
            'store_id' => $this->store->id,
            'ad_type' => 'featured_store',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(3)->toDateString(),
            'amount_paid' => 50,
            'created_by' => $this->creator->id,
            'is_active' => true,
        ]);

        $this->getJson('/api/v1/stores?is_featured=true')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonFragment(['public_id' => $this->store->public_id]);
    }

    public function test_public_banners_can_exclude_current_store(): void
    {
        $otherOwner = User::factory()->create();
        $otherOwner->assignRole('merchant');
        $other = Store::factory()->create([
            'owner_id' => $otherOwner->id,
            'status' => 'approved',
            'is_active' => true,
            'slug' => 'other-ad-store',
        ]);
        $plan = SubscriptionPlan::factory()->create();
        $other->currentSubscription()->create([
            'public_id' => (string) Str::ulid(),
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
            'price_snapshot' => 100,
            'currency_snapshot' => 'ILS',
            'plan_name_ar_snapshot' => 'خطة',
            'plan_name_en_snapshot' => 'Plan',
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addYear(),
        ]);

        StoreAdvertisement::create([
            'store_id' => $this->store->id,
            'ad_type' => 'banner',
            'placement' => AdPlacement::STORE_SIDEBAR,
            'image_path' => 'advertisements/self.jpg',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
            'amount_paid' => 120,
            'created_by' => $this->creator->id,
            'is_active' => true,
        ]);
        StoreAdvertisement::create([
            'store_id' => $other->id,
            'ad_type' => 'banner',
            'placement' => AdPlacement::STORE_SIDEBAR,
            'image_path' => 'advertisements/other.jpg',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
            'amount_paid' => 120,
            'created_by' => $this->creator->id,
            'is_active' => true,
        ]);

        $this->getJson('/api/v1/advertisements/banners?placement=store_sidebar&exclude_store='.$this->store->public_id)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.store.slug', 'other-ad-store');
    }

    public function test_store_list_marks_featured_stores(): void
    {
        StoreAdvertisement::create([
            'store_id' => $this->store->id,
            'ad_type' => 'featured_store',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(3)->toDateString(),
            'amount_paid' => 50,
            'created_by' => $this->creator->id,
            'is_active' => true,
        ]);

        $this->getJson('/api/v1/stores')
            ->assertOk()
            ->assertJsonFragment([
                'public_id' => $this->store->public_id,
                'is_featured' => true,
            ]);
    }
}
