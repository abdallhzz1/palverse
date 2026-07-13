<?php

namespace App\Services;

use App\Models\Offer;
use App\Models\Store;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OfferService
{
    public function createOffer(Store $store, array $data, ?UploadedFile $image = null): Offer
    {
        return DB::transaction(function () use ($store, $data, $image) {
            $offer = new Offer($data);
            $offer->public_id = (string) Str::ulid();
            $offer->store_id = $store->id;

            if ($image) {
                $path = $image->store("stores/{$store->public_id}/offers/{$offer->public_id}", 'public');
                $offer->image_path = $path;
                $offer->image_disk = 'public';
            }

            $offer->save();

            return $offer;
        });
    }

    public function updateOffer(Offer $offer, array $data, ?UploadedFile $image = null, bool $removeImage = false): Offer
    {
        return DB::transaction(function () use ($offer, $data, $image, $removeImage) {
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

            return $offer;
        });
    }

    public function deleteOffer(Offer $offer): bool
    {
        return DB::transaction(function () use ($offer) {
            if ($offer->image_path) {
                // Delete physical image file but keep path in DB for history
                Storage::disk($offer->image_disk)->delete($offer->image_path);
            }

            return $offer->delete();
        });
    }
}
