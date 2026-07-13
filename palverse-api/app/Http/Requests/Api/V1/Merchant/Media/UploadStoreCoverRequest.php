<?php

namespace App\Http\Requests\Api\V1\Merchant\Media;

use Illuminate\Foundation\Http\FormRequest;

class UploadStoreCoverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $maxSize = config('palverse.media.limits.store_cover_max_kb', 6144);
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
