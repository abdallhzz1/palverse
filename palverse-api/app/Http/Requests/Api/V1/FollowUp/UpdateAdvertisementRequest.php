<?php

namespace App\Http\Requests\Api\V1\FollowUp;

use Illuminate\Foundation\Http\FormRequest;

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
        });
    }
}
