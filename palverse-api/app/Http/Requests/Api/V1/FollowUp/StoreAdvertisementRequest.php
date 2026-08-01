<?php

namespace App\Http\Requests\Api\V1\FollowUp;

use App\Enums\AdPlacement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdvertisementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_public_id' => ['required', 'string', 'exists:stores,public_id'],
            'ad_type' => ['required', 'in:featured_store,banner'],
            'placement' => [
                'nullable',
                'string',
                Rule::requiredIf(fn () => $this->input('ad_type') === 'banner'),
                Rule::in(AdPlacement::values()),
                Rule::prohibitedIf(fn () => $this->input('ad_type') === 'featured_store'),
            ],
            'image' => ['nullable', 'image', 'max:10240', 'required_if:ad_type,banner'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'image.required_if' => 'يجب رفع صورة للبنر الإعلاني.',
            'placement.required' => 'اختر موضع البنر على الموقع والمقاس المناسب له.',
            'placement.prohibited' => 'إبراز المتجر لا يحتاج موضع بنر؛ يظهر كبطاقة ممولة.',
            'end_date.after_or_equal' => 'تاريخ النهاية يجب أن يساوي أو يلي تاريخ البداية.',
        ];
    }
}
