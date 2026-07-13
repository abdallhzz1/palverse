<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\RegisterMerchantRequest;
use App\Http\Resources\UserResource;
use App\Models\SystemSetting;
use App\Services\MerchantRegistrationService;
use Illuminate\Http\JsonResponse;

class RegisterMerchantController extends Controller
{
    public function __invoke(
        RegisterMerchantRequest $request,
        MerchantRegistrationService $registrationService
    ): JsonResponse {
        // Enforce merchant_registration_enabled system setting.
        // Default: true (safe for development, controllable in production via admin panel).
        $enabled = $this->isMerchantRegistrationEnabled();

        if (! $enabled) {
            return response()->json([
                'success' => false,
                'message' => 'Merchant registration is currently disabled.',
                'error' => [
                    'code' => 'MERCHANT_REGISTRATION_DISABLED',
                    'details' => [],
                ],
                'meta' => [],
            ], 403);
        }

        $user = $registrationService->register($request->validated());

        $user->loadMissing('roles');

        // Issue a Sanctum token immediately so the merchant can begin onboarding.
        $token = $user->createToken('merchant-registration')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Merchant account created successfully.',
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => new UserResource($user),
            ],
            'meta' => [],
        ], 201);
    }

    /**
     * Read the merchant_registration_enabled setting.
     * Falls back to true when the setting is missing (development-safe default).
     */
    private function isMerchantRegistrationEnabled(): bool
    {
        try {
            $setting = SystemSetting::where('group', 'maintenance')
                ->where('key', 'merchant_registration_enabled')
                ->first();

            if ($setting === null) {
                return true; // safe default: enabled
            }

            // The setting is stored as type=boolean; value is '1' or '0' / 'true' / 'false'
            return filter_var($setting->value, FILTER_VALIDATE_BOOLEAN);
        } catch (\Throwable) {
            return true; // degrade gracefully
        }
    }
}
