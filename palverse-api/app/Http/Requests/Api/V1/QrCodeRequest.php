<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class QrCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $min = config('palverse.qr.min_size', 128);
        $max = config('palverse.qr.max_size', 1024);

        return [
            'size' => ['nullable', 'integer', "between:{$min},{$max}"],
            'format' => ['nullable', 'string', 'in:svg,png,SVG,PNG'],
            'download' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Force standard JSON validation response even for image endpoints.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => __('Validation failed.'),
            'errors' => $validator->errors(),
        ], 422));
    }

    /**
     * Normalize format, size, and download flag before controller receives them.
     */
    protected function passedValidation(): void
    {
        $this->merge([
            'format' => $this->filled('format') ? strtolower($this->input('format')) : config('palverse.qr.default_format', 'svg'),
            'download' => $this->boolean('download'),
            'size' => $this->filled('size') ? (int) $this->input('size') : config('palverse.qr.default_size', 512),
        ]);
    }
}
