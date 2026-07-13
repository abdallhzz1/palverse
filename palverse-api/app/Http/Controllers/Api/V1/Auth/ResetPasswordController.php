<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\ResetPasswordRequest;
use App\Services\PasswordRecoveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;

class ResetPasswordController extends Controller
{
    public function __invoke(
        ResetPasswordRequest $request,
        PasswordRecoveryService $recoveryService
    ): JsonResponse {
        $status = $recoveryService->resetPassword([
            'email' => $request->input('email'),
            'token' => $request->input('token'),
            'password' => $request->input('password'),
        ]);

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully.',
                'data' => null,
                'meta' => [],
            ]);
        }

        // Map broker status to a stable error code.
        // Covers: INVALID_TOKEN, INVALID_USER, PASSWORD_RESET_THROTTLED
        return response()->json([
            'success' => false,
            'message' => 'The password reset token is invalid or has expired.',
            'error' => [
                'code' => 'PASSWORD_RESET_TOKEN_INVALID',
                'details' => [],
            ],
            'meta' => [],
        ], 422);
    }
}
