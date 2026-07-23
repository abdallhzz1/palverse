<?php

namespace App\Http\Controllers\Api\V1\FollowUp;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\ReviewStoreRequestRequest; // Reusing since it's identical
use App\Http\Resources\Api\V1\Representative\StoreRegistrationRequestResource;
use App\Models\StoreRegistrationRequest;
use App\Services\StoreRegistrationRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreRequestController extends Controller
{
    public function __construct(private StoreRegistrationRequestService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        // Policy should allow follow_up role to view Any if permitted.
        $this->authorize('viewAny', StoreRegistrationRequest::class);

        $query = StoreRegistrationRequest::with(['representative', 'zone', 'city', 'category'])
            ->latest();

        $status = $request->query('status');
        if (is_string($status) && $status !== '' && $status !== 'all') {
            $query->where('status', $status);
        } else {
            // Shared review queue: hide drafts by default.
            $query->where('status', '!=', 'draft');
        }

        $requests = $query->paginate();

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
            ->with(['representative', 'zone', 'city', 'category', 'statusHistory', 'resultingStore'])
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
            'data' => new StoreRegistrationRequestResource($storeRequest->load(['representative', 'zone', 'city', 'category']))
        ]);
    }
}
