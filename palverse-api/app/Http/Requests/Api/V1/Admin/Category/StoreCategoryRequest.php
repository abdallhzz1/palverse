<?php

namespace App\Http\Requests\Api\V1\Admin\Category;

use Illuminate\Foundation\Http\FormRequest;

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
            // Lucide icon name in kebab-case (e.g. shopping-bag, heart-pulse)
            'icon' => ['nullable', 'string', 'max:50', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->slug) && $this->slug !== '') {
            $this->merge(['slug' => mb_strtolower(trim($this->slug))]);
        } else {
            $this->merge(['slug' => null]);
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
