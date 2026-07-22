<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\ReviewStoreRequestRequest;
use App\Http\Resources\Api\V1\Representative\StoreRegistrationRequestResource;
use App\Models\StoreRegistrationRequest;
use App\Services\StoreRegistrationRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreRegistrationRequestController extends Controller
{
    public function __construct(private StoreRegistrationRequestService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', StoreRegistrationRequest::class);

        $requests = StoreRegistrationRequest::with(['representative', 'zone', 'city', 'category'])
            ->latest()
            ->paginate();

        $paginated = StoreRegistrationRequestResource::collection($requests)->response()->getData(true);

        return response()->json([
            'success' => true,
            'data' => $paginated['data'],
            'meta' => $paginated['meta'],
            'links' => $paginated['links'] ?? null,
        ]);
    }

    public function show(string $publicId): JsonResponse
    {
        $storeRequest = StoreRegistrationRequest::where('public_id', $publicId)
            ->with(['representative', 'zone', 'city', 'category', 'statusHistory', 'resultingStore', 'resultingMerchant'])
            ->firstOrFail();

        $this->authorize('view', $storeRequest);

        return response()->json([
            'data' => new StoreRegistrationRequestResource($storeRequest)
        ]);
    }

    public function review(ReviewStoreRequestRequest $request, string $publicId): JsonResponse
    {
        $storeRequest = StoreRegistrationRequest::where('public_id', $publicId)->firstOrFail();
        $this->authorize('review', $storeRequest);

        $action = $request->validated('action');
        $reason = $request->validated('reason');

        if ($action === 'approve') {
            $storeRequest = $this->service->approve($storeRequest, $request->user());
        } elseif ($action === 'reject') {
            $storeRequest = $this->service->reject($storeRequest, $request->user(), $reason);
        } elseif ($action === 'request_changes') {
            $storeRequest = $this->service->requestChanges($storeRequest, $request->user(), $reason);
        } elseif ($action === 'start_review') {
            $storeRequest = $this->service->startReview($storeRequest, $request->user());
        }

        return response()->json([
            'data' => new StoreRegistrationRequestResource($storeRequest->load([
                'representative',
                'zone',
                'city',
                'category',
                'resultingStore',
                'resultingMerchant',
            ]))
        ]);
    }
}
