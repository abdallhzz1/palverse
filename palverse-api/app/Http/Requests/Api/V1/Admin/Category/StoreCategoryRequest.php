<?php

namespace App\Http\Requests\Api\V1\Admin\Category;

use App\Enums\CategoryIcon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('categories.manage') ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name_ar' => ['required', 'string', 'max:191', 'unique:categories,name_ar'],
            'name_en' => ['nullable', 'string', 'max:191', 'unique:categories,name_en'],
            'slug' => [
                'nullable',
                'string',
                'max:191',
                'unique:categories,slug',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            ],
            'icon' => ['nullable', 'string', 'max:100', Rule::in(CategoryIcon::values())],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->slug) && $this->slug !== '') {
            $this->merge(['slug' => mb_strtolower(trim($this->slug))]);
        } else {
            $this->merge(['slug' => null]);
        }

        if ($this->icon === '' || $this->icon === null) {
            $this->merge(['icon' => null]);
        }
    }
}
