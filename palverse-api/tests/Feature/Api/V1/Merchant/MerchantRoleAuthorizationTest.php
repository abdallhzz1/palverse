<?php

namespace Tests\Feature\Api\V1\Merchant;

use App\Models\Category;
use App\Models\City;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class MerchantRoleAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }

    public function test_unauthenticated_user_cannot_access_merchant_routes(): void
    {
        $response = $this->getJson('/api/v1/merchant/stores');
        
        $response->assertStatus(401);
    }

    public function test_roleless_user_cannot_access_merchant_routes(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        // By default, user factory doesn't assign any roles.

        $response = $this->actingAs($user)->getJson('/api/v1/merchant/stores');
        $response->assertStatus(403);

        $response = $this->actingAs($user)->postJson('/api/v1/merchant/stores', []);
        $response->assertStatus(403);
    }

    public function test_merchant_can_access_merchant_routes(): void
    {
        $merchant = User::factory()->create([
            'email_verified_at' => now(),
        ]);
        $merchant->assignRole('merchant');

        $response = $this->actingAs($merchant)->getJson('/api/v1/merchant/stores');
        $response->assertStatus(200);

        // POST /api/v1/merchant/stores requires valid data to get 201, 
        // but an incomplete payload should return 422 (validation error), 
        // proving it passed the 403 authorization guard.
        $response = $this->actingAs($merchant)->postJson('/api/v1/merchant/stores', []);
        $response->assertStatus(422);
    }
}
