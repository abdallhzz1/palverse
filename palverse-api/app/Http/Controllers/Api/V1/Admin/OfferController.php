<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\AdminOfferIndexRequest;
use App\Http\Resources\Api\V1\OfferResource;
use App\Models\Offer;
use App\Services\OfferService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class OfferController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private OfferService $offerService) {}

    public function index(AdminOfferIndexRequest $request): JsonResponse
    {
        Gate::authorize('viewAny', Offer::class);

        $query = Offer::with(['store.owner']);

        if ($request->has('query') && $request->filled('query')) {
            $search = $request->input('query');
            $query->where(function ($q) use ($search) {
                $q->where('title_ar', 'like', "%{$search}%")
                    ->orWhere('title_en', 'like', "%{$search}%");
            });
        }

        if ($request->has('store_public_id') && $request->filled('store_public_id')) {
            $query->whereHas('store', function ($q) use ($request) {
                $q->where('public_id', $request->input('store_public_id'));
            });
        }

        if ($request->has('owner_public_id') && $request->filled('owner_public_id')) {
            $query->whereHas('store.owner', function ($q) use ($request) {
                $q->where('public_id', $request->input('owner_public_id'));
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->boolean('valid_now')) {
            $query->currentlyValid();
        }

        $sort = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc');
        $query->orderBy($sort, $direction);

        $perPage = $request->input('per_page', 15);
        $offers = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => __('Offers retrieved successfully.'),
            'data' => OfferResource::collection($offers)->response()->getData(true)['data'],
            'meta' => OfferResource::collection($offers)->response()->getData(true)['meta'] ?? [],
        ]);
    }

    public function show(string $publicId): JsonResponse
    {
        $offer = Offer::with('store')->where('public_id', $publicId)->firstOrFail();

        Gate::authorize('view', $offer);

        return response()->json([
            'success' => true,
            'message' => __('Offer details retrieved successfully.'),
            'data' => new OfferResource($offer),
        ]);
    }

    public function activate(string $publicId): JsonResponse
    {
        $offer = Offer::where('public_id', $publicId)->firstOrFail();

        Gate::authorize('update', $offer);

        $offer->is_active = true;
        $offer->save();

        return response()->json([
            'success' => true,
            'message' => __('Offer activated successfully.'),
            'data' => new OfferResource($offer),
        ]);
    }

    public function deactivate(string $publicId): JsonResponse
    {
        $offer = Offer::where('public_id', $publicId)->firstOrFail();

        Gate::authorize('update', $offer);

        $offer->is_active = false;
        $offer->save();

        return response()->json([
            'success' => true,
            'message' => __('Offer deactivated successfully.'),
            'data' => new OfferResource($offer),
        ]);
    }

    public function destroy(string $publicId): JsonResponse
    {
        $offer = Offer::where('public_id', $publicId)->firstOrFail();

        Gate::authorize('delete', $offer);

        $this->offerService->deleteOffer($offer);

        return response()->json([
            'success' => true,
            'message' => __('Offer deleted successfully.'),
        ]);
    }
}
