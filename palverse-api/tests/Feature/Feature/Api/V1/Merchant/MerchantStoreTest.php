<?php

namespace Tests\Feature\Feature\Api\V1\Merchant;

use App\Enums\StoreStatus;
use App\Models\Category;
use App\Models\City;
use App\Models\Store;
use App\Models\User;
use App\Models\Zone;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MerchantStoreTest extends TestCase
{
    use RefreshDatabase;

    private User $merchant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $this->merchant = User::factory()->create();
        $this->merchant->assignRole('merchant');
    }

    public function test_guest_cannot_access_merchant_store_routes(): void
    {
        $this->getJson('/api/v1/merchant/stores')->assertUnauthorized();
    }

    public function test_merchant_cannot_self_create_a_store(): void
    {
        $category = Category::factory()->create();
        $city = City::factory()->create();
        $zone = Zone::factory()->create(['city_id' => $city->id]);

        $payload = [
            'category_public_id' => $category->public_id,
            'city_public_id' => $city->public_id,
            'zone_public_id' => $zone->public_id,
            'name_ar' => 'متجر اختبار',
            'description_ar' => 'وصف المتجر',
            'phone' => '123456789',
            'address_ar' => 'عنوان الاختبار',
        ];

        $this->actingAs($this->merchant)
            ->postJson('/api/v1/merchant/stores', $payload)
            ->assertForbidden()
            ->assertJsonPath('error.code', 'MERCHANT_SELF_STORE_CREATE_DISABLED');

        $this->assertDatabaseMissing('stores', [
            'name_ar' => 'متجر اختبار',
        ]);
    }

    public function test_zone_must_belong_to_selected_city(): void
    {
        $category = Category::factory()->create();
        $city1 = City::factory()->create();
        $city2 = City::factory()->create();
        $zone = Zone::factory()->create(['city_id' => $city2->id]);

        $payload = [
            'category_public_id' => $category->public_id,
            'city_public_id' => $city1->public_id, // mismatch
            'zone_public_id' => $zone->public_id,
            'name_ar' => 'متجر اختبار',
            'description_ar' => 'وصف المتجر',
            'phone' => '123456789',
            'address_ar' => 'عنوان الاختبار',
        ];

        $this->actingAs($this->merchant)
            ->postJson('/api/v1/merchant/stores', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['zone_public_id']);
    }

    public function test_merchant_can_list_only_owned_stores(): void
    {
        Store::factory()->count(2)->create(['owner_id' => $this->merchant->id]);

        $otherMerchant = User::factory()->create();
        Store::factory()->create(['owner_id' => $otherMerchant->id]);

        $response = $this->actingAs($this->merchant)
            ->getJson('/api/v1/merchant/stores')
            ->assertOk();

        $this->assertCount(2, $response->json('data'));
    }

    public function test_merchant_cannot_view_another_merchants_store(): void
    {
        $otherMerchant = User::factory()->create();
        $store = Store::factory()->create(['owner_id' => $otherMerchant->id]);

        $this->actingAs($this->merchant)
            ->getJson("/api/v1/merchant/stores/{$store->public_id}")
            ->assertForbidden();
    }

    public function test_rejected_store_can_be_edited_and_resubmitted(): void
    {
        $store = Store::factory()->rejected()->create([
            'owner_id' => $this->merchant->id,
            'rejection_reason' => 'Fix description',
        ]);

        $payload = [
            'description_ar' => 'وصف محدث',
        ];

        $this->actingAs($this->merchant)
            ->putJson("/api/v1/merchant/stores/{$store->public_id}", $payload)
            ->assertOk()
            ->assertJsonPath('data.status', StoreStatus::PENDING->value)
            ->assertJsonPath('data.rejection_reason', null);

        $this->assertDatabaseHas('stores', [
            'id' => $store->id,
            'status' => StoreStatus::PENDING->value,
            'rejection_reason' => null,
        ]);

        $this->assertDatabaseHas('store_status_history', [
            'store_id' => $store->id,
            'action' => 'resubmitted',
            'new_status' => StoreStatus::PENDING->value,
        ]);
    }
}
