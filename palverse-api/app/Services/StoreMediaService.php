<?php

namespace App\Services;

use App\Enums\AuditAction;
use App\Enums\StoreMediaType;
use App\Models\Store;
use App\Models\StoreMedia;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StoreMediaService
{
    public function __construct(protected AuditLogService $auditLogService) {}

    /**
     * Uploads or replaces a store logo safely.
     */
    public function uploadLogo(Store $store, UploadedFile $file): StoreMedia
    {
        return DB::transaction(function () use ($store, $file) {
            $oldLogo = $store->logo;

            $media = $this->storeFile($store, $file, StoreMediaType::LOGO);

            if ($oldLogo) {
                $oldLogo->delete(); // Soft deletes and observer deletes physical file
            }

            $this->auditLogService->recordFromRequest(
                action: AuditAction::StoreLogoUploaded,
                subject: $store,
                metadata: ['media_public_id' => $media->public_id]
            );

            return $media;
        });
    }

    /**
     * Uploads or replaces a store cover safely.
     */
    public function uploadCover(Store $store, UploadedFile $file): StoreMedia
    {
        return DB::transaction(function () use ($store, $file) {
            $oldCover = $store->cover;

            $media = $this->storeFile($store, $file, StoreMediaType::COVER);

            if ($oldCover) {
                $oldCover->delete();
            }

            $this->auditLogService->recordFromRequest(
                action: AuditAction::StoreCoverUploaded,
                subject: $store,
                metadata: ['media_public_id' => $media->public_id]
            );

            return $media;
        });
    }

    /**
     * Uploads gallery images ensuring the limit is not exceeded.
     */
    public function uploadGallery(Store $store, array $files): array
    {
        $limit = config('palverse.media.limits.store_gallery_limit', 10);
        $currentCount = $store->gallery()->count();

        if ($currentCount + count($files) > $limit) {
            throw new \Exception("Gallery limit of {$limit} images exceeded.");
        }

        return DB::transaction(function () use ($store, $files) {
            $uploadedMedia = [];
            $sortOrder = $store->gallery()->max('sort_order') ?? 0;

            foreach ($files as $file) {
                $sortOrder++;
                $media = $this->storeFile($store, $file, StoreMediaType::GALLERY, $sortOrder);
                $uploadedMedia[] = $media;
            }

            $this->auditLogService->recordFromRequest(
                action: AuditAction::StoreGalleryUploaded,
                subject: $store,
                metadata: ['uploaded_count' => count($uploadedMedia)]
            );

            return $uploadedMedia;
        });
    }

    /**
     * Deletes a specific media record safely.
     */
    public function deleteMedia(StoreMedia $media): void
    {
        DB::transaction(function () use ($media) {
            $media->delete();

            $action = match ($media->type) {
                StoreMediaType::LOGO->value => AuditAction::StoreLogoDeleted,
                StoreMediaType::COVER->value => AuditAction::StoreCoverDeleted,
                default => AuditAction::StoreGalleryDeleted,
            };

            $this->auditLogService->recordFromRequest(
                action: $action,
                subject: $media->store, // Need to ensure relation is loaded or available
                oldValues: ['media_public_id' => $media->public_id]
            );
        });
    }

    /**
     * Reorders gallery images.
     */
    public function reorderGallery(Store $store, array $items): void
    {
        DB::transaction(function () use ($store, $items) {
            foreach ($items as $item) {
                $store->gallery()
                    ->where('public_id', $item['media_public_id'])
                    ->update(['sort_order' => $item['sort_order']]);
            }

            $this->auditLogService->recordFromRequest(
                action: AuditAction::StoreGalleryReordered,
                subject: $store,
                metadata: ['items' => $items]
            );
        });
    }

    /**
     * Handles the physical file storage and database record creation.
     */
    private function storeFile(Store $store, UploadedFile $file, StoreMediaType $type, int $sortOrder = 0): StoreMedia
    {
        $disk = 'public'; // Defaulting to public for local MVP development
        $extension = $file->getClientOriginalExtension();
        $filename = Str::ulid().'.'.$extension;
        $path = "stores/{$store->public_id}/{$type->value}";

        $storedPath = $file->storeAs($path, $filename, $disk);

        if (! $storedPath) {
            throw new \Exception('File could not be stored.');
        }

        // Get dimensions if possible
        $width = null;
        $height = null;
        if (str_starts_with($file->getMimeType(), 'image/')) {
            $dimensions = @getimagesize($file->getRealPath());
            if ($dimensions) {
                $width = $dimensions[0];
                $height = $dimensions[1];
            }
        }

        return StoreMedia::create([
            'store_id' => $store->id,
            'type' => $type->value,
            'file_path' => $storedPath,
            'disk' => $disk,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
            'sort_order' => $sortOrder,
        ]);
    }
}
