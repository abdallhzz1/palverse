<?php

namespace App\Http\Requests\Api\V1\Merchant\Media;

use Illuminate\Foundation\Http\FormRequest;

class ReorderStoreGalleryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.media_public_id' => ['required', 'string', 'distinct'],
            'items.*.sort_order' => ['required', 'integer', 'min:0', 'distinct'],
        ];
    }
}
