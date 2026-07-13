<?php

namespace App\Http\Requests\Api\V1\Admin\Store;

use Illuminate\Foundation\Http\FormRequest;

class RejectStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('stores.reject') ?? false;
    }

    public function rules(): array
    {
        return [
            'rejection_reason' => ['required', 'string', 'min:3', 'max:2000'],
        ];
    }
}
