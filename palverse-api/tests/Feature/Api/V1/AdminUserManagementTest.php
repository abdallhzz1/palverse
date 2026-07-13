<?php

namespace Tests\Feature\Api\V1;

use App\Enums\UserStatus;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $merchant;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->admin = User::factory()->admin()->create();
        // The seeder assigns all permissions to the admin role, but just to be safe and explicit for the test:
        // Actually, UserFactory->admin() assigns 'admin' role. The 'admin' role has all permissions from the seeder.
        // We don't even need to call givePermissionTo explicitly because the role has it.
        // But if we want to be explicit without breaking if the seeder didn't give it:
        if (! $this->admin->hasPermissionTo('users.view')) {
            $this->admin->givePermissionTo('users.view');
        }
        if (! $this->admin->hasPermissionTo('users.manage')) {
            $this->admin->givePermissionTo('users.manage');
        }

        $this->merchant = User::factory()->merchant()->create();
    }

    public function test_admin_can_list_users(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/v1/admin/users');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => [['public_id', 'name', 'email']]]);
    }

    public function test_admin_can_create_merchant(): void
    {
        $payload = [
            'name' => 'New Merchant',
            'email' => 'new.merchant@example.com',
            'password' => 'StrongPass123',
            'password_confirmation' => 'StrongPass123',
            'phone' => '1234567890',
            'preferred_locale' => 'en',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/v1/admin/users/merchants', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'New Merchant')
            ->assertJsonPath('data.roles.0', 'merchant');

        $this->assertDatabaseHas('users', [
            'email' => 'new.merchant@example.com',
            'created_by' => $this->admin->id,
        ]);
    }

    public function test_admin_can_suspend_user(): void
    {
        $response = $this->actingAs($this->admin)->patchJson("/api/v1/admin/users/{$this->merchant->public_id}/suspend", [
            'suspension_reason' => 'Violation',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'suspended');

        $this->assertDatabaseHas('users', [
            'id' => $this->merchant->id,
            'status' => UserStatus::Suspended->value,
            'suspended_by' => $this->admin->id,
        ]);
    }

    public function test_admin_cannot_suspend_last_admin(): void
    {
        $response = $this->actingAs($this->admin)->patchJson("/api/v1/admin/users/{$this->admin->public_id}/suspend", [
            'suspension_reason' => 'Self suspend',
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('error_code', 'USER_SELF_DISABLE_NOT_ALLOWED');
    }

    public function test_admin_can_deactivate_user(): void
    {
        $response = $this->actingAs($this->admin)->patchJson("/api/v1/admin/users/{$this->merchant->public_id}/deactivate", [
            'reason' => 'Requested by merchant',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'inactive');

        $this->assertDatabaseHas('users', [
            'id' => $this->merchant->id,
            'status' => UserStatus::Inactive->value,
            'deactivated_by' => $this->admin->id,
        ]);
    }

    public function test_admin_can_activate_user(): void
    {
        $suspendedMerchant = User::factory()->merchant()->suspended()->create();

        $response = $this->actingAs($this->admin)->patchJson("/api/v1/admin/users/{$suspendedMerchant->public_id}/activate");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'active');

        $this->assertDatabaseHas('users', [
            'id' => $suspendedMerchant->id,
            'status' => UserStatus::Active->value,
            'suspended_at' => null,
            'suspension_reason' => null,
        ]);
    }

    public function test_admin_can_update_roles(): void
    {
        $response = $this->actingAs($this->admin)->patchJson("/api/v1/admin/users/{$this->merchant->public_id}/roles", [
            'roles' => ['customer'],
        ]);

        $response->assertStatus(200);

        $this->assertFalse($this->merchant->fresh()->hasRole('merchant'));
        $this->assertTrue($this->merchant->fresh()->hasRole('customer'));
    }

    public function test_admin_can_reset_password(): void
    {
        $response = $this->actingAs($this->admin)->postJson("/api/v1/admin/users/{$this->merchant->public_id}/reset-password", [
            'password' => 'NewStrongPass123',
            'password_confirmation' => 'NewStrongPass123',
        ]);

        $response->assertStatus(200);

        $this->assertTrue(Hash::check('NewStrongPass123', $this->merchant->fresh()->password));
    }
}
