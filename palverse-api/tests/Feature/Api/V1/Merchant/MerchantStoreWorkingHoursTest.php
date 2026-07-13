<?php

namespace Tests\Feature\Api\V1\Merchant;

use App\Models\Store;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MerchantStoreWorkingHoursTest extends TestCase
{
    use RefreshDatabase;

    private User $merchant;

    private Store $store;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $this->merchant = User::factory()->create();
        $this->merchant->assignRole('merchant');

        $this->store = Store::factory()->create([
            'owner_id' => $this->merchant->id,
        ]);
    }

    private function getFullSchedulePayload()
    {
        $days = [];
        for ($i = 0; $i <= 6; $i++) {
            $days[] = [
                'day_of_week' => $i,
                'is_closed' => true,
                'periods' => [],
            ];
        }

        return ['days' => $days];
    }

    public function test_guest_cannot_access_merchant_working_hours_endpoints()
    {
        $this->getJson("/api/v1/merchant/stores/{$this->store->public_id}/working-hours")
            ->assertUnauthorized();

        $this->putJson("/api/v1/merchant/stores/{$this->store->public_id}/working-hours", [])
            ->assertUnauthorized();
    }

    public function test_merchant_can_view_working_hours_for_owned_store()
    {
        $this->actingAs($this->merchant)
            ->getJson("/api/v1/merchant/stores/{$this->store->public_id}/working-hours")
            ->assertSuccessful()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'day_of_week',
                        'day_label_ar',
                        'day_label_en',
                        'is_closed',
                        'periods',
                    ],
                ],
            ]);
    }

    public function test_merchant_cannot_view_another_merchants_store_hours()
    {
        $otherMerchant = User::factory()->create();
        $otherMerchant->assignRole('merchant');

        $this->actingAs($otherMerchant)
            ->getJson("/api/v1/merchant/stores/{$this->store->public_id}/working-hours")
            ->assertForbidden();
    }

    public function test_merchant_can_set_one_open_period()
    {
        $payload = $this->getFullSchedulePayload();
        $payload['days'][0] = [
            'day_of_week' => 0,
            'is_closed' => false,
            'periods' => [
                ['opens_at' => '09:00', 'closes_at' => '17:00'],
            ],
        ];

        $this->actingAs($this->merchant)
            ->putJson("/api/v1/merchant/stores/{$this->store->public_id}/working-hours", $payload)
            ->assertSuccessful()
            ->assertJsonPath('data.0.is_closed', false)
            ->assertJsonPath('data.0.periods.0.opens_at', '09:00')
            ->assertJsonPath('data.0.periods.0.closes_at', '17:00');

        $this->assertDatabaseHas('store_working_hours', [
            'store_id' => $this->store->id,
            'day_of_week' => 0,
            'opens_at' => '09:00',
            'closes_at' => '17:00',
        ]);
    }

    public function test_merchant_can_set_multiple_periods_for_one_day()
    {
        $payload = $this->getFullSchedulePayload();
        $payload['days'][0] = [
            'day_of_week' => 0,
            'is_closed' => false,
            'periods' => [
                ['opens_at' => '09:00', 'closes_at' => '13:00'],
                ['opens_at' => '15:00', 'closes_at' => '20:00'],
            ],
        ];

        $this->actingAs($this->merchant)
            ->putJson("/api/v1/merchant/stores/{$this->store->public_id}/working-hours", $payload)
            ->assertSuccessful();

        $this->assertDatabaseCount('store_working_hours', 8); // 6 closed days + 2 periods for day 0
    }

    public function test_merchant_can_mark_a_day_closed()
    {
        $payload = $this->getFullSchedulePayload();

        $this->actingAs($this->merchant)
            ->putJson("/api/v1/merchant/stores/{$this->store->public_id}/working-hours", $payload)
            ->assertSuccessful();

        $this->assertDatabaseHas('store_working_hours', [
            'store_id' => $this->store->id,
            'day_of_week' => 0,
            'is_closed' => true,
        ]);
    }

    public function test_closed_day_rejects_periods()
    {
        $payload = $this->getFullSchedulePayload();
        $payload['days'][0] = [
            'day_of_week' => 0,
            'is_closed' => true,
            'periods' => [
                ['opens_at' => '09:00', 'closes_at' => '17:00'],
            ],
        ];

        $this->actingAs($this->merchant)
            ->putJson("/api/v1/merchant/stores/{$this->store->public_id}/working-hours", $payload)
            ->assertJsonValidationErrors(['days.0.periods']);
    }

    public function test_open_day_requires_periods()
    {
        $payload = $this->getFullSchedulePayload();
        $payload['days'][0] = [
            'day_of_week' => 0,
            'is_closed' => false,
            'periods' => [],
        ];

        $this->actingAs($this->merchant)
            ->putJson("/api/v1/merchant/stores/{$this->store->public_id}/working-hours", $payload)
            ->assertJsonValidationErrors(['days.0.periods']);
    }

    public function test_invalid_day_value_is_rejected()
    {
        $payload = $this->getFullSchedulePayload();
        $payload['days'][0]['day_of_week'] = 8; // Invalid

        $this->actingAs($this->merchant)
            ->putJson("/api/v1/merchant/stores/{$this->store->public_id}/working-hours", $payload)
            ->assertJsonValidationErrors(['days.0.day_of_week']);
    }

    public function test_closes_at_before_opens_at_is_rejected()
    {
        $payload = $this->getFullSchedulePayload();
        $payload['days'][0] = [
            'day_of_week' => 0,
            'is_closed' => false,
            'periods' => [
                ['opens_at' => '17:00', 'closes_at' => '09:00'], // Inverse
            ],
        ];

        $this->actingAs($this->merchant)
            ->putJson("/api/v1/merchant/stores/{$this->store->public_id}/working-hours", $payload)
            ->assertJsonValidationErrors(['days.0.periods.0.closes_at']);
    }

    public function test_overlapping_periods_are_rejected()
    {
        $payload = $this->getFullSchedulePayload();
        $payload['days'][0] = [
            'day_of_week' => 0,
            'is_closed' => false,
            'periods' => [
                ['opens_at' => '09:00', 'closes_at' => '14:00'],
                ['opens_at' => '13:00', 'closes_at' => '18:00'], // Overlaps
            ],
        ];

        $this->actingAs($this->merchant)
            ->putJson("/api/v1/merchant/stores/{$this->store->public_id}/working-hours", $payload)
            ->assertJsonValidationErrors(['days.0.periods']);
    }

    public function test_replacing_schedule_removes_previous_rows()
    {
        // Initial insert
        $payload = $this->getFullSchedulePayload();
        $this->actingAs($this->merchant)
            ->putJson("/api/v1/merchant/stores/{$this->store->public_id}/working-hours", $payload)
            ->assertSuccessful();

        $this->assertDatabaseCount('store_working_hours', 7);

        // Replace
        $payload['days'][0] = [
            'day_of_week' => 0,
            'is_closed' => false,
            'periods' => [
                ['opens_at' => '09:00', 'closes_at' => '12:00'],
                ['opens_at' => '13:00', 'closes_at' => '18:00'],
            ],
        ];

        $this->actingAs($this->merchant)
            ->putJson("/api/v1/merchant/stores/{$this->store->public_id}/working-hours", $payload)
            ->assertSuccessful();

        $this->assertDatabaseCount('store_working_hours', 8); // Should not be 15
    }

    public function test_response_does_not_expose_numeric_ids()
    {
        $this->actingAs($this->merchant)
            ->getJson("/api/v1/merchant/stores/{$this->store->public_id}/working-hours")
            ->assertSuccessful()
            ->assertJsonMissing(['id' => $this->store->id]);
    }
}
