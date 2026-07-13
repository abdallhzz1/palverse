<?php

namespace Tests\Feature\Api\V1\Auth;

use App\Enums\AuditAction;
use App\Enums\UserStatus;
use App\Models\AuditLog;
use App\Models\SystemSetting;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
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

    // ──────────────────────────────────────────────────────────────────────────
    // Happy path
    // ──────────────────────────────────────────────────────────────────────────

    public function test_guest_can_register_as_merchant_when_enabled(): void
    {
        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'token',
                    'token_type',
                    'user' => ['public_id', 'name', 'email', 'phone', 'preferred_locale', 'status', 'roles'],
                ],
                'meta',
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.token_type', 'Bearer');
    }

    public function test_registration_creates_user_in_database(): void
    {
        $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $this->assertDatabaseHas('users', [
            'email' => 'ahmad@example.com',
            'name' => 'Ahmad Merchant',
            'status' => UserStatus::Active->value,
        ]);
    }

    public function test_registered_user_has_merchant_role(): void
    {
        $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $user = User::where('email', 'ahmad@example.com')->firstOrFail();
        $this->assertTrue($user->hasRole('merchant'));
    }

    public function test_registered_user_does_not_have_admin_role(): void
    {
        $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $user = User::where('email', 'ahmad@example.com')->firstOrFail();
        $this->assertFalse($user->hasRole('admin'));
    }

    public function test_registered_user_does_not_have_customer_role(): void
    {
        $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $user = User::where('email', 'ahmad@example.com')->firstOrFail();
        $this->assertFalse($user->hasRole('customer'));
    }

    public function test_password_is_hashed_not_stored_in_plain_text(): void
    {
        $this->postJson('/api/v1/auth/register/merchant', $this->validPayload(['password' => 'SecurePass123', 'password_confirmation' => 'SecurePass123']));

        $user = User::where('email', 'ahmad@example.com')->firstOrFail();
        $this->assertNotEquals('SecurePass123', $user->password);
        $this->assertTrue(Hash::check('SecurePass123', $user->password));
    }

    public function test_public_id_is_generated_as_ulid(): void
    {
        $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $user = User::where('email', 'ahmad@example.com')->firstOrFail();
        $this->assertNotNull($user->public_id);
        $this->assertMatchesRegularExpression('/^[0-9A-Z]{26}$/', $user->public_id);
    }

    public function test_response_does_not_expose_numeric_id(): void
    {
        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $userData = $response->json('data.user');
        $this->assertArrayNotHasKey('id', $userData);
    }

    public function test_response_does_not_expose_password(): void
    {
        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $userData = $response->json('data.user');
        $this->assertArrayNotHasKey('password', $userData);
    }

    public function test_token_is_returned_in_response(): void
    {
        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $this->assertNotEmpty($response->json('data.token'));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Email normalization
    // ──────────────────────────────────────────────────────────────────────────

    public function test_email_is_normalized_to_lowercase(): void
    {
        $this->postJson('/api/v1/auth/register/merchant', $this->validPayload(['email' => 'Ahmad@Example.COM']));

        $this->assertDatabaseHas('users', ['email' => 'ahmad@example.com']);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Validation failures
    // ──────────────────────────────────────────────────────────────────────────

    public function test_duplicate_email_is_rejected_with_422(): void
    {
        User::factory()->create(['email' => 'ahmad@example.com']);

        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $response->assertStatus(422);
    }

    public function test_duplicate_email_creates_no_extra_user(): void
    {
        User::factory()->create(['email' => 'ahmad@example.com']);

        $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $this->assertCount(1, User::where('email', 'ahmad@example.com')->get());
    }

    public function test_weak_password_is_rejected(): void
    {
        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload([
            'password' => 'weak',
            'password_confirmation' => 'weak',
        ]));

        $response->assertStatus(422);
    }

    public function test_password_without_numbers_is_rejected(): void
    {
        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload([
            'password' => 'SecurePassword!',
            'password_confirmation' => 'SecurePassword!',
        ]));

        $response->assertStatus(422);
    }

    public function test_password_without_mixed_case_is_rejected(): void
    {
        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload([
            'password' => 'securepass123',
            'password_confirmation' => 'securepass123',
        ]));

        $response->assertStatus(422);
    }

    public function test_password_confirmation_mismatch_is_rejected(): void
    {
        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload([
            'password_confirmation' => 'DifferentPass123',
        ]));

        $response->assertStatus(422);
    }

    public function test_name_is_required(): void
    {
        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload(['name' => '']));
        $response->assertStatus(422);
    }

    public function test_email_is_required(): void
    {
        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload(['email' => '']));
        $response->assertStatus(422);
    }

    public function test_invalid_email_format_is_rejected(): void
    {
        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload(['email' => 'not-an-email']));
        $response->assertStatus(422);
    }

    public function test_invalid_preferred_locale_is_rejected(): void
    {
        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload(['preferred_locale' => 'fr']));
        $response->assertStatus(422);
    }

    public function test_phone_is_optional(): void
    {
        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload(['phone' => null]));
        $response->assertStatus(201);
    }

    public function test_preferred_locale_is_optional(): void
    {
        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload(['preferred_locale' => null]));
        $response->assertStatus(201);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Registration setting
    // ──────────────────────────────────────────────────────────────────────────

    public function test_registration_disabled_returns_403(): void
    {
        SystemSetting::factory()->create([
            'group' => 'maintenance',
            'key' => 'merchant_registration_enabled',
            'value' => '0',
        ]);

        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $response->assertStatus(403)
            ->assertJsonPath('error.code', 'MERCHANT_REGISTRATION_DISABLED');
    }

    public function test_registration_disabled_creates_no_user(): void
    {
        SystemSetting::factory()->create([
            'group' => 'maintenance',
            'key' => 'merchant_registration_enabled',
            'value' => '0',
        ]);

        $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $this->assertDatabaseMissing('users', ['email' => 'ahmad@example.com']);
    }

    public function test_registration_disabled_issues_no_token(): void
    {
        SystemSetting::factory()->create([
            'group' => 'maintenance',
            'key' => 'merchant_registration_enabled',
            'value' => '0',
        ]);

        $response = $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $this->assertNull($response->json('data.token'));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Audit log
    // ──────────────────────────────────────────────────────────────────────────

    public function test_audit_log_is_created_on_registration(): void
    {
        $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $this->assertDatabaseHas('audit_logs', [
            'action' => AuditAction::UserRegistered->value,
        ]);
    }

    public function test_audit_log_does_not_contain_password(): void
    {
        $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $log = AuditLog::where('action', AuditAction::UserRegistered->value)->first();
        $this->assertNotNull($log);

        $encoded = json_encode($log->new_values ?? []);
        $this->assertStringNotContainsStringIgnoringCase('SecurePass123', $encoded);
        $this->assertStringNotContainsStringIgnoringCase('password', strtolower($encoded));
    }

    public function test_audit_log_contains_registration_source_metadata(): void
    {
        $this->postJson('/api/v1/auth/register/merchant', $this->validPayload());

        $log = AuditLog::where('action', AuditAction::UserRegistered->value)->first();
        $this->assertNotNull($log);
        $this->assertEquals('public_api', $log->metadata['registration_source'] ?? null);
    }
}
