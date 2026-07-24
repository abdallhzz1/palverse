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

    public function test_approve_copies_optional_profile_extras_onto_store(): void
    {
        $days = [];
        for ($i = 0; $i < 7; $i++) {
            $days[] = [
                'day_of_week' => $i,
                'is_closed' => $i === 5,
                'periods' => $i === 5 ? [] : [
                    ['opens_at' => '09:00', 'closes_at' => '17:00'],
                ],
            ];
        }

        $request = StoreRegistrationRequest::create([
            'public_id' => (string) Str::ulid(),
            'representative_id' => $this->representative->id,
            'zone_id' => $this->zone->id,
            'city_id' => $this->city->id,
            'category_id' => $this->category->id,
            'proposed_merchant_name' => 'Merchant With Extras',
            'proposed_merchant_phone' => '0599000555',
            'proposed_merchant_email' => 'extras.merchant@palverse.demo',
            'store_name_ar' => 'متجر بالبيانات الإضافية',
            'phone' => '0599000666',
            'email' => 'store.extras@palverse.demo',
            'website' => 'https://example.com',
            'address_ar' => 'شارع التست',
            'status' => StoreRequestStatus::SUBMITTED->value,
            'submitted_at' => now(),
            'working_hours' => ['days' => $days],
            'social_links' => [
                ['platform' => 'facebook', 'url' => 'https://facebook.com/palverse-store', 'username' => null],
                ['platform' => 'instagram', 'url' => '', 'username' => null],
            ],
            'draft_media' => [
                'logo' => [
                    'path' => 'store-requests/demo/logo.jpg',
                    'disk' => 'public',
                    'original_name' => 'logo.jpg',
                    'mime_type' => 'image/jpeg',
                    'file_size' => 1024,
                ],
                'cover' => [
                    'path' => 'store-requests/demo/cover.jpg',
                    'disk' => 'public',
                    'original_name' => 'cover.jpg',
                    'mime_type' => 'image/jpeg',
                    'file_size' => 2048,
                ],
                'gallery' => [
                    [
                        'path' => 'store-requests/demo/gallery-1.jpg',
                        'disk' => 'public',
                        'original_name' => 'gallery-1.jpg',
                        'mime_type' => 'image/jpeg',
                        'file_size' => 512,
                    ],
                ],
            ],
        ]);

        $this->actingAs($this->admin)->postJson('/api/v1/admin/store-requests/' . $request->public_id . '/review', [
            'action' => 'approve',
        ])->assertOk();

        $request->refresh();
        $store = \App\Models\Store::findOrFail($request->resulting_store_id);

        $this->assertEquals('store.extras@palverse.demo', $store->email);
        $this->assertEquals('https://example.com', $store->website);
        $this->assertDatabaseCount('store_working_hours', 7);
        $this->assertDatabaseHas('store_social_links', [
            'store_id' => $store->id,
            'platform' => 'facebook',
            'url' => 'https://facebook.com/palverse-store',
        ]);
        $this->assertDatabaseMissing('store_social_links', [
            'store_id' => $store->id,
            'platform' => 'instagram',
        ]);
        $this->assertDatabaseHas('store_media', [
            'store_id' => $store->id,
            'type' => 'logo',
            'file_path' => 'store-requests/demo/logo.jpg',
        ]);
        $this->assertDatabaseHas('store_media', [
            'store_id' => $store->id,
            'type' => 'cover',
            'file_path' => 'store-requests/demo/cover.jpg',
        ]);
        $this->assertDatabaseHas('store_media', [
            'store_id' => $store->id,
            'type' => 'gallery',
            'file_path' => 'store-requests/demo/gallery-1.jpg',
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
