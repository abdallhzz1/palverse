<?php

namespace App\Http\Requests\Api\V1\Merchant\Media;

use Illuminate\Foundation\Http\FormRequest;

class UploadStoreLogoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorized in controller via Policy
    }

    public function rules(): array
    {
        $maxSize = config('palverse.media.limits.store_logo_max_kb', 4096);
        $mimes = implode(',', config('palverse.media.allowed_image_mimes', ['jpeg', 'png', 'webp', 'jpg']));

        return [
            'file' => [
                'required',
                'image',
                "mimes:{$mimes}",
                "max:{$maxSize}",
            ],
        ];
    }
}
