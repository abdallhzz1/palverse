<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\RegisterMerchantRequest;
use Illuminate\Http\JsonResponse;

class RegisterMerchantController extends Controller
{
    /**
     * Merchant self-registration is disabled.
     * New merchants/stores come only from representative requests or public join requests.
     */
    public function __invoke(RegisterMerchantRequest $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'تسجيل التاجر الذاتي غير متاح. يرجى استخدام طلب الانضمام أو التواصل مع مندوب Palverse.',
            'error' => [
                'code' => 'MERCHANT_SELF_REGISTRATION_DISABLED',
                'details' => [
                    'join_request' => '/api/v1/merchant-join-requests',
                    'hint' => 'Use public join request or representative store registration only.',
                ],
            ],
            'meta' => [],
        ], 403);
    }
}
