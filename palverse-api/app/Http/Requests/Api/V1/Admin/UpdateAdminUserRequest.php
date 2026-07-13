<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdminUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // $this->user passed in route is actually a public_id string since we bind manually or via controller.
        // Wait, route model binding is likely used or we fetch it in the controller.
        // We will ignore unique by the public_id provided in the route.
        // The user ID for unique exclusion will be looked up in the controller,
        // so to keep request simple we will use a custom rule in the controller or pass the actual ID.
        // Alternatively, if route model binding resolves `publicId` to User, we can do $this->route('publicId')->id.
        // Assuming route parameter is named `publicId` and it's just a string, we can't easily resolve the ID here without querying.
        // We will use a unique rule that ignores by public_id instead of id!

        $publicId = $this->route('publicId');

        return [
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($publicId, 'public_id')],
            'phone' => ['nullable', 'string', 'max:30', Rule::unique('users', 'phone')->ignore($publicId, 'public_id')],
            'preferred_locale' => ['nullable', 'string', Rule::in(['ar', 'en'])],
        ];
    }
}
