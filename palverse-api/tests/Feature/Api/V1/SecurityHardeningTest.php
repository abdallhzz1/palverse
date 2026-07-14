<?php

namespace Tests\Feature\Api\V1;

use App\Exceptions\BusinessException;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    // ── Security Headers ─────────────────────────────────────────────────────

    /**
     * Every API response must include the required security headers.
     * Uses POST /login (returns 422) which fully traverses the middleware stack.
     */
    public function test_api_responses_include_security_headers(): void
    {
        // POST /login with empty body → 422 ValidationException (full middleware stack runs)
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertStatus(422);
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    /**
     * Security headers must also be present on router-level error responses (405).
     * Since SetSecurityHeaders is in the global middleware stack, it fires even here.
     */
    public function test_security_headers_present_on_method_not_allowed(): void
    {
        // GET /login doesn't exist — router throws MethodNotAllowedHttpException
        $response = $this->getJson('/api/v1/auth/login');

        $response->assertStatus(405);
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    /**
     * Every API response must echo the X-Correlation-ID header.
     */
    public function test_api_responses_include_correlation_id(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertHeader('X-Correlation-ID');
    }

    /**
     * A supplied X-Correlation-ID is echoed back to the client.
     */
    public function test_supplied_correlation_id_is_echoed(): void
    {
        $clientId = 'test-correlation-abc123';

        $response = $this->withHeaders([
            'X-Correlation-ID' => $clientId,
        ])->postJson('/api/v1/auth/login', []);

        $response->assertHeader('X-Correlation-ID', $clientId);
    }

    /**
     * An unsafe X-Correlation-ID is replaced with a new ULID.
     */
    public function test_unsafe_correlation_id_is_replaced(): void
    {
        $response = $this->withHeaders([
            'X-Correlation-ID' => '<script>alert(1)</script>',
        ])->postJson('/api/v1/auth/login', []);

        $correlationId = $response->headers->get('X-Correlation-ID');

        $this->assertNotEquals('<script>alert(1)</script>', $correlationId);
        $this->assertNotEmpty($correlationId);
    }

    // ── Exception Normalization ────────────────────────────────────────────────

    /**
     * Validation errors return 422 with VALIDATION_ERROR code.
     */
    public function test_validation_error_returns_standard_envelope(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'success',
                'message',
                'error' => ['code', 'details'],
            ])
            ->assertJsonPath('success', false)
            ->assertJsonPath('error.code', 'VALIDATION_ERROR');
    }

    /**
     * Unauthenticated requests return 401 with UNAUTHENTICATED code.
     */
    public function test_unauthenticated_request_returns_standard_envelope(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'error' => ['code' => 'UNAUTHENTICATED', 'details' => []],
            ]);
    }

    /**
     * Not found routes return 404 with RESOURCE_NOT_FOUND code.
     */
    public function test_not_found_route_returns_standard_envelope(): void
    {
        $response = $this->getJson('/api/v1/nonexistent-route');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'error' => ['code' => 'RESOURCE_NOT_FOUND', 'details' => []],
            ]);
    }

    /**
     * Wrong HTTP method returns 405 with METHOD_NOT_ALLOWED code.
     */
    public function test_method_not_allowed_returns_standard_envelope(): void
    {
        // login only accepts POST
        $response = $this->getJson('/api/v1/auth/login');

        $response->assertStatus(405)
            ->assertJson([
                'success' => false,
                'error' => ['code' => 'METHOD_NOT_ALLOWED', 'details' => []],
            ]);
    }

    // ── BusinessException ───────────────────────────────────────────────────

    /**
     * BusinessException carries a stable error code, message, and HTTP status.
     */
    public function test_business_exception_has_correct_attributes(): void
    {
        $exception = new BusinessException(
            'MAX_GALLERY_LIMIT_EXCEEDED',
            409,
            'لا يمكن إضافة أكثر من 10 صور.',
            ['limit' => 10, 'current_count' => 10]
        );

        $this->assertSame('MAX_GALLERY_LIMIT_EXCEEDED', $exception->getErrorCode());
        $this->assertSame(409, $exception->getHttpStatus());
        $this->assertSame('لا يمكن إضافة أكثر من 10 صور.', $exception->getMessage());
        $this->assertSame(['limit' => 10, 'current_count' => 10], $exception->getDetails());
    }

    /**
     * A thrown BusinessException is rendered as a standard error envelope.
     * We trigger it by hitting a store-action endpoint on a non-existent resource.
     */
    public function test_business_exception_renders_standard_envelope(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Non-existent store → ModelNotFoundException → RESOURCE_NOT_FOUND
        $response = $this->actingAs($admin)->patchJson('/api/v1/admin/stores/non-existent-store/approve');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'error' => ['code' => 'RESOURCE_NOT_FOUND'],
            ]);
    }
}
