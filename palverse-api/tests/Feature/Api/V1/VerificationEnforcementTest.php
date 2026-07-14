<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VerificationEnforcementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_verified_middleware_blocks_unverified_users_from_protected_routes()
    {
        $user = User::factory()->create(['email_verified_at' => null]);
        $user->assignRole('merchant');
        Sanctum::actingAs($user, ['*']);

        // A merchant store creation route which has verified.api middleware
        $response = $this->postJson('/api/v1/merchant/stores', [
            'name_ar' => 'Test Store',
            'name_en' => 'Test Store',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'EMAIL_NOT_VERIFIED');
    }

    public function test_verified_middleware_allows_verified_users()
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $user->assignRole('merchant');
        Sanctum::actingAs($user, ['*']);

        // Test with validation error instead of 403, which means it passed the middleware
        $response = $this->postJson('/api/v1/merchant/stores', []);

        // We expect a validation error 422 because the request payload is empty, not 403
        $response->assertStatus(422);
    }
}
