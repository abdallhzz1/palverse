<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Models\SubscriptionPlan;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSubscriptionPlanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name_ar' => ['sometimes', 'required', 'string', 'max:180'],
            'name_en' => ['sometimes', 'nullable', 'string', 'max:180'],
            'code' => ['sometimes', 'required', 'string', 'max:100'],
            'description_ar' => ['sometimes', 'nullable', 'string'],
            'description_en' => ['sometimes', 'nullable', 'string'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'nullable', 'string', 'size:3'],
            'duration_days' => ['sometimes', 'required', 'integer', 'min:1'],
            'max_offers' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'max_gallery_images' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'nullable', 'boolean'],
            'sort_order' => ['sometimes', 'nullable', 'integer', 'min:0'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->has('code')) {
                $publicId = $this->route('publicId');
                $plan = SubscriptionPlan::where('public_id', $publicId)->first();
                $exists = SubscriptionPlan::where('code', $this->input('code'))
                    ->where('id', '!=', $plan?->id)
                    ->exists();
                if ($exists) {
                    $validator->errors()->add('code', __('The code has already been taken.'));
                }
            }
        });
    }
}
