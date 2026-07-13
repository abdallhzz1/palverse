<?php

namespace App\Http\Requests\Api\V1\Admin\Category;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
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
        $publicId = $this->route('publicId');
        $category = Category::where('public_id', $publicId)->first();

        return [
            'name_ar' => [
                'sometimes',
                'required',
                'string',
                'max:191',
                Rule::unique('categories', 'name_ar')->ignore($category?->id),
            ],
            'name_en' => [
                'sometimes',
                'nullable',
                'string',
                'max:191',
                Rule::unique('categories', 'name_en')->ignore($category?->id),
            ],
        ];
    }
}
