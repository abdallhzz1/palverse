<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\ForgotPasswordRequest;
use App\Services\PasswordRecoveryService;
use Illuminate\Http\JsonResponse;

class ForgotPasswordController extends Controller
{
    public function __invoke(
        ForgotPasswordRequest $request,
        PasswordRecoveryService $recoveryService
    ): JsonResponse {
        // Intentionally ignore whether the email exists or the link was actually sent.
        // This prevents account enumeration – the response is always the same.
        $recoveryService->sendResetLink($request->input('email'));

        return response()->json([
            'success' => true,
            'message' => 'If an account exists for this email, password reset instructions have been sent.',
            'data' => null,
            'meta' => [],
        ]);
    }
}
