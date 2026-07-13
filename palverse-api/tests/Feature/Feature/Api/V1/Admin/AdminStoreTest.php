<?php

namespace Tests\Feature\Feature\Api\V1\Admin;

use App\Enums\StoreStatus;
use App\Models\Store;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminStoreTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    public function test_admin_can_list_stores(): void
    {
        Store::factory()->count(3)->create();

        $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/stores')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_can_filter_stores_by_status(): void
    {
        Store::factory()->pending()->count(2)->create();
        Store::factory()->approved()->count(1)->create();

        $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/stores?status=pending')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_approve_pending_store(): void
    {
        $store = Store::factory()->pending()->create();

        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/stores/{$store->public_id}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', StoreStatus::APPROVED->value)
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('stores', [
            'id' => $store->id,
            'status' => StoreStatus::APPROVED->value,
            'is_active' => true,
        ]);

        $this->assertNotNull($store->fresh()->slug);

        $this->assertDatabaseHas('store_status_history', [
            'store_id' => $store->id,
            'action' => 'approved',
        ]);
    }

    public function test_admin_cannot_approve_already_approved_store(): void
    {
        $store = Store::factory()->approved()->create();

        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/stores/{$store->public_id}/approve")
            ->assertConflict()
            ->assertJsonPath('error.code', 'STORE_ALREADY_APPROVED');
    }

    public function test_admin_can_reject_pending_store_with_reason(): void
    {
        $store = Store::factory()->pending()->create();

        $payload = [
            'rejection_reason' => 'Missing information',
        ];

        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/stores/{$store->public_id}/reject", $payload)
            ->assertOk()
            ->assertJsonPath('data.status', StoreStatus::REJECTED->value)
            ->assertJsonPath('data.is_active', false);

        $this->assertDatabaseHas('stores', [
            'id' => $store->id,
            'status' => StoreStatus::REJECTED->value,
            'rejection_reason' => 'Missing information',
        ]);
    }

    public function test_rejection_reason_is_mandatory(): void
    {
        $store = Store::factory()->pending()->create();

        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/stores/{$store->public_id}/reject", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['rejection_reason']);
    }

    public function test_admin_can_activate_approved_store(): void
    {
        $store = Store::factory()->approved()->inactive()->create();

        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/stores/{$store->public_id}/activate")
            ->assertOk()
            ->assertJsonPath('data.is_active', true);
    }

    public function test_admin_cannot_activate_pending_store(): void
    {
        $store = Store::factory()->pending()->create();

        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/stores/{$store->public_id}/activate")
            ->assertConflict()
            ->assertJsonPath('error.code', 'STORE_NOT_APPROVED');
    }

    public function test_admin_can_deactivate_approved_active_store(): void
    {
        $store = Store::factory()->approved()->active()->create();

        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/stores/{$store->public_id}/deactivate")
            ->assertOk()
            ->assertJsonPath('data.is_active', false);
    }
}
