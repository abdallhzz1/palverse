<?php

namespace App\Http\Controllers\Api\V1\Representative;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Representative\StoreRegistrationRequestResource;
use App\Models\StoreRegistrationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StoreRegistrationRequestMediaController extends Controller
{
    public function storeLogo(Request $request, string $publicId): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $storeRequest = $this->findOwnedDraft($request, $publicId);
        $draft = $storeRequest->draft_media ?? [];

        if (! empty($draft['logo']['path'])) {
            Storage::disk($draft['logo']['disk'] ?? 'public')->delete($draft['logo']['path']);
        }

        $draft['logo'] = $this->storeUploadedFile($request->file('file'), $storeRequest->public_id, 'logo');
        $storeRequest->draft_media = $draft;
        $storeRequest->save();

        return $this->resourceResponse($storeRequest);
    }

    public function destroyLogo(Request $request, string $publicId): JsonResponse
    {
        $storeRequest = $this->findOwnedDraft($request, $publicId);
        $draft = $storeRequest->draft_media ?? [];

        if (! empty($draft['logo']['path'])) {
            Storage::disk($draft['logo']['disk'] ?? 'public')->delete($draft['logo']['path']);
        }

        unset($draft['logo']);
        $storeRequest->draft_media = $draft ?: null;
        $storeRequest->save();

        return $this->resourceResponse($storeRequest);
    }

    public function storeCover(Request $request, string $publicId): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
        ]);

        $storeRequest = $this->findOwnedDraft($request, $publicId);
        $draft = $storeRequest->draft_media ?? [];

        if (! empty($draft['cover']['path'])) {
            Storage::disk($draft['cover']['disk'] ?? 'public')->delete($draft['cover']['path']);
        }

        $draft['cover'] = $this->storeUploadedFile($request->file('file'), $storeRequest->public_id, 'cover');
        $storeRequest->draft_media = $draft;
        $storeRequest->save();

        return $this->resourceResponse($storeRequest);
    }

    public function destroyCover(Request $request, string $publicId): JsonResponse
    {
        $storeRequest = $this->findOwnedDraft($request, $publicId);
        $draft = $storeRequest->draft_media ?? [];

        if (! empty($draft['cover']['path'])) {
            Storage::disk($draft['cover']['disk'] ?? 'public')->delete($draft['cover']['path']);
        }

        unset($draft['cover']);
        $storeRequest->draft_media = $draft ?: null;
        $storeRequest->save();

        return $this->resourceResponse($storeRequest);
    }

    public function storeGallery(Request $request, string $publicId): JsonResponse
    {
        $request->validate([
            'files' => ['required', 'array', 'min:1', 'max:10'],
            'files.*' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
        ]);

        $storeRequest = $this->findOwnedDraft($request, $publicId);
        $draft = $storeRequest->draft_media ?? [];
        $gallery = $draft['gallery'] ?? [];

        foreach ($request->file('files') as $file) {
            $gallery[] = $this->storeUploadedFile($file, $storeRequest->public_id, 'gallery');
        }

        $draft['gallery'] = $gallery;
        $storeRequest->draft_media = $draft;
        $storeRequest->save();

        return $this->resourceResponse($storeRequest);
    }

    public function destroyGalleryItem(Request $request, string $publicId, string $pathHash): JsonResponse
    {
        $storeRequest = $this->findOwnedDraft($request, $publicId);
        $draft = $storeRequest->draft_media ?? [];
        $gallery = $draft['gallery'] ?? [];

        $draft['gallery'] = array_values(array_filter($gallery, function (array $item) use ($pathHash) {
            $matches = hash('sha256', $item['path'] ?? '') === $pathHash;
            if ($matches && ! empty($item['path'])) {
                Storage::disk($item['disk'] ?? 'public')->delete($item['path']);
            }

            return ! $matches;
        }));

        $storeRequest->draft_media = $draft;
        $storeRequest->save();

        return $this->resourceResponse($storeRequest);
    }

    private function findOwnedDraft(Request $request, string $publicId): StoreRegistrationRequest
    {
        $storeRequest = StoreRegistrationRequest::query()
            ->where('public_id', $publicId)
            ->firstOrFail();

        $this->authorize('update', $storeRequest);

        return $storeRequest;
    }

    /**
     * @return array{path: string, disk: string, original_name: string, mime_type: string|null, file_size: int}
     */
    private function storeUploadedFile(\Illuminate\Http\UploadedFile $file, string $requestPublicId, string $folder): array
    {
        $path = $file->store("registration-requests/{$requestPublicId}/{$folder}", 'public');

        return [
            'path' => $path,
            'disk' => 'public',
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize() ?: 0,
            'path_hash' => hash('sha256', $path),
        ];
    }

    private function resourceResponse(StoreRegistrationRequest $storeRequest): JsonResponse
    {
        return response()->json([
            'data' => new StoreRegistrationRequestResource(
                $storeRequest->fresh()->load(['zone', 'city', 'category'])
            ),
        ]);
    }
}
