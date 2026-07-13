<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

/**
 * Automatically assigns a ULID public_id when a model is created.
 *
 * The public_id is the external identifier exposed in API responses.
 * Internal integer IDs are never serialized or returned.
 */
trait HasPublicId
{
    protected static function bootHasPublicId(): void
    {
        static::creating(function (self $model): void {
            if (blank($model->public_id)) {
                $model->public_id = (string) Str::ulid();
            }
        });
    }
}
