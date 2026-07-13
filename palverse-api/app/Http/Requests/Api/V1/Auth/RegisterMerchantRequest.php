<?php

namespace App\Http\Requests\Api\V1\Auth;

use App\Support\PasswordRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterMerchantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Public endpoint – no auth required
    }

    protected function prepareForValidation(): void
    {
        $merge = [];

        if (is_string($this->email)) {
            $merge['email'] = mb_strtolower(trim($this->email));
        }

        if (is_string($this->name)) {
            $merge['name'] = trim($this->name);
        }

        if (is_string($this->preferred_locale)) {
            $merge['preferred_locale'] = mb_strtolower(trim($this->preferred_locale));
        }

        if (! empty($merge)) {
            $this->merge($merge);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'confirmed', PasswordRules::default()],
            'password_confirmation' => ['required', 'string'],
            'preferred_locale' => ['nullable', 'string', Rule::in(['ar', 'en'])],
        ];
    }
}
