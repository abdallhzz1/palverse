<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\UserStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminUserIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'query' => ['nullable', 'string', 'max:150'],
            'status' => ['nullable', Rule::enum(UserStatus::class)],
            'role' => ['nullable', 'string', Rule::exists('roles', 'name')],
            'email_verified' => ['nullable', 'boolean'],
            'has_stores' => ['nullable', 'boolean'],
            'created_from' => ['nullable', 'date'],
            'created_to' => ['nullable', 'date', 'after_or_equal:created_from'],
            'sort' => ['nullable', 'string', Rule::in(['newest', 'oldest', 'name', 'email', 'last_login'])],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
