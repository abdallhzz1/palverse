<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use App\Services\AuthTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SessionManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_sessions()
    {
        $user = User::factory()->create();

        $tokenService = app(AuthTokenService::class);

        // Create an old session
        $request = request();
        $tokenService->createToken($user, $request, 'old-device', 'ios');

        // Create current session
        $currentToken = $tokenService->createToken($user, $request, 'current-device', 'web');

        $response = $this->getJson('/api/v1/auth/sessions', [
            'Authorization' => 'Bearer '.$currentToken->plainTextToken,
        ]);

        $response->assertOk()
            ->assertJsonCount(2, 'data');

        // The first one (ordered by created_at desc) should be the current one
        $this->assertTrue($response->json('data.0.is_current'));
        $this->assertFalse($response->json('data.1.is_current'));
    }

    public function test_can_revoke_specific_session()
    {
        $user = User::factory()->create();
        $tokenService = app(AuthTokenService::class);

        $token1 = $tokenService->createToken($user, request(), 'dev1');
        $token2 = $tokenService->createToken($user, request(), 'dev2');

        $response = $this->deleteJson("/api/v1/auth/sessions/{$token2->accessToken->public_id}", [], [
            'Authorization' => 'Bearer '.$token1->plainTextToken,
        ]);

        $response->assertOk();

        $this->assertDatabaseMissing('personal_access_tokens', [
            'public_id' => $token2->accessToken->public_id,
        ]);

        $this->assertDatabaseHas('personal_access_tokens', [
            'public_id' => $token1->accessToken->public_id,
        ]);
    }

    public function test_can_revoke_all_sessions()
    {
        $user = User::factory()->create();
        $tokenService = app(AuthTokenService::class);

        $token1 = $tokenService->createToken($user, request(), 'dev1');
        $token2 = $tokenService->createToken($user, request(), 'dev2');

        $response = $this->deleteJson('/api/v1/auth/sessions/all', [], [
            'Authorization' => 'Bearer '.$token1->plainTextToken,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.revoked_count', 2);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_can_revoke_other_sessions()
    {
        $user = User::factory()->create();
        $tokenService = app(AuthTokenService::class);

        $token1 = $tokenService->createToken($user, request(), 'dev1');
        $token2 = $tokenService->createToken($user, request(), 'dev2');

        $response = $this->deleteJson('/api/v1/auth/sessions/others', [], [
            'Authorization' => 'Bearer '.$token1->plainTextToken,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.revoked_count', 1);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'public_id' => $token2->accessToken->public_id,
        ]);

        $this->assertDatabaseHas('personal_access_tokens', [
            'public_id' => $token1->accessToken->public_id,
        ]);
    }
}
