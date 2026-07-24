<?php

namespace App\Http\Requests\Api\V1\Merchant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;

class StoreOfferRequest extends FormRequest
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
            'title_ar' => ['required', 'string', 'max:180'],
            'title_en' => ['nullable', 'string', 'max:180'],
            'description_ar' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'old_price' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'mimes:'.$allowedMimes, 'max:'.$maxKb],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $price = $this->input('price');
            $oldPrice = $this->input('old_price');

            if ($price !== null && $oldPrice !== null && (float) $oldPrice < (float) $price) {
                $validator->errors()->add('old_price', __('The old price must be greater than or equal to the current price.'));
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

    /**
     * Interpret admin/browser datetime-local values in Palestine time, store as UTC.
     */
    private function parseBusinessDateTime(string $value, bool $endOfDayIfDateOnly = false): ?string
    {
        $value = trim(str_replace('T', ' ', $value));
        if ($value === '') {
            return null;
        }

        $tz = (string) config('palverse.business_timezone', 'Asia/Hebron');

        try {
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
                $carbon = Carbon::parse($value, $tz);
                if ($endOfDayIfDateOnly) {
                    $carbon->endOfDay();
                } else {
                    $carbon->startOfDay();
                }
            } else {
                $carbon = Carbon::parse($value, $tz);
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
