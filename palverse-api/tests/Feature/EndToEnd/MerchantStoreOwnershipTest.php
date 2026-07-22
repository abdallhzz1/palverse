<?php

namespace Tests\Feature\EndToEnd;

use App\Models\Category;
use App\Models\City;
use App\Models\Store;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

class MerchantStoreOwnershipTest extends EndToEndTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure roles exist
        $this->artisan('db:seed', ['--class' => 'RolesAndPermissionsSeeder']);
        
        // Clear any auth state
        Auth::forgetGuards();
    }

    public function test_merchant_cannot_access_other_merchants_store_data()
    {
        // 1. Setup Merchants and Store
        $merchantA = User::factory()->create();
        $merchantA->assignRole('merchant');
        
        $merchantB = User::factory()->create();
        $merchantB->assignRole('merchant');

        $category = Category::factory()->create();
        $city = City::factory()->create();
        $zone = Zone::factory()->create(['city_id' => $city->id]);

        $storeA = Store::factory()->create([
            'owner_id' => $merchantA->id,
            'category_id' => $category->id,
            'city_id' => $city->id,
            'zone_id' => $zone->id,
        ]);

        // 2. Merchant A can access their own store
        $responseA = $this->actingAs($merchantA)
            ->getJson("/api/v1/merchant/stores/{$storeA->public_id}");
            
        $responseA->assertStatus(200)
            ->assertJsonPath('data.public_id', $storeA->public_id);

        Auth::forgetGuards();

        // 3. Merchant B CANNOT access Merchant A's store
        $responseB = $this->actingAs($merchantB)
            ->getJson("/api/v1/merchant/stores/{$storeA->public_id}");
            
        $responseB->assertStatus(403)
            ->assertJsonPath('error.code', 'STORE_ACCESS_DENIED');
            
        // 4. Merchant B CANNOT update Merchant A's store
        $updateResponse = $this->actingAs($merchantB)
            ->putJson("/api/v1/merchant/stores/{$storeA->public_id}", [
                'name_ar' => 'Hacked Name',
                'description_ar' => 'Hacked Description',
                'phone' => '0599000000',
                'address_ar' => 'Ramallah',
            ]);
            
        // The StorePolicy prevents update, usually returns 403.
        $updateResponse->assertStatus(403);
        
        // 5. Merchant B CANNOT see Merchant A's store dashboard details
        $dashResponse = $this->actingAs($merchantB)
            ->getJson("/api/v1/merchant/stores/{$storeA->public_id}/dashboard");
            
        $dashResponse->assertStatus(403);
        
        // 6. Merchant B CANNOT fetch links for Merchant A's store
        $linksResponse = $this->actingAs($merchantB)
            ->getJson("/api/v1/merchant/stores/{$storeA->public_id}/links");
            
        $linksResponse->assertStatus(403);
    }
}
