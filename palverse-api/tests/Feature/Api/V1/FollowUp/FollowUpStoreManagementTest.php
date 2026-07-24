<?php

namespace Tests\Feature\Api\V1\FollowUp;

use App\Models\Store;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FollowUpStoreManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $followUp;

    private Store $store;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->followUp = User::factory()->create();
        $this->followUp->assignRole('follow_up');

        $owner = User::factory()->create();
        $owner->assignRole('merchant');
        $this->store = Store::factory()->create(['owner_id' => $owner->id]);
    }

    public function test_follow_up_can_list_and_update_store_profile(): void
    {
        $this->actingAs($this->followUp, 'sanctum')
            ->getJson('/api/v1/follow-up/stores')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->actingAs($this->followUp, 'sanctum')
            ->putJson("/api/v1/follow-up/stores/{$this->store->public_id}", [
                'name_ar' => 'محل محدّث من المتابعة',
                'phone' => '0599123456',
            ])
            ->assertOk();

        $this->assertDatabaseHas('stores', [
            'public_id' => $this->store->public_id,
            'name_ar' => 'محل محدّث من المتابعة',
        ]);
    }

    public function test_follow_up_can_update_working_hours(): void
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

        $this->actingAs($this->followUp, 'sanctum')
            ->putJson("/api/v1/follow-up/stores/{$this->store->public_id}/working-hours", [
                'days' => $days,
            ])
            ->assertOk();

        $this->assertDatabaseCount('store_working_hours', 7);
    }

    public function test_follow_up_can_manage_social_links_and_list_offers(): void
    {
        $this->actingAs($this->followUp, 'sanctum')
            ->postJson("/api/v1/follow-up/stores/{$this->store->public_id}/social-links", [
                'platform' => 'facebook',
                'url' => 'https://facebook.com/follow-up-store',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('store_social_links', [
            'store_id' => $this->store->id,
            'platform' => 'facebook',
            'url' => 'https://facebook.com/follow-up-store',
        ]);

        $this->actingAs($this->followUp, 'sanctum')
            ->getJson("/api/v1/follow-up/stores/{$this->store->public_id}/offers")
            ->assertOk()
            ->assertJsonPath('success', true);
    }
}
