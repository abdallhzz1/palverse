<?php

namespace Tests\Feature\EndToEnd;

use App\Enums\CommissionStatus;
use App\Enums\StoreRequestStatus;
use App\Models\Category;
use App\Models\City;
use App\Models\StoreRegistrationRequest;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class StoreRegistrationRequestWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $representative;
    private User $merchant;
    private Zone $zone;
    private City $city;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->representative = User::factory()->create();
        $this->representative->assignRole('representative');

        $this->merchant = User::factory()->create();
        $this->merchant->assignRole('merchant');

        $this->city = City::create(['name_ar' => 'Test City', 'public_id' => Str::ulid(), 'is_active' => true]);
        $this->zone = Zone::create(['city_id' => $this->city->id, 'name_ar' => 'Test Zone', 'public_id' => Str::ulid(), 'is_active' => true]);
        $this->category = Category::create(['name_ar' => 'Test Category', 'public_id' => Str::ulid(), 'is_active' => true]);
        
        $this->representative->representativeZoneAssignments()->create([
            'public_id' => Str::ulid(),
            'zone_id' => $this->zone->id,
            'is_active' => true,
        ]);
    }

    public function test_full_admin_review_workflow_converts_request_to_store_and_merchant()
    {
        $request = StoreRegistrationRequest::create([
            'public_id' => (string) Str::ulid(),
            'representative_id' => $this->representative->id,
            'zone_id' => $this->zone->id,
            'city_id' => $this->city->id,
            'category_id' => $this->category->id,
            'proposed_merchant_name' => 'New Merchant',
            'proposed_merchant_phone' => '0599000111',
            'proposed_merchant_email' => 'new.merchant@palverse.demo',
            'store_name_ar' => 'متجر جديد',
            'phone' => '0599000222',
            'address_ar' => 'شارع التست',
            'status' => StoreRequestStatus::SUBMITTED->value,
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)->postJson('/api/v1/admin/store-requests/' . $request->public_id . '/review', [
            'action' => 'approve',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.status', StoreRequestStatus::APPROVED->value);

        $request->refresh();
        
        $this->assertEquals(StoreRequestStatus::APPROVED, $request->status);
        $this->assertNotNull($request->resulting_store_id);
        $this->assertNotNull($request->resulting_merchant_user_id);
        
        $merchant = User::find($request->resulting_merchant_user_id);
        $this->assertNotNull($merchant);
        $this->assertEquals('New Merchant', $merchant->name);
        $this->assertEquals('new.merchant@palverse.demo', $merchant->email);
        $this->assertTrue($merchant->hasRole('merchant'));

        $store = \App\Models\Store::find($request->resulting_store_id);
        $this->assertNotNull($store);
        $this->assertEquals('متجر جديد', $store->name_ar);
        $this->assertEquals($merchant->id, $store->owner_id);

        $this->assertDatabaseHas('commission_records', [
            'store_registration_request_id' => $request->id,
            'representative_id' => $this->representative->id,
            'status' => CommissionStatus::PENDING->value,
        ]);
    }

    public function test_representative_cannot_review_requests()
    {
        $request = StoreRegistrationRequest::create([
            'public_id' => (string) Str::ulid(),
            'representative_id' => $this->representative->id,
            'zone_id' => $this->zone->id,
            'city_id' => $this->city->id,
            'proposed_merchant_name' => 'New Merchant',
            'proposed_merchant_phone' => '0599000111',
            'store_name_ar' => 'متجر جديد',
            'phone' => '0599000222',
            'address_ar' => 'شارع التست',
            'status' => StoreRequestStatus::SUBMITTED->value,
        ]);

        $response = $this->actingAs($this->representative)->postJson('/api/v1/admin/store-requests/' . $request->public_id . '/review', [
            'action' => 'approve',
        ]);

        $response->assertForbidden();
    }

    public function test_admin_cannot_approve_request_without_category(): void
    {
        $request = StoreRegistrationRequest::create([
            'public_id' => (string) Str::ulid(),
            'representative_id' => $this->representative->id,
            'zone_id' => $this->zone->id,
            'city_id' => $this->city->id,
            'category_id' => null,
            'proposed_merchant_name' => 'New Merchant',
            'proposed_merchant_phone' => '0599000333',
            'store_name_ar' => 'متجر بدون تصنيف',
            'phone' => '0599000444',
            'address_ar' => 'شارع التست',
            'status' => StoreRequestStatus::SUBMITTED->value,
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)->postJson('/api/v1/admin/store-requests/' . $request->public_id . '/review', [
            'action' => 'approve',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['category_id']);
        $this->assertDatabaseMissing('stores', ['name_ar' => 'متجر بدون تصنيف']);
    }
}
