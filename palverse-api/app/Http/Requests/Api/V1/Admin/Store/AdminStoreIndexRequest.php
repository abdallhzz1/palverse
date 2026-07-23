<?php

namespace App\Http\Requests\Api\V1\Admin\Store;

use App\Http\Requests\Concerns\NormalizesBooleanQueryParams;
use Illuminate\Foundation\Http\FormRequest;

class AdminStoreIndexRequest extends FormRequest
{
    use NormalizesBooleanQueryParams;

    public function authorize(): bool
    {
        return $this->user()?->can('stores.view') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->normalizeBooleanQueryParams(['is_active']);
    }

    public function rules(): array
    {
        return [
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'query' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:pending,approved,rejected'],
            'is_active' => ['nullable', 'boolean'],
            'owner_public_id' => ['nullable', 'string'],
            'category_public_id' => ['nullable', 'string'],
            'city_public_id' => ['nullable', 'string'],
            'zone_public_id' => ['nullable', 'string'],
            'sort' => ['nullable', 'string', 'in:created_at,name_ar,name_en,status'],
            'direction' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }
}
