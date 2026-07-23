<?php

namespace App\Http\Requests\Api\V1\Shared;

use App\Models\MerchantJoinRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMerchantJoinRequestStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var MerchantJoinRequest|null $joinRequest */
        $joinRequest = $this->route('publicId')
            ? MerchantJoinRequest::query()->where('public_id', $this->route('publicId'))->first()
            : null;

        $isApproving = $this->input('status') === 'approved';

        return [
            'status' => ['required', 'in:new,contacted,approved,rejected'],
            'password' => ['required_if:status,approved', 'nullable', 'string', 'min:8'],
            'subscription_plan_id' => [
                'required_if:status,approved',
                'nullable',
                'string',
                Rule::exists('subscription_plans', 'public_id'),
            ],
            'email' => [
                Rule::requiredIf(fn () => $isApproving && blank($joinRequest?->email)),
                'nullable',
                'email',
                'max:255',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'البريد الإلكتروني مطلوب للموافقة لأن الطلب لا يحتوي على بريد.',
            'password.required_if' => 'كلمة المرور مطلوبة عند الموافقة.',
            'subscription_plan_id.required_if' => 'اختيار الباقة مطلوب عند الموافقة.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('email') && is_string($this->email) && trim($this->email) === '') {
            $this->merge(['email' => null]);
        }
    }
}
