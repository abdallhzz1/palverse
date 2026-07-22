<?php

namespace App\Http\Controllers\Api\V1\FollowUp;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\StoreAdvertisement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AdvertisementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('manage-advertisements');

        $advertisements = StoreAdvertisement::with('store')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $advertisements->items(),
            'meta' => [
                'current_page' => $advertisements->currentPage(),
                'last_page' => $advertisements->lastPage(),
                'total' => $advertisements->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        Gate::authorize('manage-advertisements');

        $validated = $request->validate([
            'store_public_id' => 'required|string|exists:stores,public_id',
            'ad_type' => 'required|in:featured_store,banner',
            'image' => 'nullable|image|max:10240|required_if:ad_type,banner',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'amount_paid' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $store = Store::publicVisible()->where('public_id', $validated['store_public_id'])->first();

        if (!$store) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'store_public_id' => ['المتجر المختار غير متاح أو اشتراكه منتهي. يجب أن يكون المتجر معتمداً ولديه اشتراك فعّال.']
            ]);
        }

        if ($validated['ad_type'] === 'banner') {
            $overlappingCount = StoreAdvertisement::where('ad_type', 'banner')
                ->where('is_active', true)
                ->where('start_date', '<=', $validated['end_date'])
                ->where('end_date', '>=', $validated['start_date'])
                ->count();

            if ($overlappingCount >= 3) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'start_date' => ['تم الوصول للحد الأقصى للبنرات الإعلانية (3 بنرات) في هذه الفترة الزمنية. يرجى اختيار تواريخ أخرى.']
                ]);
            }
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('advertisements', 'public');
        }

        $advertisement = StoreAdvertisement::create([
            'store_id' => $store->id,
            'ad_type' => $validated['ad_type'],
            'image_path' => $imagePath,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'amount_paid' => $validated['amount_paid'],
            'notes' => $validated['notes'],
            'created_by' => $request->user()->id,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Advertisement created successfully',
            'data' => $advertisement->load('store'),
        ], 201);
    }

    public function update(Request $request, string $public_id): JsonResponse
    {
        Gate::authorize('manage-advertisements');

        $advertisement = StoreAdvertisement::where('public_id', $public_id)->firstOrFail();

        $validated = $request->validate([
            'is_active' => 'boolean',
        ]);

        if (isset($validated['is_active'])) {
            $advertisement->is_active = $validated['is_active'];
            $advertisement->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Advertisement updated successfully',
            'data' => $advertisement,
        ]);
    }

    public function destroy(string $public_id): JsonResponse
    {
        Gate::authorize('manage-advertisements');

        $advertisement = StoreAdvertisement::where('public_id', $public_id)->firstOrFail();
        $advertisement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Advertisement deleted successfully',
        ]);
    }
}
