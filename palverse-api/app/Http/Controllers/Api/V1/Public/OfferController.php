<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\OfferResource;
use App\Models\Offer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        
        $offers = Offer::publicVisible()
            ->with(['store' => function ($q) {
                $q->select('id', 'public_id', 'slug', 'name_ar', 'name_en');
            }, 'store.logo'])
            ->ordered()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => app()->getLocale() === 'en' ? 'Offers retrieved successfully.' : 'تم جلب العروض بنجاح.',
            'data' => OfferResource::collection($offers)->response()->getData(true)['data'],
            'meta' => OfferResource::collection($offers)->response()->getData(true)['meta'],
        ]);
    }
}
