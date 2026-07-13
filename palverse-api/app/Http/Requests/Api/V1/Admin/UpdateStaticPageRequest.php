<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Models\StaticPage;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateStaticPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('settings.manage');
    }

    public function rules(): array
    {
        $page = StaticPage::where('public_id', $this->route('publicId'))->first();
        $id = $page ? $page->id : 'NULL';

        return [
            'slug' => ['sometimes', 'required', 'string', 'max:180', "unique:static_pages,slug,{$id}", 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'title_ar' => ['sometimes', 'required', 'string', 'max:255'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'content_ar' => ['sometimes', 'required', 'string'],
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
        ];
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
