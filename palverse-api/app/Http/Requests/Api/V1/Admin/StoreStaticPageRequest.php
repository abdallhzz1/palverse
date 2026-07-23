<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Enums\StaticPageType;
use App\Support\StaticPageMeta;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreStaticPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('settings.manage');
    }

    public function rules(): array
    {
        return [
            'slug' => ['required', 'string', 'max:180', 'unique:static_pages,slug', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'page_type' => ['nullable', 'string', Rule::in(StaticPageType::values())],
            'title_ar' => ['required', 'string', 'max:255'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'content_ar' => ['required', 'string'],
            'content_en' => ['nullable', 'string'],
            'excerpt_ar' => ['nullable', 'string'],
            'excerpt_en' => ['nullable', 'string'],
            'is_published' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'seo_title_ar' => ['nullable', 'string', 'max:255'],
            'seo_title_en' => ['nullable', 'string', 'max:255'],
            'seo_description_ar' => ['nullable', 'string', 'max:1000'],
            'seo_description_en' => ['nullable', 'string', 'max:1000'],
            'meta' => ['nullable', 'array'],
            'meta.*' => ['nullable'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $slug = is_string($this->slug) ? mb_strtolower(trim($this->slug)) : $this->slug;
        $pageType = $this->input('page_type');

        if ((! is_string($pageType) || $pageType === '') && in_array($slug, ['contact', 'contact-us'], true)) {
            $pageType = StaticPageType::Contact->value;
        }

        if (! is_string($pageType) || $pageType === '') {
            $pageType = StaticPageType::Content->value;
        }

        $this->merge([
            'slug' => $slug,
            'page_type' => $pageType,
        ]);
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (! $this->exists('meta') || ! is_array($this->input('meta'))) {
                return;
            }

            $allowed = array_flip(StaticPageMeta::allowedKeys());
            foreach (array_keys($this->input('meta')) as $key) {
                if (! isset($allowed[$key])) {
                    $validator->errors()->add('meta', "مفتاح غير مسموح في meta: {$key}");
                }
            }
        });
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => __('Validation failed.'),
            'errors' => $validator->errors(),
        ], 422));
    }
}
