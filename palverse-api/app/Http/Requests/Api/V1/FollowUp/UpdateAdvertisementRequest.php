<?php

namespace App\Http\Requests\Api\V1\FollowUp;

use App\Enums\AdPlacement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdvertisementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_public_id' => ['sometimes', 'string', 'exists:stores,public_id'],
            'ad_type' => ['sometimes', 'in:featured_store,banner'],
            'placement' => [
                'nullable',
                'string',
                Rule::in(AdPlacement::values()),
            ],
            'image' => ['nullable', 'image', 'max:10240'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date'],
            'amount_paid' => ['sometimes', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $start = $this->input('start_date');
            $end = $this->input('end_date');
            if ($start && $end && $end < $start) {
                $validator->errors()->add('end_date', 'تاريخ النهاية يجب أن يساوي أو يلي تاريخ البداية.');
            }

            $adType = $this->input('ad_type');
            if ($adType === 'banner' && blank($this->input('placement'))) {
                // placement may already exist on the model; only enforce when ad_type is being set to banner without placement
                // Controller will validate final state.
            }
            if ($adType === 'featured_store' && filled($this->input('placement'))) {
                $validator->errors()->add('placement', 'إبراز المتجر لا يحتاج موضع بنر.');
            }
        });
    }
}
