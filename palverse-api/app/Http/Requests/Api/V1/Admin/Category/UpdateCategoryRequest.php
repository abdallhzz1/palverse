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
            'icon' => [
                'nullable',
                'string',
                'max:50',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->exists('icon')) {
            return;
        }

        $this->merge([
            'icon' => $this->normalizeIcon($this->input('icon')),
        ]);
    }

    private function normalizeIcon(mixed $icon): ?string
    {
        if (! is_string($icon) || trim($icon) === '') {
            return null;
        }

        $normalized = mb_strtolower(trim($icon));

        $aliases = [
            'grid' => 'layout-grid',
            'restaurant' => 'utensils',
            'cafe' => 'coffee',
            'shopping' => 'shopping-bag',
            'tech' => 'smartphone',
            'home' => 'house',
            'services' => 'wrench',
            'health' => 'heart-pulse',
            'education' => 'book-open',
            'automotive' => 'car',
            'groceries' => 'apple',
            'gifts' => 'gift',
            'crafts' => 'scissors',
        ];

        return $aliases[$normalized] ?? $normalized;
    }
}
