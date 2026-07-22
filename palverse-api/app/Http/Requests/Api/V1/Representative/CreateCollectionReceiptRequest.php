<?php

namespace App\Http\Requests\Api\V1\Representative;

use Illuminate\Foundation\Http\FormRequest;

class CreateCollectionReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_public_id' => ['nullable', 'string', 'exists:stores,public_id'],
            'store_registration_request_public_id' => ['nullable', 'string', 'exists:store_registration_requests,public_id'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
            'currency' => ['required', 'string', 'in:ILS,USD,JOD'],
            'payment_purpose' => ['required', 'string', 'in:subscription,registration_fee,other'],
            'collected_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if (!$this->filled('store_public_id') && !$this->filled('store_registration_request_public_id')) {
                $validator->errors()->add('store_public_id', 'يجب تحديد المتجر أو طلب التسجيل.');
            }
        });
    }
}
