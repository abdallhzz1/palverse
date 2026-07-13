<?php

namespace App\Http\Requests\Api\V1\Merchant;

use Illuminate\Foundation\Http\FormRequest;

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
        if ($this->has('currency')) {
            $this->merge([
                'currency' => strtoupper($this->currency),
            ]);
        }
    }
}
