<?php

namespace App\Http\Requests\Api\V1\Merchant;

use App\Models\Offer;
use App\Models\Store;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $allowedMimes = implode(',', config('palverse.offers.allowed_image_mimes', ['jpeg', 'png', 'webp', 'jpg']));
        $maxKb = config('palverse.offers.limits.offer_image_max_kb', 4096);

        return [
            'title_ar' => ['sometimes', 'required', 'string', 'max:180'],
            'title_en' => ['sometimes', 'nullable', 'string', 'max:180'],
            'description_ar' => ['sometimes', 'nullable', 'string'],
            'description_en' => ['sometimes', 'nullable', 'string'],
            'price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'old_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'nullable', 'string', 'size:3'],
            'starts_at' => ['sometimes', 'nullable', 'date'],
            'ends_at' => ['sometimes', 'nullable', 'date'], // We will handle 'after' in withValidator because starts_at might not be in request
            'is_active' => ['sometimes', 'nullable', 'boolean'],
            'sort_order' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'image' => ['sometimes', 'nullable', 'image', 'mimes:'.$allowedMimes, 'max:'.$maxKb],
            'remove_image' => ['sometimes', 'nullable', 'boolean'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $offerPublicId = $this->route('offerPublicId');
            $storePublicId = $this->route('publicId');

            $store = Store::where('public_id', $storePublicId)->first();
            if (! $store) {
                throw new HttpResponseException(response()->json([
                    'success' => false,
                    'message' => __('المتجر غير موجود أو غير متاح.'),
                    'error' => [
                        'code' => 'RESOURCE_NOT_FOUND',
                        'details' => [],
                    ],
                ], 404));
            }

            $offer = Offer::where('public_id', $offerPublicId)->where('store_id', $store->id)->first();
            if (! $offer) {
                throw new HttpResponseException(response()->json([
                    'success' => false,
                    'message' => __('العرض غير موجود.'),
                    'error' => [
                        'code' => 'RESOURCE_NOT_FOUND',
                        'details' => [],
                    ],
                ], 404));
            }

            $price = $this->has('price') ? $this->input('price') : $offer->price;
            $oldPrice = $this->has('old_price') ? $this->input('old_price') : $offer->old_price;

            if ($price !== null && $oldPrice !== null && (float) $oldPrice < (float) $price) {
                $validator->errors()->add('old_price', __('The old price must be greater than or equal to the current price.'));
            }

            $startsAt = $this->has('starts_at') ? $this->input('starts_at') : $offer->starts_at;
            $endsAt = $this->has('ends_at') ? $this->input('ends_at') : $offer->ends_at;

            if ($startsAt && $endsAt && strtotime($endsAt) <= strtotime($startsAt)) {
                $validator->errors()->add('ends_at', __('The ends at must be a date after starts at.'));
            }
        });
    }

    protected function prepareForValidation()
    {
        if ($this->has('currency')) {
            $this->merge([
                'currency' => strtoupper($this->currency),
            ]);
        }
    }
}
