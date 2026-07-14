<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    public function __construct(
        protected AuthTokenService $tokenService
    ) {}

    /**
     * List all active sessions for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentToken = $user->currentAccessToken();

        $tokens = $user->tokens()->orderByDesc('id')->get();

        $sessions = $tokens->map(function ($token) use ($currentToken) {
            return $this->tokenService->formatSession($token, $currentToken);
        });

        return response()->json([
            'success' => true,
            'message' => 'Sessions retrieved successfully.',
            'data' => $sessions,
            'meta' => [],
        ]);
    }

    /**
     * Revoke a specific session by public_id.
     */
    public function destroy(Request $request, string $publicId): JsonResponse
    {
        $user = $request->user();

        $revoked = $this->tokenService->revokeSession($user, $publicId);

        if (! $revoked) {
            return response()->json([
                'success' => false,
                'message' => 'Session not found.',
                'error' => ['code' => 'SESSION_NOT_FOUND', 'details' => []],
                'meta' => [],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Session revoked successfully.',
            'data' => null,
            'meta' => [],
        ]);
    }

    /**
     * Revoke all sessions for the authenticated user.
     */
    public function destroyAll(Request $request): JsonResponse
    {
        $user = $request->user();

        $count = $this->tokenService->revokeAllSessions($user);

        return response()->json([
            'success' => true,
            'message' => 'All sessions revoked successfully.',
            'data' => [
                'revoked_count' => $count,
            ],
            'meta' => [],
        ]);
    }

    /**
     * Revoke all other sessions for the authenticated user, keeping the current one.
     */
    public function destroyOthers(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentToken = $user->currentAccessToken();

        if (! $currentToken) {
            return response()->json([
                'success' => false,
                'message' => 'Current session could not be resolved.',
                'error' => ['code' => 'CURRENT_SESSION_NOT_RESOLVED', 'details' => []],
                'meta' => [],
            ], 409);
        }

        $count = $this->tokenService->revokeOtherSessions($user, $currentToken);

        return response()->json([
            'success' => true,
            'message' => 'Other sessions revoked successfully.',
            'data' => [
                'revoked_count' => $count,
            ],
            'meta' => [],
        ]);
    }
}
