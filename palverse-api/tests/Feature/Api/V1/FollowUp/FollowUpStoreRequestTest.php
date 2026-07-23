<?php

namespace Tests\Feature\Api\V1\FollowUp;

use App\Enums\StoreRequestStatus;
use App\Models\City;
use App\Models\StoreRegistrationRequest;
use App\Models\User;
use App\Models\Zone;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class FollowUpStoreRequestTest extends TestCase
{
    use RefreshDatabase;

    private User $followUp;

    private User $representative;

    private Zone $zone;

    private City $city;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->followUp = User::factory()->create(['name' => 'Follow Up User']);
        $this->followUp->assignRole('follow_up');

        $this->representative = User::factory()->create([
            'name' => 'مندوب الخليل',
            'phone' => '0599111222',
        ]);
        $this->representative->assignRole('representative');

        $this->city = City::create([
            'public_id' => (string) Str::ulid(),
            'name_ar' => 'الخليل',
            'name_en' => 'Hebron',
        ]);

        $this->zone = Zone::create([
            'public_id' => (string) Str::ulid(),
            'city_id' => $this->city->id,
            'name_ar' => 'البلدة القديمة',
            'name_en' => 'Old City',
        ]);
    }

    private function createRequest(StoreRequestStatus $status): StoreRegistrationRequest
    {
        return StoreRegistrationRequest::create([
            'representative_id' => $this->representative->id,
            'zone_id' => $this->zone->id,
            'city_id' => $this->city->id,
            'proposed_merchant_name' => 'تاجر تجريبي',
            'proposed_merchant_phone' => '0599000000',
            'store_name_ar' => 'متجر تجريبي',
            'phone' => '0599000000',
            'address_ar' => 'عنوان تجريبي',
            'status' => $status,
            'submitted_at' => $status === StoreRequestStatus::DRAFT ? null : now(),
        ]);
    }

    public function test_follow_up_index_hides_drafts_and_includes_representative_name(): void
    {
        $this->createRequest(StoreRequestStatus::DRAFT);
        $submitted = $this->createRequest(StoreRequestStatus::SUBMITTED);

        $response = $this->actingAs($this->followUp, 'sanctum')
            ->getJson('/api/v1/follow-up/store-requests');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.public_id', $submitted->public_id)
            ->assertJsonPath('data.0.representative.name', 'مندوب الخليل')
            ->assertJsonPath('data.0.representative.phone', '0599111222');
    }

    public function test_follow_up_can_filter_by_status(): void
    {
        $this->createRequest(StoreRequestStatus::SUBMITTED);
        $underReview = $this->createRequest(StoreRequestStatus::UNDER_REVIEW);

        $response = $this->actingAs($this->followUp, 'sanctum')
            ->getJson('/api/v1/follow-up/store-requests?status=under_review');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.public_id', $underReview->public_id);
    }

    public function test_follow_up_can_view_request_details(): void
    {
        $request = $this->createRequest(StoreRequestStatus::SUBMITTED);

        $response = $this->actingAs($this->followUp, 'sanctum')
            ->getJson("/api/v1/follow-up/store-requests/{$request->public_id}");

        $response->assertOk()
            ->assertJsonPath('data.public_id', $request->public_id)
            ->assertJsonPath('data.store_name_ar', 'متجر تجريبي')
            ->assertJsonPath('data.representative.name', 'مندوب الخليل');
    }
}
