<?php

namespace App\Http\Controllers\Api\V1\Representative;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Representative\CreateStoreRegistrationRequestRequest;
use App\Http\Requests\Api\V1\Representative\UpdateStoreRegistrationRequestRequest;
use App\Http\Resources\Api\V1\Representative\StoreRegistrationRequestResource;
use App\Models\Category;
use App\Models\City;
use App\Models\StoreRegistrationRequest;
use App\Models\Zone;
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
        $query = StoreRegistrationRequest::where('representative_id', $request->user()->id)
            ->with(['zone', 'city', 'category']);

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $requests = $query->latest()
            ->paginate();

        $paginated = StoreRegistrationRequestResource::collection($requests)->response()->getData(true);

        return response()->json([
            'success' => true,
            'data' => $paginated['data'],
            'meta' => $paginated['meta'],
            'links' => $paginated['links'] ?? null,
        ]);
    }

    public function store(CreateStoreRegistrationRequestRequest $request): JsonResponse
    {
        $zone = Zone::where('public_id', $request->validated('zone_public_id'))->firstOrFail();
        $city = City::where('public_id', $request->validated('city_public_id'))->firstOrFail();
        $category = null;
        if ($request->validated('category_public_id')) {
            $category = Category::where('public_id', $request->validated('category_public_id'))->firstOrFail();
        }

        $data = collect($request->validated())
            ->except(['zone_public_id', 'city_public_id', 'category_public_id'])
            ->all();

        $storeRequest = $this->service->createDraft(
            $request->user(),
            $zone->id,
            $city->id,
            $category?->id,
            $data
        );

        return response()->json([
            'data' => new StoreRegistrationRequestResource($storeRequest->load(['zone', 'city', 'category']))
        ], 201);
    }

    public function show(Request $request, string $publicId): JsonResponse
    {
        $storeRequest = StoreRegistrationRequest::where('public_id', $publicId)
            ->with(['zone', 'city', 'category', 'statusHistory', 'resultingStore'])
            ->firstOrFail();

        $this->authorize('view', $storeRequest);

        return response()->json([
            'data' => new StoreRegistrationRequestResource($storeRequest)
        ]);
    }

    public function update(UpdateStoreRegistrationRequestRequest $request, string $publicId): JsonResponse
    {
        $storeRequest = StoreRegistrationRequest::where('public_id', $publicId)->firstOrFail();
        $this->authorize('update', $storeRequest);

        $data = collect($request->validated())
            ->except(['zone_public_id', 'city_public_id', 'category_public_id'])
            ->all();

        if ($request->has('zone_public_id')) {
            $data['zone_id'] = Zone::where('public_id', $request->validated('zone_public_id'))->firstOrFail()->id;
        }
        if ($request->has('city_public_id')) {
            $data['city_id'] = City::where('public_id', $request->validated('city_public_id'))->firstOrFail()->id;
        }
        if ($request->has('category_public_id')) {
            $data['category_id'] = Category::where('public_id', $request->validated('category_public_id'))->firstOrFail()->id;
        }

        $storeRequest = $this->service->update($storeRequest, $request->user(), $data);

        return response()->json([
            'data' => new StoreRegistrationRequestResource($storeRequest->load(['zone', 'city', 'category']))
        ]);
    }

    public function submit(Request $request, string $publicId): JsonResponse
    {
        $storeRequest = StoreRegistrationRequest::where('public_id', $publicId)->firstOrFail();
        $this->authorize('submit', $storeRequest);

        $storeRequest = $this->service->submit($storeRequest, $request->user());

        return response()->json([
            'data' => new StoreRegistrationRequestResource($storeRequest->load(['zone', 'city', 'category']))
        ]);
    }
}
