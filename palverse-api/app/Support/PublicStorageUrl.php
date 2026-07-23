<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PublicStorageUrl
{
    /**
     * Build a public URL for a path on the public disk.
     */
    public static function fromPath(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        return Storage::disk('public')->url(ltrim($path, '/'));
    }

    /**
     * Normalize a stored avatar value (relative path or absolute URL) to a disk path.
     */
    public static function toPath(?string $value): ?string
    {
        if (blank($value)) {
            return null;
        }

        $value = trim($value);

        if (! str_starts_with($value, 'http://') && ! str_starts_with($value, 'https://')) {
            return ltrim(Str::after($value, 'storage/'), '/');
        }

        $path = parse_url($value, PHP_URL_PATH);

        if (! is_string($path) || $path === '') {
            return null;
        }

        if (str_contains($path, '/storage/')) {
            return ltrim(Str::after($path, '/storage/'), '/');
        }

        return ltrim($path, '/');
    }

    /**
     * Resolve a stored value to a browser-usable absolute URL.
     */
    public static function resolve(?string $value): ?string
    {
        if (blank($value)) {
            return null;
        }

        $path = self::toPath($value);

        return $path ? self::fromPath($path) : $value;
    }
}
