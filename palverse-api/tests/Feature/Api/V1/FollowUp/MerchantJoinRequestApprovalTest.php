<?php

namespace Tests\Feature\Api\V1\FollowUp;

use App\Enums\MerchantJoinRequestStatus;
use App\Models\Category;
use App\Models\City;
use App\Models\MerchantJoinRequest;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\Zone;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MerchantJoinRequestApprovalTest extends TestCase
{
    use RefreshDatabase;

    private User $followUp;

    private City $city;

    private SubscriptionPlan $plan;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->followUp = User::factory()->create();
        $this->followUp->assignRole('follow_up');

        $this->city = City::factory()->create();
        Zone::factory()->create(['city_id' => $this->city->id]);
        Category::factory()->create();
        $this->plan = SubscriptionPlan::factory()->create();
    }

    private function createJoinRequest(?string $email = null): MerchantJoinRequest
    {
        return MerchantJoinRequest::create([
            'merchant_name' => 'غازي',
            'phone' => '0599333444',
            'email' => $email,
            'store_name' => 'محل غازي',
            'city_id' => $this->city->id,
            'status' => MerchantJoinRequestStatus::NEW,
        ]);
    }

    public function test_approve_without_email_returns_validation_error(): void
    {
        $joinRequest = $this->createJoinRequest(null);

        $response = $this->actingAs($this->followUp, 'sanctum')
            ->putJson("/api/v1/follow-up/merchant-join-requests/{$joinRequest->public_id}/status", [
                'status' => 'approved',
                'password' => 'SecurePass123!',
                'subscription_plan_id' => $this->plan->public_id,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        $this->assertDatabaseMissing('users', ['phone' => '0599333444']);
        $this->assertSame(MerchantJoinRequestStatus::NEW, $joinRequest->fresh()->status);
    }

    public function test_approve_with_email_override_creates_merchant_account(): void
    {
        $joinRequest = $this->createJoinRequest(null);

        $response = $this->actingAs($this->followUp, 'sanctum')
            ->putJson("/api/v1/follow-up/merchant-join-requests/{$joinRequest->public_id}/status", [
                'status' => 'approved',
                'email' => 'ghazi@example.com',
                'password' => 'SecurePass123!',
                'subscription_plan_id' => $this->plan->public_id,
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('users', [
            'phone' => '0599333444',
            'email' => 'ghazi@example.com',
            'name' => 'غازي',
        ]);

        $user = User::query()->where('phone', '0599333444')->first();
        $this->assertTrue($user->hasRole('merchant'));

        $this->assertDatabaseHas('stores', [
            'owner_id' => $user->id,
            'name_ar' => 'محل غازي',
            'email' => 'ghazi@example.com',
        ]);

        $this->assertDatabaseHas('merchant_join_requests', [
            'public_id' => $joinRequest->public_id,
            'email' => 'ghazi@example.com',
            'status' => MerchantJoinRequestStatus::APPROVED->value,
            'handled_by' => $this->followUp->id,
        ]);

        $this->assertDatabaseHas('store_subscriptions', [
            'subscription_plan_id' => $this->plan->id,
            'status' => 'pending',
        ]);
    }

    public function test_admin_can_approve_join_request_without_email_using_override(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $joinRequest = $this->createJoinRequest(null);

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/join-requests/{$joinRequest->public_id}/status", [
                'status' => 'approved',
                'email' => 'admin.approved@example.com',
                'password' => 'SecurePass123!',
                'subscription_plan_id' => $this->plan->public_id,
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('users', [
            'phone' => '0599333444',
            'email' => 'admin.approved@example.com',
        ]);
    }

    public function test_approve_uses_join_request_email_when_present(): void
    {
        $joinRequest = $this->createJoinRequest('existing@example.com');

        $response = $this->actingAs($this->followUp, 'sanctum')
            ->putJson("/api/v1/follow-up/merchant-join-requests/{$joinRequest->public_id}/status", [
                'status' => 'approved',
                'password' => 'SecurePass123!',
                'subscription_plan_id' => $this->plan->public_id,
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('users', [
            'phone' => '0599333444',
            'email' => 'existing@example.com',
        ]);
    }
}
