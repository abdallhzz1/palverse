<?php

namespace App\Http\Requests\Api\V1\Auth;

use App\Support\PasswordRules;
use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Public endpoint – no auth required
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->email)) {
            $this->merge([
                'email' => mb_strtolower(trim($this->email)),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', PasswordRules::default()],
            'password_confirmation' => ['required', 'string'],
        ];
    }
}
