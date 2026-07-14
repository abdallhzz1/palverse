<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuthTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(
        protected AuthTokenService $tokenService
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        $user = User::query()
            ->where('email', $credentials['email'])
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات تسجيل الدخول غير صحيحة.',
                'error' => [
                    'code' => 'INVALID_CREDENTIALS',
                    'details' => [],
                ],
                'meta' => [],
            ], 422);
        }

        if ($user->status !== UserStatus::Active) {
            return response()->json([
                'success' => false,
                'message' => 'الحساب غير نشط.',
                'error' => [
                    'code' => 'ACCOUNT_INACTIVE',
                    'details' => [],
                ],
                'meta' => [],
            ], 403);
        }

        $user->forceFill([
            'last_login_at' => now(),
        ])->save();

        $tokenInstance = $this->tokenService->createToken(
            user: $user,
            request: $request,
            deviceName: $credentials['device_name'] ?? 'palverse-client',
            deviceType: $credentials['device_type'] ?? 'unknown'
        );

        $user->loadMissing('roles', 'permissions');

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الدخول بنجاح.',
            'data' => [
                'token' => $tokenInstance->plainTextToken,
                'token_type' => 'Bearer',
                'session' => $this->tokenService->formatSession($tokenInstance->accessToken, $tokenInstance->accessToken),
                'user' => new UserResource($user),
            ],
            'meta' => [],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->loadMissing('roles', 'permissions');

        return response()->json([
            'success' => true,
            'message' => 'تم جلب بيانات المستخدم بنجاح.',
            'data' => [
                'user' => new UserResource($user),
            ],
            'meta' => [],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $currentToken = $request->user()->currentAccessToken();

        if ($currentToken) {
            if ($currentToken->public_id) {
                $this->tokenService->revokeSession($request->user(), $currentToken->public_id);
            } else {
                $currentToken->delete();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الخروج بنجاح.',
            'data' => null,
            'meta' => [],
        ]);
    }
}
