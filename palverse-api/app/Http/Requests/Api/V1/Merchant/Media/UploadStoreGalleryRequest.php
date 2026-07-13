<?php

namespace App\Http\Requests\Api\V1\Merchant\Media;

use Illuminate\Foundation\Http\FormRequest;

class UploadStoreGalleryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $maxSize = config('palverse.media.limits.store_gallery_image_max_kb', 4096);
        $mimes = implode(',', config('palverse.media.allowed_image_mimes', ['jpeg', 'png', 'webp', 'jpg']));

        return [
            'files' => ['required', 'array', 'min:1'],
            'files.*' => [
                'required',
                'image',
                "mimes:{$mimes}",
                "max:{$maxSize}",
            ],
        ];
    }
}
