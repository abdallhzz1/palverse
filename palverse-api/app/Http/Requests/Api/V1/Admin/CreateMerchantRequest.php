<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Support\PasswordRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateMerchantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30', 'unique:users,phone'],
            'preferred_locale' => ['nullable', 'string', Rule::in(['ar', 'en'])],
            'password' => ['required', 'string', 'confirmed', PasswordRules::default()],
        ];
    }
}
