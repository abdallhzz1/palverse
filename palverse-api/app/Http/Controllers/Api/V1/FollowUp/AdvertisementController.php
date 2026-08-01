<?php

namespace App\Http\Controllers\Api\V1\FollowUp;

use App\Enums\AdPlacement;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\FollowUp\StoreAdvertisementRequest;
use App\Http\Requests\Api\V1\FollowUp\UpdateAdvertisementRequest;
use App\Models\Store;
use App\Models\StoreAdvertisement;
use App\Support\PublicStorageUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AdvertisementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('manage-advertisements');

        $advertisements = StoreAdvertisement::with('store')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $data = collect($advertisements->items())
            ->map(fn (StoreAdvertisement $ad) => $this->serialize($ad))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'current_page' => $advertisements->currentPage(),
                'last_page' => $advertisements->lastPage(),
                'total' => $advertisements->total(),
                'business_timezone' => config('palverse.business_timezone'),
                'banner_placements' => AdPlacement::catalog(),
            ],
        ]);
    }

    public function show(string $public_id): JsonResponse
    {
        Gate::authorize('manage-advertisements');

        $advertisement = StoreAdvertisement::with('store')
            ->where('public_id', $public_id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $this->serialize($advertisement),
            'meta' => [
                'banner_placements' => AdPlacement::catalog(),
            ],
        ]);
    }

    public function store(StoreAdvertisementRequest $request): JsonResponse
    {
        Gate::authorize('manage-advertisements');

        $validated = $request->validated();
        $store = $this->resolveEligibleStore($validated['store_public_id']);

        $placement = null;
        if ($validated['ad_type'] === 'banner') {
            $placement = AdPlacement::from($validated['placement']);
            $this->assertBannerCapacity(
                $placement,
                $validated['start_date'],
                $validated['end_date']
            );
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('advertisements', 'public');
        }

        $advertisement = StoreAdvertisement::create([
            'store_id' => $store->id,
            'ad_type' => $validated['ad_type'],
            'placement' => $placement,
            'image_path' => $imagePath,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'amount_paid' => $validated['amount_paid'],
            'notes' => $validated['notes'] ?? null,
            'created_by' => $request->user()->id,
            'is_active' => array_key_exists('is_active', $validated)
                ? (bool) $validated['is_active']
                : true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء الإعلان وتفعيله بنجاح',
            'data' => $this->serialize($advertisement->load('store')),
        ], 201);
    }

    public function update(UpdateAdvertisementRequest $request, string $public_id): JsonResponse
    {
        Gate::authorize('manage-advertisements');

        $advertisement = StoreAdvertisement::with('store')
            ->where('public_id', $public_id)
            ->firstOrFail();

        $validated = $request->validated();

        if (isset($validated['store_public_id'])) {
            $store = $this->resolveEligibleStore($validated['store_public_id']);
            $advertisement->store_id = $store->id;
        }

        if (isset($validated['ad_type'])) {
            $advertisement->ad_type = $validated['ad_type'];
        }

        if ($advertisement->ad_type === 'featured_store') {
            $advertisement->placement = null;
        } elseif (array_key_exists('placement', $validated)) {
            if (blank($validated['placement'])) {
                throw ValidationException::withMessages([
                    'placement' => ['اختر موضع البنر على الموقع.'],
                ]);
            }
            $advertisement->placement = AdPlacement::from($validated['placement']);
        }

        if ($advertisement->ad_type === 'banner' && blank($advertisement->placement)) {
            throw ValidationException::withMessages([
                'placement' => ['اختر موضع البنر على الموقع والمقاس المناسب له.'],
            ]);
        }

        if (isset($validated['start_date'])) {
            $advertisement->start_date = $validated['start_date'];
        }

        if (isset($validated['end_date'])) {
            $advertisement->end_date = $validated['end_date'];
        }

        if (array_key_exists('amount_paid', $validated)) {
            $advertisement->amount_paid = $validated['amount_paid'];
        }

        if (array_key_exists('notes', $validated)) {
            $advertisement->notes = $validated['notes'];
        }

        if (array_key_exists('is_active', $validated)) {
            $advertisement->is_active = (bool) $validated['is_active'];
        }

        $effectiveStart = optional($advertisement->start_date)->toDateString();
        $effectiveEnd = optional($advertisement->end_date)->toDateString();
        $placement = $advertisement->placement instanceof AdPlacement
            ? $advertisement->placement
            : null;

        if (
            $advertisement->ad_type === 'banner'
            && $placement
            && $effectiveStart
            && $effectiveEnd
            && $advertisement->is_active
        ) {
            $this->assertBannerCapacity($placement, $effectiveStart, $effectiveEnd, $advertisement->id);
        }

        if ($request->hasFile('image')) {
            if ($advertisement->image_path) {
                Storage::disk('public')->delete($advertisement->image_path);
            }
            $advertisement->image_path = $request->file('image')->store('advertisements', 'public');
        } elseif (
            isset($validated['ad_type'])
            && $validated['ad_type'] === 'featured_store'
            && $advertisement->image_path
        ) {
            Storage::disk('public')->delete($advertisement->image_path);
            $advertisement->image_path = null;
        }

        if ($advertisement->ad_type === 'banner' && blank($advertisement->image_path)) {
            throw ValidationException::withMessages([
                'image' => ['يجب رفع صورة للبنر الإعلاني.'],
            ]);
        }

        $advertisement->save();
        $advertisement->load('store');

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الإعلان بنجاح',
            'data' => $this->serialize($advertisement),
        ]);
    }

    public function destroy(string $public_id): JsonResponse
    {
        Gate::authorize('manage-advertisements');

        $advertisement = StoreAdvertisement::where('public_id', $public_id)->firstOrFail();

        if ($advertisement->image_path) {
            Storage::disk('public')->delete($advertisement->image_path);
        }

        $advertisement->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الإعلان بنجاح',
        ]);
    }

    private function resolveEligibleStore(string $publicId): Store
    {
        $store = Store::publicVisible()->where('public_id', $publicId)->first();

        if (! $store) {
            throw ValidationException::withMessages([
                'store_public_id' => ['المتجر المختار غير متاح أو اشتراكه منتهي. يجب أن يكون المتجر معتمداً ولديه اشتراك فعّال.'],
            ]);
        }

        return $store;
    }

    private function assertBannerCapacity(
        AdPlacement $placement,
        string $startDate,
        string $endDate,
        ?int $ignoreId = null
    ): void {
        $query = StoreAdvertisement::query()
            ->where('ad_type', 'banner')
            ->where('placement', $placement->value)
            ->where('is_active', true)
            ->whereDate('start_date', '<=', $endDate)
            ->whereDate('end_date', '>=', $startDate);

        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        $max = $placement->maxConcurrent();

        if ($query->count() >= $max) {
            throw ValidationException::withMessages([
                'placement' => [
                    "تم الوصول للحد الأقصى ({$max}) لبنرات الموضع «{$placement->labelAr()}» في هذه الفترة. اختر موضعاً أو تواريخ أخرى.",
                ],
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(StoreAdvertisement $ad): array
    {
        $visibility = $ad->homepageVisibility();
        $payload = $ad->toArray();
        $payload['placement'] = $visibility['placement'];

        return array_merge($payload, [
            'image_url' => PublicStorageUrl::fromPath($ad->image_path),
            'shows_on_homepage' => $visibility['shows_on_homepage'],
            'shows_publicly' => $visibility['shows_publicly'],
            'homepage_status' => $visibility['status'],
            'public_status' => $visibility['status'],
            'homepage_reasons' => $visibility['reasons'],
            'public_reasons' => $visibility['reasons'],
            'placements' => $visibility['placements'],
            'placement_meta' => $visibility['placement_meta'],
            'business_today' => $visibility['business_today'],
        ]);
    }
}
