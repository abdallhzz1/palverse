<?php

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Merchant\OfferIndexRequest;
use App\Http\Requests\Api\V1\Merchant\StoreOfferRequest;
use App\Http\Requests\Api\V1\Merchant\UpdateOfferRequest;
use App\Http\Resources\Api\V1\OfferResource;
use App\Models\Offer;
use App\Models\Store;
use App\Services\OfferService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class OfferController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private OfferService $offerService) {}

    public function index(OfferIndexRequest $request, string $storePublicId): JsonResponse
    {
        Gate::authorize('viewAny', Offer::class);

        $store = Store::where('public_id', $storePublicId)->firstOrFail();

        // Merchant must own the store
        Gate::authorize('view', $store);

        $query = Offer::forStore($store->id);

        if ($request->has('query') && $request->filled('query')) {
            $search = $request->input('query');
            $query->where(function ($q) use ($search) {
                $q->where('title_ar', 'like', "%{$search}%")
                    ->orWhere('title_en', 'like', "%{$search}%");
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

    public function store(StoreOfferRequest $request, string $storePublicId): JsonResponse
    {
        Gate::authorize('create', Offer::class);

        $store = Store::where('public_id', $storePublicId)->firstOrFail();

        Gate::authorize('update', $store);

        $subscription = $store->currentSubscription;
        if (! $subscription) {
            return response()->json([
                'success' => false,
                'message' => 'An active subscription is required to add offers.',
                'error' => ['code' => 'SUBSCRIPTION_REQUIRED', 'details' => []],
                'meta' => [],
            ], 403);
        }

        $maxOffers = $subscription->plan->max_offers;
        if ($maxOffers !== null && $store->offers()->count() >= $maxOffers) {
            return response()->json([
                'success' => false,
                'message' => 'You have reached the maximum number of offers allowed for your subscription plan.',
                'error' => ['code' => 'MAX_OFFERS_REACHED', 'details' => []],
                'meta' => [],
            ], 403);
        }

        $data = $request->validated();
        $image = $request->file('image');

        $offer = $this->offerService->createOffer($store, $data, $image);

        return response()->json([
            'success' => true,
            'message' => __('Offer created successfully.'),
            'data' => new OfferResource($offer),
        ], 201);
    }

    public function show(string $storePublicId, string $offerPublicId): JsonResponse
    {
        $store = Store::where('public_id', $storePublicId)->firstOrFail();
        $offer = Offer::where('public_id', $offerPublicId)->where('store_id', $store->id)->firstOrFail();

        Gate::authorize('view', $offer);

        return response()->json([
            'success' => true,
            'message' => __('Offer details retrieved successfully.'),
            'data' => new OfferResource($offer),
        ]);
    }

    public function update(UpdateOfferRequest $request, string $storePublicId, string $offerPublicId): JsonResponse
    {
        $store = Store::where('public_id', $storePublicId)->firstOrFail();
        $offer = Offer::where('public_id', $offerPublicId)->where('store_id', $store->id)->firstOrFail();

        Gate::authorize('update', $offer);

        $data = $request->validated();
        $image = $request->file('image');
        $removeImage = $request->boolean('remove_image');

        $offer = $this->offerService->updateOffer($offer, $data, $image, $removeImage);

        return response()->json([
            'success' => true,
            'message' => __('Offer updated successfully.'),
            'data' => new OfferResource($offer),
        ]);
    }

    public function destroy(string $storePublicId, string $offerPublicId): JsonResponse
    {
        $store = Store::where('public_id', $storePublicId)->firstOrFail();
        $offer = Offer::where('public_id', $offerPublicId)->where('store_id', $store->id)->firstOrFail();

        Gate::authorize('delete', $offer);

        $this->offerService->deleteOffer($offer);

        return response()->json(null, 204);
    }
}
