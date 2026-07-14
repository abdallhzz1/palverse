<?php

namespace Tests\Architecture;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ApiV1ContractTest extends TestCase
{
    /**
     * Ensure critical endpoints required for v1.0.0 remain registered.
     */
    public function test_v1_frozen_routes_exist()
    {
        $frozenRoutes = [
            'api/v1/health',
            'api/v1/ready',
            'api/v1/auth/login',
            'api/v1/auth/register/merchant',
            'api/v1/bootstrap',
            'api/v1/categories',
            'api/v1/cities',
        ];

        $registeredUris = collect(Route::getRoutes())->map(fn ($r) => $r->uri())->toArray();

        foreach ($frozenRoutes as $route) {
            $this->assertContains($route, $registeredUris, "Frozen route {$route} is missing from the API contract.");
        }
    }

    /**
     * Ensure the default API exception envelope remains unchanged.
     */
    public function test_v1_error_envelope_structure()
    {
        // 404
        $response = $this->getJson('/api/v1/this-route-does-not-exist');

        $response->assertStatus(404)
            ->assertJsonStructure([
                'success',
                'message',
                'error' => [
                    'code',
                    'details',
                ],
            ])
            ->assertJsonPath('success', false)
            ->assertJsonPath('error.code', 'RESOURCE_NOT_FOUND');

        // 401
        $response = $this->getJson('/api/v1/auth/me');
        $response->assertStatus(401)
            ->assertJsonPath('success', false)
            ->assertJsonPath('error.code', 'UNAUTHENTICATED');
    }
}
