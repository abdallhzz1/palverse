<?php

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Enums\AuditAction;
use App\Enums\StoreStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Merchant\StoreMerchantStoreRequest;
use App\Http\Requests\Api\V1\Merchant\UpdateMerchantStoreRequest;
use App\Http\Resources\StoreResource;
use App\Models\Category;
use App\Models\City;
use App\Models\Store;
use App\Models\Zone;
use App\Services\AuditLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StoreController extends Controller
{
    public function __construct(protected AuditLogService $auditLogService) {}

    public function index(Request $request): JsonResponse
    {
        $stores = Store::with(['category', 'city', 'zone', 'logo', 'cover'])
            ->ownedBy($request->user())
            ->ordered()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'تم جلب المتاجر بنجاح.',
            'data' => StoreResource::collection($stores)->response()->getData(true)['data'],
            'meta' => StoreResource::collection($stores)->response()->getData(true)['meta'],
        ]);
    }

    public function store(StoreMerchantStoreRequest $request): JsonResponse
    {
        if ($request->user()->stores()->count() >= 1) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن إضافة أكثر من محل واحد لنفس الحساب.',
                'errors' => ['store' => ['You can only have one store per account.']],
                'meta' => [],
            ], 422);
        }

        $validated = $request->validated();

        $category = Category::where('public_id', $validated['category_public_id'])->first();
        $city = City::where('public_id', $validated['city_public_id'])->first();
        $zone = Zone::where('public_id', $validated['zone_public_id'])->first();

        DB::beginTransaction();
        try {
            $store = new Store;
            $store->owner_id = $request->user()->id;
            $store->category_id = $category->id;
            $store->city_id = $city->id;
            $store->zone_id = $zone->id;
            $store->name_ar = $validated['name_ar'];
            $store->name_en = $validated['name_en'] ?? null;
            $store->description_ar = $validated['description_ar'];
            $store->description_en = $validated['description_en'] ?? null;
            $store->phone = $validated['phone'];
            $store->whatsapp = $validated['whatsapp'] ?? null;
            $store->email = $validated['email'] ?? null;
            $store->website = $validated['website'] ?? null;
            $store->address_ar = $validated['address_ar'];
            $store->address_en = $validated['address_en'] ?? null;
            $store->latitude = $validated['latitude'] ?? null;
            $store->longitude = $validated['longitude'] ?? null;

            $store->status = StoreStatus::PENDING;
            $store->is_active = false;
            $store->save();

            DB::table('store_status_history')->insert([
                'store_id' => $store->id,
                'admin_id' => null,
                'old_status' => null,
                'new_status' => StoreStatus::PENDING->value,
                'action' => 'submitted',
                'reason' => 'Store submitted for review',
                'created_at' => now(),
            ]);

            $this->auditLogService->recordFromRequest(
                action: AuditAction::StoreCreated,
                subject: $store,
                newValues: $store->only(['name_ar', 'name_en', 'phone', 'email', 'status', 'is_active', 'category_id', 'city_id', 'zone_id'])
            );
            $this->auditLogService->recordFromRequest(
                action: AuditAction::StoreSubmitted,
                subject: $store,
                newValues: ['status' => StoreStatus::PENDING->value, 'reason' => 'Store submitted for review']
            );

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        $store->load(['category', 'city', 'zone']);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء المتجر بنجاح وبانتظار الموافقة.',
            'data' => new StoreResource($store),
            'meta' => [],
        ], 201);
    }

    public function show(string $publicId, Request $request): JsonResponse
    {
        $store = Store::with(['category', 'city', 'zone', 'logo', 'cover', 'gallery', 'workingHours', 'socialLinks'])
            ->where('public_id', $publicId)
            ->firstOrFail();

        if ($request->user()->cannot('view', $store)) {
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

    public function update(UpdateMerchantStoreRequest $request, string $publicId): JsonResponse
    {
        $validated = $request->validated();
        $store = Store::where('public_id', $publicId)->firstOrFail();

        DB::beginTransaction();
        try {
            $fillables = ['name_ar', 'name_en', 'description_ar', 'description_en', 'phone', 'whatsapp', 'email', 'website', 'address_ar', 'address_en', 'latitude', 'longitude'];
            $oldValues = $store->only(array_merge($fillables, ['category_id', 'city_id', 'zone_id']));

            if (isset($validated['category_public_id'])) {
                $store->category_id = Category::where('public_id', $validated['category_public_id'])->first()->id;
            }
            if (isset($validated['city_public_id'])) {
                $store->city_id = City::where('public_id', $validated['city_public_id'])->first()->id;
            }
            if (isset($validated['zone_public_id'])) {
                $store->zone_id = Zone::where('public_id', $validated['zone_public_id'])->first()->id;
            }

            foreach ($fillables as $field) {
                if (array_key_exists($field, $validated)) {
                    $store->$field = $validated[$field];
                }
            }

            $resubmitted = false;
            if ($store->status === StoreStatus::REJECTED) {
                $oldStatus = $store->status->value;
                $store->status = StoreStatus::PENDING;
                $store->rejection_reason = null;
                $store->rejected_at = null;
                $store->rejected_by = null;
                $resubmitted = true;

                DB::table('store_status_history')->insert([
                    'store_id' => $store->id,
                    'admin_id' => null,
                    'old_status' => $oldStatus,
                    'new_status' => StoreStatus::PENDING->value,
                    'action' => 'resubmitted',
                    'reason' => 'Merchant updated rejected store',
                    'created_at' => now(),
                ]);
            }

            $store->save();

            $newValues = $store->only(array_keys($oldValues));
            $this->auditLogService->recordFromRequest(
                action: AuditAction::StoreUpdated,
                subject: $store,
                oldValues: $oldValues,
                newValues: $newValues
            );

            if ($resubmitted) {
                $this->auditLogService->recordFromRequest(
                    action: AuditAction::StoreSubmitted,
                    subject: $store,
                    oldValues: ['status' => StoreStatus::REJECTED->value],
                    newValues: ['status' => StoreStatus::PENDING->value]
                );
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        $store->load(['category', 'city', 'zone']);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث المتجر بنجاح.',
            'data' => new StoreResource($store),
            'meta' => [],
        ]);
    }

    public function status(string $publicId, Request $request): JsonResponse
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

        return response()->json([
            'success' => true,
            'message' => 'حالة المتجر.',
            'data' => [
                'public_id' => $store->public_id,
                'status' => $store->status->value,
                'is_active' => $store->is_active,
                'rejection_reason' => $store->status === StoreStatus::REJECTED ? $store->rejection_reason : null,
                'approved_at' => $store->approved_at,
                'rejected_at' => $store->rejected_at,
            ],
            'meta' => [],
        ]);
    }
}
