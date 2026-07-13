<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SuspendUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'suspension_reason' => ['required', 'string', 'min:3', 'max:2000'],
            'revoke_tokens' => ['nullable', 'boolean'],
        ];
    }
}
