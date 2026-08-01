<?php

namespace Tests\Feature\Api\V1\FollowUp;

use App\Models\Store;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdvertisementManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $followUp;

    private User $admin;

    private Store $store;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->followUp = User::factory()->create();
        $this->followUp->assignRole('follow_up');

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $owner = User::factory()->create();
        $owner->assignRole('merchant');

        $this->store = Store::factory()->create([
            'owner_id' => $owner->id,
            'status' => 'approved',
            'is_active' => true,
        ]);

        $plan = SubscriptionPlan::factory()->create();
        $this->store->currentSubscription()->create([
            'public_id' => (string) Str::ulid(),
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
            'price_snapshot' => 100,
            'currency_snapshot' => 'ILS',
            'plan_name_ar_snapshot' => 'خطة تجريبية',
            'plan_name_en_snapshot' => 'Test Plan',
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addYear(),
        ]);
    }

    public function test_follow_up_can_create_featured_ad_without_notes(): void
    {
        $this->actingAs($this->followUp, 'sanctum')
            ->postJson('/api/v1/follow-up/advertisements', [
                'store_public_id' => $this->store->public_id,
                'ad_type' => 'featured_store',
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(7)->toDateString(),
                'amount_paid' => 100,
            ])
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('store_advertisements', [
            'store_id' => $this->store->id,
            'ad_type' => 'featured_store',
            'is_active' => 1,
        ]);
    }

    public function test_admin_can_list_and_create_advertisement(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/advertisements')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/advertisements', [
                'store_public_id' => $this->store->public_id,
                'ad_type' => 'featured_store',
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(5)->toDateString(),
                'amount_paid' => 75,
                'notes' => '',
            ])
            ->assertCreated()
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseCount('store_advertisements', 1);
    }

    public function test_follow_up_can_show_and_update_advertisement(): void
    {
        $create = $this->actingAs($this->followUp, 'sanctum')
            ->postJson('/api/v1/follow-up/advertisements', [
                'store_public_id' => $this->store->public_id,
                'ad_type' => 'featured_store',
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(7)->toDateString(),
                'amount_paid' => 100,
            ])
            ->assertCreated();

        $publicId = $create->json('data.public_id');

        $this->actingAs($this->followUp, 'sanctum')
            ->getJson('/api/v1/follow-up/advertisements/'.$publicId)
            ->assertOk()
            ->assertJsonPath('data.public_id', $publicId)
            ->assertJsonPath('data.public_status', 'live')
            ->assertJsonStructure(['data' => ['placements']]);

        $this->actingAs($this->followUp, 'sanctum')
            ->putJson('/api/v1/follow-up/advertisements/'.$publicId, [
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(14)->toDateString(),
                'amount_paid' => 150,
                'notes' => 'تم التمديد',
                'is_active' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.amount_paid', '150.00')
            ->assertJsonPath('data.notes', 'تم التمديد');

        $this->actingAs($this->admin, 'sanctum')
            ->putJson('/api/v1/admin/advertisements/'.$publicId, [
                'is_active' => false,
            ])
            ->assertOk()
            ->assertJsonPath('data.is_active', false)
            ->assertJsonPath('data.public_status', 'paused');
    }

    public function test_follow_up_can_create_banner_with_placement(): void
    {
        $this->actingAs($this->followUp, 'sanctum')
            ->post('/api/v1/follow-up/advertisements', [
                'store_public_id' => $this->store->public_id,
                'ad_type' => 'banner',
                'placement' => 'store_sidebar',
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(7)->toDateString(),
                'amount_paid' => 80,
            ], [
                // no image → should fail
            ])
            ->assertStatus(422);

        $file = \Illuminate\Http\UploadedFile::fake()->image('sidebar.jpg', 800, 1000);

        $this->actingAs($this->followUp, 'sanctum')
            ->post('/api/v1/follow-up/advertisements', [
                'store_public_id' => $this->store->public_id,
                'ad_type' => 'banner',
                'placement' => 'store_sidebar',
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(7)->toDateString(),
                'amount_paid' => 80,
                'image' => $file,
            ])
            ->assertCreated()
            ->assertJsonPath('data.placement', 'store_sidebar')
            ->assertJsonPath('data.placement_meta.aspect_ratio', '4:5');
    }

    public function test_guest_cannot_manage_advertisements(): void
    {
        $this->postJson('/api/v1/follow-up/advertisements', [])
            ->assertUnauthorized();

        $this->getJson('/api/v1/admin/advertisements')
            ->assertUnauthorized();
    }
}
