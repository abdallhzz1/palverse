<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\StoreStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\Store\AdminStoreIndexRequest;
use App\Http\Requests\Api\V1\Admin\Store\RejectStoreRequest;
use App\Http\Resources\StoreResource;
use App\Models\Category;
use App\Models\City;
use App\Models\Store;
use App\Models\User;
use App\Models\Zone;
use App\Notifications\StoreActivatedNotification;
use App\Notifications\StoreApprovedNotification;
use App\Notifications\StoreDeactivatedNotification;
use App\Notifications\StoreRejectedNotification;
use App\Services\NotificationService;
use App\Services\StoreSlugService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StoreController extends Controller
{
    private NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function index(AdminStoreIndexRequest $request): JsonResponse
    {
        $query = Store::with(['category', 'city', 'zone', 'owner']);

        if ($request->filled('query')) {
            $q = $request->input('query');
            $query->where(function ($b) use ($q) {
                $b->where('name_ar', 'like', "%{$q}%")
                    ->orWhere('name_en', 'like', "%{$q}%")
                    ->orWhere('public_id', $q);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('owner_public_id')) {
            $owner = User::where('public_id', $request->input('owner_public_id'))->first();
            if ($owner) {
                $query->where('owner_id', $owner->id);
            }
        }

        if ($request->filled('category_public_id')) {
            $cat = Category::where('public_id', $request->input('category_public_id'))->first();
            if ($cat) {
                $query->where('category_id', $cat->id);
            }
        }

        if ($request->filled('city_public_id')) {
            $city = City::where('public_id', $request->input('city_public_id'))->first();
            if ($city) {
                $query->where('city_id', $city->id);
            }
        }

        if ($request->filled('zone_public_id')) {
            $zone = Zone::where('public_id', $request->input('zone_public_id'))->first();
            if ($zone) {
                $query->where('zone_id', $zone->id);
            }
        }

        $sort = $request->input('sort', 'created_at');
        $dir = $request->input('direction', 'desc');
        $query->orderBy($sort, $dir);

        $stores = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'تم جلب المتاجر بنجاح.',
            'data' => StoreResource::collection($stores)->response()->getData(true)['data'],
            'meta' => StoreResource::collection($stores)->response()->getData(true)['meta'],
        ]);
    }

    public function show(string $publicId, Request $request): JsonResponse
    {
        $store = Store::with(['category', 'city', 'zone', 'owner'])
            ->where('public_id', $publicId)
            ->firstOrFail();

        if ($request->user()->cannot('viewAny', Store::class)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
                'error' => ['code' => 'STORE_ACCESS_DENIED'],
                'meta' => [],
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب بيانات المتجر بنجاح.',
            'data' => new StoreResource($store),
            'meta' => [],
        ]);
    }

    public function approve(string $publicId, Request $request, StoreSlugService $slugService): JsonResponse
    {
        $store = Store::where('public_id', $publicId)->firstOrFail();

        if ($request->user()->cannot('approve', $store)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
                'error' => ['code' => 'STORE_ACCESS_DENIED'],
                'meta' => [],
            ], 403);
        }

        if ($store->status === StoreStatus::APPROVED) {
            return response()->json([
                'success' => false,
                'message' => 'المتجر معتمد مسبقاً.',
                'error' => ['code' => 'STORE_ALREADY_APPROVED'],
                'meta' => [],
            ], 409);
        }

        DB::beginTransaction();
        try {
            $oldStatus = $store->status->value;

            $store->status = StoreStatus::APPROVED;
            $store->approved_at = now();
            $store->approved_by = $request->user()->id;

            // clear rejection
            $store->rejected_at = null;
            $store->rejected_by = null;
            $store->rejection_reason = null;

            if (! $store->slug) {
                $store->slug = $slugService->generateUniqueSlug($store);
            }

            // Documented MVP temporary behavior
            $store->is_active = true;

            $store->save();

            DB::table('store_status_history')->insert([
                'store_id' => $store->id,
                'admin_id' => $request->user()->id,
                'old_status' => $oldStatus,
                'new_status' => StoreStatus::APPROVED->value,
                'action' => 'approved',
                'reason' => null,
                'created_at' => now(),
            ]);

            $this->notificationService->send($store->owner, new StoreApprovedNotification($store));

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        return response()->json([
            'success' => true,
            'message' => 'تم اعتماد المتجر بنجاح.',
            'data' => new StoreResource($store),
            'meta' => [],
        ]);
    }

    public function reject(string $publicId, RejectStoreRequest $request): JsonResponse
    {
        $store = Store::where('public_id', $publicId)->firstOrFail();

        if ($request->user()->cannot('reject', $store)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
                'error' => ['code' => 'STORE_ACCESS_DENIED'],
                'meta' => [],
            ], 403);
        }

        if ($store->status === StoreStatus::REJECTED) {
            return response()->json([
                'success' => false,
                'message' => 'المتجر مرفوض مسبقاً.',
                'error' => ['code' => 'STORE_INVALID_STATUS_TRANSITION'],
                'meta' => [],
            ], 409);
        }

        $validated = $request->validated();

        DB::beginTransaction();
        try {
            $oldStatus = $store->status->value;

            $store->status = StoreStatus::REJECTED;
            $store->rejected_at = now();
            $store->rejected_by = $request->user()->id;
            $store->rejection_reason = $validated['rejection_reason'];
            $store->is_active = false;

            // clear approval metadata
            $store->approved_at = null;
            $store->approved_by = null;

            $store->save();

            DB::table('store_status_history')->insert([
                'store_id' => $store->id,
                'admin_id' => $request->user()->id,
                'old_status' => $oldStatus,
                'new_status' => StoreStatus::REJECTED->value,
                'action' => 'rejected',
                'reason' => $validated['rejection_reason'],
                'created_at' => now(),
            ]);

            $this->notificationService->send($store->owner, new StoreRejectedNotification($store, $validated['rejection_reason']));

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        return response()->json([
            'success' => true,
            'message' => 'تم رفض المتجر بنجاح.',
            'data' => new StoreResource($store),
            'meta' => [],
        ]);
    }

    public function activate(string $publicId, Request $request): JsonResponse
    {
        $store = Store::where('public_id', $publicId)->firstOrFail();

        if ($request->user()->cannot('activate', $store)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
                'error' => ['code' => 'STORE_ACCESS_DENIED'],
                'meta' => [],
            ], 403);
        }

        // Must be approved to be activated
        if ($store->status !== StoreStatus::APPROVED) {
            return response()->json([
                'success' => false,
                'message' => 'Store must be approved before activation.',
                'error' => ['code' => 'STORE_NOT_APPROVED'],
                'meta' => [],
            ], 409);
        }

        if ($store->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Store is already active.',
                'error' => ['code' => 'STORE_ALREADY_ACTIVE'],
                'meta' => [],
            ], 409);
        }

        DB::transaction(function () use ($store, $request) {
            $store->is_active = true;
            $store->save();

            DB::table('store_status_history')->insert([
                'store_id' => $store->id,
                'admin_id' => $request->user()->id,
                'old_status' => $store->status->value,
                'new_status' => $store->status->value,
                'action' => 'activated',
                'created_at' => now(),
            ]);

            $this->notificationService->send($store->owner, new StoreActivatedNotification($store));
        });

        return response()->json([
            'success' => true,
            'message' => 'Store activated successfully.',
            'data' => clone new StoreResource($store),
            'meta' => [],
        ], 200);
    }

    public function deactivate(string $publicId, Request $request): JsonResponse
    {
        $store = Store::where('public_id', $publicId)->firstOrFail();

        if ($request->user()->cannot('deactivate', $store)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
                'error' => ['code' => 'STORE_ACCESS_DENIED'],
                'meta' => [],
            ], 403);
        }

        if (! $store->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Store is already inactive.',
                'error' => ['code' => 'STORE_ALREADY_INACTIVE'],
                'meta' => [],
            ], 409);
        }

        DB::transaction(function () use ($store, $request) {
            $store->is_active = false;
            $store->save();

            DB::table('store_status_history')->insert([
                'store_id' => $store->id,
                'admin_id' => $request->user()->id,
                'old_status' => $store->status->value,
                'new_status' => $store->status->value,
                'action' => 'deactivated',
                'created_at' => now(),
            ]);

            $this->notificationService->send($store->owner, new StoreDeactivatedNotification($store));
        });

        return response()->json([
            'success' => true,
            'message' => 'Store deactivated successfully.',
            'data' => clone new StoreResource($store),
            'meta' => [],
        ], 200);
    }
}
