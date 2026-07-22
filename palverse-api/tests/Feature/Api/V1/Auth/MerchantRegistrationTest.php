<?php

namespace Tests\Feature\Api\V1\Auth;

use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MerchantRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    protected function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Ahmad Merchant',
            'email' => 'ahmad@example.com',
            'phone' => '+970599123456',
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
            'preferred_locale' => 'ar',
        ], $overrides);
    }

    public function test_merchant_self_registration_is_disabled(): void
    {
        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $response->assertForbidden()
            ->assertJsonPath('error.code', 'MERCHANT_SELF_REGISTRATION_DISABLED');

        $this->assertDatabaseMissing('users', ['email' => 'ahmad@example.com']);
    }
}
