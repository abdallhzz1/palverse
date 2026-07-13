<?php

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Merchant\Media\ReorderStoreGalleryRequest;
use App\Http\Requests\Api\V1\Merchant\Media\UploadStoreCoverRequest;
use App\Http\Requests\Api\V1\Merchant\Media\UploadStoreGalleryRequest;
use App\Http\Requests\Api\V1\Merchant\Media\UploadStoreLogoRequest;
use App\Http\Resources\StoreMediaResource;
use App\Models\Store;
use App\Models\StoreMedia;
use App\Services\StoreMediaService;
use Illuminate\Http\JsonResponse;

class StoreMediaController extends Controller
{
    private StoreMediaService $mediaService;

    public function __construct(StoreMediaService $mediaService)
    {
        $this->mediaService = $mediaService;
    }

    public function storeLogo(UploadStoreLogoRequest $request, string $publicId): JsonResponse
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

        $media = $this->mediaService->uploadLogo($store, $request->file('file'));

        return response()->json([
            'success' => true,
            'message' => 'تم رفع شعار المتجر بنجاح.',
            'data' => clone new StoreMediaResource($media),
            'meta' => [],
        ], 200);
    }

    public function destroyLogo(string $publicId): JsonResponse
    {
        $store = Store::with('logo')->where('public_id', $publicId)->firstOrFail();

        if (request()->user()->cannot('update', $store)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
                'error' => ['code' => 'STORE_ACCESS_DENIED'],
                'meta' => [],
            ], 403);
        }

        if ($store->logo) {
            $this->mediaService->deleteMedia($store->logo);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم حذف شعار المتجر بنجاح.',
            'data' => null,
            'meta' => [],
        ], 204);
    }

    public function storeCover(UploadStoreCoverRequest $request, string $publicId): JsonResponse
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

        $media = $this->mediaService->uploadCover($store, $request->file('file'));

        return response()->json([
            'success' => true,
            'message' => 'تم رفع غلاف المتجر بنجاح.',
            'data' => clone new StoreMediaResource($media),
            'meta' => [],
        ], 200);
    }

    public function destroyCover(string $publicId): JsonResponse
    {
        $store = Store::with('cover')->where('public_id', $publicId)->firstOrFail();

        if (request()->user()->cannot('update', $store)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
                'error' => ['code' => 'STORE_ACCESS_DENIED'],
                'meta' => [],
            ], 403);
        }

        if ($store->cover) {
            $this->mediaService->deleteMedia($store->cover);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم حذف غلاف المتجر بنجاح.',
            'data' => null,
            'meta' => [],
        ], 204);
    }

    public function storeGallery(UploadStoreGalleryRequest $request, string $publicId): JsonResponse
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

        $subscription = $store->currentSubscription;
        if (! $subscription) {
            return response()->json([
                'success' => false,
                'message' => 'An active subscription is required to add gallery images.',
                'error' => ['code' => 'SUBSCRIPTION_REQUIRED', 'details' => []],
                'meta' => [],
            ], 403);
        }

        $maxGalleryImages = $subscription->plan->max_gallery_images;
        $filesCount = count($request->file('files'));
        $currentCount = $store->gallery()->count();

        if ($maxGalleryImages !== null && ($currentCount + $filesCount) > $maxGalleryImages) {
            return response()->json([
                'success' => false,
                'message' => "You have reached the maximum number of gallery images ($maxGalleryImages) allowed for your subscription plan.",
                'error' => ['code' => 'MAX_GALLERY_IMAGES_REACHED', 'details' => []],
                'meta' => [],
            ], 403);
        }

        try {
            $mediaList = $this->mediaService->uploadGallery($store, $request->file('files'));

            return response()->json([
                'success' => true,
                'message' => 'تم رفع الصور بنجاح.',
                'data' => StoreMediaResource::collection($mediaList)->response()->getData(true)['data'],
                'meta' => [],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => ['code' => 'GALLERY_UPLOAD_ERROR'],
                'meta' => [],
            ], 422);
        }
    }

    public function destroyGallery(string $publicId, string $mediaPublicId): JsonResponse
    {
        $store = Store::where('public_id', $publicId)->firstOrFail();

        if (request()->user()->cannot('update', $store)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
                'error' => ['code' => 'STORE_ACCESS_DENIED'],
                'meta' => [],
            ], 403);
        }

        $media = StoreMedia::gallery()
            ->where('store_id', $store->id)
            ->where('public_id', $mediaPublicId)
            ->first();

        if (! $media) {
            return response()->json([
                'success' => false,
                'message' => 'Media not found.',
                'error' => ['code' => 'MEDIA_NOT_FOUND'],
                'meta' => [],
            ], 404);
        }

        $this->mediaService->deleteMedia($media);

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الصورة بنجاح.',
            'data' => null,
            'meta' => [],
        ], 204);
    }

    public function reorderGallery(ReorderStoreGalleryRequest $request, string $publicId): JsonResponse
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

        $items = $request->input('items');

        // Validate that all media items belong to this store and are gallery type
        $publicIds = array_column($items, 'media_public_id');
        $validCount = StoreMedia::gallery()
            ->where('store_id', $store->id)
            ->whereIn('public_id', $publicIds)
            ->count();

        if ($validCount !== count($publicIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Some media items are invalid or do not belong to this store.',
                'error' => ['code' => 'INVALID_MEDIA_ITEMS'],
                'meta' => [],
            ], 422);
        }

        $this->mediaService->reorderGallery($store, $items);

        return response()->json([
            'success' => true,
            'message' => 'تم إعادة ترتيب الصور بنجاح.',
            'data' => null,
            'meta' => [],
        ], 200);
    }
}
