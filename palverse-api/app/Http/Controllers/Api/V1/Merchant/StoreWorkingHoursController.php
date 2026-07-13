<?php

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Merchant\WorkingHours\UpdateStoreWorkingHoursRequest;
use App\Http\Resources\StoreWorkingHourResource;
use App\Models\Store;
use App\Services\StoreWorkingHoursService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreWorkingHoursController extends Controller
{
    public function __construct(private StoreWorkingHoursService $service) {}

    public function show(string $publicId, Request $request): JsonResponse
    {
        $store = Store::where('public_id', $publicId)->firstOrFail();

        if ($request->user()->cannot('view', $store)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
                'error' => ['code' => 'STORE_ACCESS_DENIED'],
                'meta' => [],
            ], 403);
        }

        $workingHours = $store->workingHours;

        return response()->json([
            'success' => true,
            'message' => 'تم جلب أوقات العمل بنجاح.',
            'data' => StoreWorkingHourResource::collectionGroupedByDay($workingHours),
            'meta' => [],
        ]);
    }

    public function update(UpdateStoreWorkingHoursRequest $request, string $publicId): JsonResponse
    {
        $store = Store::where('public_id', $publicId)->firstOrFail();

        if ($request->user()->cannot('update', $store)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
                'error' => ['code' => 'STORE_ACCESS_DENIED'],
                'meta' => [],
            ], 403);
        }

        $this->service->replaceSchedule($store, $request->validated()['days']);

        $store->load('workingHours');

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث أوقات العمل بنجاح.',
            'data' => StoreWorkingHourResource::collectionGroupedByDay($store->workingHours),
            'meta' => [],
        ]);
    }
}
