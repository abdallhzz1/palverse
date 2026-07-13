<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\QrCodeRequest;
use App\Http\Resources\StoreLinkResource;
use App\Models\Store;
use App\Services\StoreQrCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class StoreLinkController extends Controller
{
    /**
     * Get the public web and deep links for a visible store.
     */
    public function links(string $slug): JsonResponse
    {
        $store = Store::where('slug', $slug)->first();

        if (! $store || ! $store->isPubliclyVisible()) {
            return response()->json([
                'success' => false,
                'message' => 'المتجر غير موجود أو غير متاح.',
                'error' => [
                    'code' => 'STORE_NOT_FOUND',
                    'details' => [],
                ],
                'meta' => [],
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Store links retrieved successfully.',
            'data' => new StoreLinkResource($store),
            'meta' => [],
        ]);
    }

    /**
     * Generate dynamic QR code image for a public visible store.
     *
     * @return Response|JsonResponse
     */
    public function qr(QrCodeRequest $request, string $slug, StoreQrCodeService $qrService)
    {
        $store = Store::where('slug', $slug)->first();

        if (! $store || ! $store->isPubliclyVisible()) {
            return response()->json([
                'success' => false,
                'message' => 'المتجر غير موجود أو غير متاح.',
                'error' => [
                    'code' => 'STORE_NOT_FOUND',
                    'details' => [],
                ],
                'meta' => [],
            ], 404);
        }

        $size = $request->input('size');
        $format = $request->input('format');

        try {
            $qrContent = $qrService->generate($store, $size, $format);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Could not generate QR code.',
                'error' => [
                    'code' => 'QR_GENERATION_FAILED',
                    'details' => [$e->getMessage()],
                ],
                'meta' => [],
            ], 400);
        }

        $contentType = $format === 'png' ? 'image/png' : 'image/svg+xml; charset=UTF-8';
        $filename = 'palverse-'.Str::slug($store->slug).'-qr.'.$format;
        $disposition = $request->input('download') ? 'attachment' : 'inline';

        return response($qrContent)
            ->header('Content-Type', $contentType)
            ->header('X-Content-Type-Options', 'nosniff')
            ->header('Content-Disposition', "{$disposition}; filename=\"{$filename}\"")
            ->header('Cache-Control', 'public, max-age=3600');
    }
}
