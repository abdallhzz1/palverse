<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdminStoreSubscriptionIndexRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'status' => ['nullable', 'string', 'in:pending,active,expired,cancelled'],
            'store_public_id' => ['nullable', 'string', 'exists:stores,public_id'],
            'plan_public_id' => ['nullable', 'string', 'exists:subscription_plans,public_id'],
            'starts_from' => ['nullable', 'date'],
            'starts_to' => ['nullable', 'date'],
            'ends_from' => ['nullable', 'date'],
            'ends_to' => ['nullable', 'date'],
            'sort' => ['nullable', 'string', 'in:created_at,starts_at,ends_at'],
            'direction' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }
}
