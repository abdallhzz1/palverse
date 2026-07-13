<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Support\PasswordRules;
use Illuminate\Foundation\Http\FormRequest;

class AdminResetUserPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'password' => ['required', 'string', 'confirmed', PasswordRules::default()],
            'revoke_tokens' => ['nullable', 'boolean'],
        ];
    }
}
