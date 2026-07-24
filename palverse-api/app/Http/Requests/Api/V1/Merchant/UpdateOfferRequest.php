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
        $merge = [];

        if ($this->has('currency') && $this->input('currency') !== null) {
            $merge['currency'] = strtoupper((string) $this->input('currency'));
        }

        if ($this->has('is_active')) {
            $raw = $this->input('is_active');
            if (is_string($raw)) {
                $merge['is_active'] = in_array(strtolower($raw), ['1', 'true', 'on', 'yes'], true);
            }
        }

        foreach (['starts_at', 'ends_at'] as $field) {
            if (! $this->filled($field)) {
                continue;
            }

            $parsed = $this->parseBusinessDateTime((string) $this->input($field), $field === 'ends_at');
            if ($parsed) {
                $merge[$field] = $parsed;
            }
        }

        if ($merge !== []) {
            $this->merge($merge);
        }
    }

    private function parseBusinessDateTime(string $value, bool $endOfDayIfDateOnly = false): ?string
    {
        $value = trim(str_replace('T', ' ', $value));
        if ($value === '') {
            return null;
        }

        $tz = (string) config('palverse.business_timezone', 'Asia/Hebron');

        try {
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
                $carbon = \Illuminate\Support\Carbon::parse($value, $tz);
                if ($endOfDayIfDateOnly) {
                    $carbon->endOfDay();
                } else {
                    $carbon->startOfDay();
                }
            } else {
                $carbon = \Illuminate\Support\Carbon::parse($value, $tz);
                if ($endOfDayIfDateOnly && str_ends_with($value, '00:00')) {
                    $carbon->endOfDay();
                }
            }

            return $carbon->utc()->toDateTimeString();
        } catch (\Throwable) {
            return null;
        }
    }
}
