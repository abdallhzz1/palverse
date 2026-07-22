<?php

namespace Tests\Feature\Api\V1\Representative;

use App\Enums\StoreRequestStatus;
use App\Models\City;
use App\Models\RepresentativeZoneAssignment;
use App\Models\StoreRegistrationRequest;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Illuminate\Support\Str;

class StoreRegistrationRequestTest extends TestCase
{
    use RefreshDatabase;

    private User $representative;
    private Zone $zone;
    private City $city;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        $this->representative = User::factory()->create();
        $this->representative->assignRole('representative');

        $this->city = City::create([
            'public_id' => (string) Str::ulid(),
            'name_ar' => 'مدينة تجريبية',
            'name_en' => 'Test City'
        ]);

        $this->zone = Zone::create([
            'public_id' => (string) Str::ulid(),
            'city_id' => $this->city->id,
            'name_ar' => 'منطقة تجريبية',
            'name_en' => 'Test Zone'
        ]);

        RepresentativeZoneAssignment::create([
            'public_id' => (string) Str::ulid(),
            'representative_id' => $this->representative->id,
            'zone_id' => $this->zone->id,
            'is_active' => true,
            'assigned_at' => now(),
        ]);
    }

    public function test_representative_can_create_draft_request(): void
    {
        $response = $this->actingAs($this->representative, 'sanctum')
            ->postJson('/api/v1/representative/store-requests', [
                'zone_public_id' => $this->zone->public_id,
                'city_public_id' => $this->city->public_id,
                'proposed_merchant_name' => 'تاجر تجريبي',
                'proposed_merchant_phone' => '0599000000',
                'store_name_ar' => 'متجر تجريبي',
                'phone' => '0599000000',
                'address_ar' => 'عنوان تجريبي',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', StoreRequestStatus::DRAFT->value)
            ->assertJsonPath('data.store_name_ar', 'متجر تجريبي');

        $this->assertDatabaseHas('store_registration_requests', [
            'store_name_ar' => 'متجر تجريبي',
            'status' => StoreRequestStatus::DRAFT->value,
            'representative_id' => $this->representative->id,
        ]);
    }

    public function test_representative_cannot_create_request_in_unassigned_zone(): void
    {
        $unassignedZone = Zone::create([
            'public_id' => (string) Str::ulid(),
            'city_id' => $this->city->id,
            'name_ar' => 'منطقة غير مخصصة',
            'name_en' => 'Unassigned Zone'
        ]);

        $response = $this->actingAs($this->representative, 'sanctum')
            ->postJson('/api/v1/representative/store-requests', [
                'zone_public_id' => $unassignedZone->public_id,
                'city_public_id' => $this->city->public_id,
                'proposed_merchant_name' => 'تاجر تجريبي',
                'proposed_merchant_phone' => '0599000000',
                'store_name_ar' => 'متجر تجريبي',
                'phone' => '0599000000',
                'address_ar' => 'عنوان تجريبي',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['zone_public_id']);
    }

    public function test_representative_can_submit_draft_request(): void
    {
        $request = StoreRegistrationRequest::create([
            'public_id' => (string) Str::ulid(),
            'representative_id' => $this->representative->id,
            'zone_id' => $this->zone->id,
            'city_id' => $this->city->id,
            'proposed_merchant_name' => 'تاجر',
            'proposed_merchant_phone' => '059',
            'store_name_ar' => 'متجر',
            'phone' => '059',
            'address_ar' => 'عنوان',
            'status' => StoreRequestStatus::DRAFT->value,
        ]);

        $response = $this->actingAs($this->representative, 'sanctum')
            ->postJson("/api/v1/representative/store-requests/{$request->public_id}/submit");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', StoreRequestStatus::SUBMITTED->value);

        $this->assertDatabaseHas('store_registration_requests', [
            'id' => $request->id,
            'status' => StoreRequestStatus::SUBMITTED->value,
        ]);
    }
}
