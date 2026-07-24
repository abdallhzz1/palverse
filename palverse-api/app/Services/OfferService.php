<?php

namespace App\Services;

use App\Enums\AuditAction;
use App\Models\Offer;
use App\Models\Store;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OfferService
{
    public function __construct(protected AuditLogService $auditLogService) {}

    public function createOffer(Store $store, array $data, ?UploadedFile $image = null): Offer
    {
        return DB::transaction(function () use ($store, $data, $image) {
            if (! array_key_exists('is_active', $data) || $data['is_active'] === null) {
                $data['is_active'] = true;
            }

            $offer = new Offer($data);
            $offer->public_id = (string) Str::ulid();
            $offer->store_id = $store->id;

            if ($image) {
                $path = $image->store("stores/{$store->public_id}/offers/{$offer->public_id}", 'public');
                $offer->image_path = $path;
                $offer->image_disk = 'public';
            }

            $offer->save();

            $this->auditLogService->recordFromRequest(
                action: AuditAction::OfferCreated,
                subject: $offer,
                newValues: $data
            );

            return $offer->fresh() ?? $offer;
        });
    }

    public function updateOffer(Offer $offer, array $data, ?UploadedFile $image = null, bool $removeImage = false): Offer
    {
        return DB::transaction(function () use ($offer, $data, $image, $removeImage) {
            $oldValues = $offer->only(array_keys($data));
            $offer->fill($data);

            if ($image) {
                if ($offer->image_path) {
                    Storage::disk($offer->image_disk)->delete($offer->image_path);
                }

                $storePublicId = $offer->store->public_id;
                $path = $image->store("stores/{$storePublicId}/offers/{$offer->public_id}", 'public');

                $offer->image_path = $path;
                $offer->image_disk = 'public';
            } elseif ($removeImage && $offer->image_path) {
                Storage::disk($offer->image_disk)->delete($offer->image_path);
                $offer->image_path = null;
            }

            $offer->save();

            $this->auditLogService->recordFromRequest(
                action: AuditAction::OfferUpdated,
                subject: $offer,
                oldValues: $oldValues,
                newValues: $data
            );

            return $offer;
        });
    }

    public function deleteOffer(Offer $offer): bool
    {
        return DB::transaction(function () use ($offer) {
            if ($offer->image_path) {
                $disk = $offer->image_disk ?: 'public';
                try {
                    Storage::disk($disk)->delete($offer->image_path);
                } catch (\Throwable $e) {
                    // Do not block soft-delete if the file is already missing on disk.
                    report($e);
                }
            }

            $deleted = $offer->delete();

            if ($deleted) {
                $this->auditLogService->recordFromRequest(
                    action: AuditAction::OfferDeleted,
                    subject: $offer
                );
            }

            return (bool) $deleted;
        });
    }
}
