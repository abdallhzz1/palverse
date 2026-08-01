<?php

namespace Tests\Feature\Api\V1;

use App\Models\Category;
use App\Models\City;
use App\Models\Store;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\Zone;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreSpecialtiesAndVerificationTest extends TestCase
{
    use RefreshDatabase;

    private User $followUp;

    private Category $primary;

    private Category $extra;

    private Store $store;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->followUp = User::factory()->create();
        $this->followUp->assignRole('follow_up');

        $merchant = User::factory()->create();
        $merchant->assignRole('merchant');

        $this->primary = Category::factory()->create(['slug' => 'restaurants', 'name_ar' => 'مطاعم']);
        $this->extra = Category::factory()->create(['slug' => 'cafes', 'name_ar' => 'مقاهي']);
        $city = City::factory()->create();
        $zone = Zone::factory()->create(['city_id' => $city->id]);
        SubscriptionPlan::factory()->create(['is_active' => true]);

        $this->store = Store::factory()->withSubscription()->create([
            'owner_id' => $merchant->id,
            'category_id' => $this->primary->id,
            'city_id' => $city->id,
            'zone_id' => $zone->id,
            'status' => 'approved',
            'is_active' => true,
            'is_verified' => false,
        ]);
        $this->store->syncSpecialties([$this->primary->id], $this->primary->id);
    }

    public function test_follow_up_can_assign_multiple_specialties(): void
    {
        $response = $this->actingAs($this->followUp, 'sanctum')
            ->putJson("/api/v1/follow-up/stores/{$this->store->public_id}", [
                'category_public_id' => $this->primary->public_id,
                'category_public_ids' => [
                    $this->primary->public_id,
                    $this->extra->public_id,
                ],
            ]);

        $response->assertOk()
            ->assertJsonPath('data.category.slug', 'restaurants')
            ->assertJsonCount(2, 'data.categories');

        $this->assertDatabaseHas('category_store', [
            'store_id' => $this->store->id,
            'category_id' => $this->extra->id,
        ]);
    }

    public function test_search_matches_specialty_category_slug(): void
    {
        $this->store->syncSpecialties([$this->primary->id, $this->extra->id], $this->primary->id);

        $response = $this->getJson('/api/v1/stores?category=cafes');

        $response->assertOk();
        $this->assertTrue(collect($response->json('data'))->contains(
            fn ($row) => $row['public_id'] === $this->store->public_id
        ));
    }

    public function test_follow_up_can_verify_and_unverify_store(): void
    {
        $verify = $this->actingAs($this->followUp, 'sanctum')
            ->patchJson("/api/v1/follow-up/stores/{$this->store->public_id}/verify");

        $verify->assertOk()
            ->assertJsonPath('data.is_verified', true);

        $this->assertDatabaseHas('stores', [
            'id' => $this->store->id,
            'is_verified' => true,
            'verified_by' => $this->followUp->id,
        ]);

        $unverify = $this->actingAs($this->followUp, 'sanctum')
            ->patchJson("/api/v1/follow-up/stores/{$this->store->public_id}/unverify");

        $unverify->assertOk()
            ->assertJsonPath('data.is_verified', false);
    }

    public function test_public_list_exposes_verified_and_categories(): void
    {
        $this->store->syncSpecialties([$this->primary->id, $this->extra->id], $this->primary->id);
        $this->store->markVerified($this->followUp);

        $response = $this->getJson('/api/v1/stores');

        $response->assertOk();
        $row = collect($response->json('data'))->firstWhere('public_id', $this->store->public_id);
        $this->assertNotNull($row);
        $this->assertTrue($row['is_verified']);
        $this->assertCount(2, $row['categories']);
        $this->assertArrayHasKey('zone', $row);
        $this->assertArrayHasKey('city', $row);
    }
}
