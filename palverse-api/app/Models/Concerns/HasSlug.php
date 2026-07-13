<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Generates a unique slug for models that have a name_en / name_ar column.
 *
 * Strategy:
 *  1. Use name_en when available (transliterated to slug).
 *  2. Fall back to name_ar when name_en is absent.
 *  3. Append a numeric suffix when a conflict is detected.
 *
 * The slug is locked after first generation and never regenerated on updates.
 */
trait HasSlug
{
    protected static function bootHasSlug(): void
    {
        static::creating(function (self $model): void {
            if (blank($model->slug)) {
                $model->slug = static::generateUniqueSlug($model);
            }
        });
    }

    /**
     * Build a collision-free slug for the given model instance.
     */
    protected static function generateUniqueSlug(Model $model): string
    {
        $base = Str::slug(
            filled($model->name_en)
                ? $model->name_en
                : $model->name_ar
        );

        if (blank($base)) {
            $base = (string) Str::ulid();
        }

        $slug = $base;
        $counter = 1;

        while (
            static::withoutGlobalScopes()
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Allow callers to regenerate the slug explicitly (admin use only).
     */
    public function regenerateSlug(): void
    {
        $this->slug = static::generateUniqueSlug($this);
        $this->save();
    }
}
