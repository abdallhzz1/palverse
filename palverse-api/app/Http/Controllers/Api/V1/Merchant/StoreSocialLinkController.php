<?php

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Merchant\Social\StoreSocialLinkRequest;
use App\Http\Requests\Api\V1\Merchant\Social\UpdateSocialLinkRequest;
use App\Http\Resources\StoreSocialLinkResource;
use App\Models\Store;
use App\Models\StoreSocialLink;
use App\Services\StoreSocialLinkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreSocialLinkController extends Controller
{
    public function __construct(private StoreSocialLinkService $service) {}

    public function index(string $publicId, Request $request): JsonResponse
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
            'message' => 'تم جلب روابط التواصل بنجاح.',
            'data' => StoreSocialLinkResource::collection($store->socialLinks),
            'meta' => [],
        ]);
    }

    public function store(StoreSocialLinkRequest $request, string $publicId): JsonResponse
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

        try {
            $link = $this->service->createLink($store, $request->validated());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => ['code' => 'SOCIAL_LINK_CONFLICT'],
                'meta' => [],
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الرابط بنجاح.',
            'data' => new StoreSocialLinkResource($link),
            'meta' => [],
        ], 201);
    }

    public function show(string $publicId, string $socialLinkPublicId, Request $request): JsonResponse
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

        $link = StoreSocialLink::where('public_id', $socialLinkPublicId)
            ->where('store_id', $store->id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الرابط بنجاح.',
            'data' => new StoreSocialLinkResource($link),
            'meta' => [],
        ]);
    }

    public function update(UpdateSocialLinkRequest $request, string $publicId, string $socialLinkPublicId): JsonResponse
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

        $link = StoreSocialLink::where('public_id', $socialLinkPublicId)
            ->where('store_id', $store->id)
            ->firstOrFail();

        try {
            $link = $this->service->updateLink($link, $request->validated());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => ['code' => 'SOCIAL_LINK_CONFLICT'],
                'meta' => [],
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الرابط بنجاح.',
            'data' => new StoreSocialLinkResource($link),
            'meta' => [],
        ]);
    }

    public function destroy(string $publicId, string $socialLinkPublicId, Request $request): JsonResponse
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

        $link = StoreSocialLink::where('public_id', $socialLinkPublicId)
            ->where('store_id', $store->id)
            ->firstOrFail();

        $this->service->deleteLink($link);

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الرابط بنجاح.',
            'data' => [],
            'meta' => [],
        ]);
    }
}
