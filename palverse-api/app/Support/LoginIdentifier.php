<?php

namespace App\Support;

use App\Models\User;

class LoginIdentifier
{
    /**
     * Resolve a user by email or phone (Palestinian number variants supported).
     */
    public static function findUser(string $identifier): ?User
    {
        $identifier = trim($identifier);
        if ($identifier === '') {
            return null;
        }

        if (str_contains($identifier, '@')) {
            return User::query()
                ->where('email', mb_strtolower($identifier))
                ->first();
        }

        $variants = self::phoneVariants($identifier);

        return User::query()
            ->where(function ($query) use ($variants) {
                foreach ($variants as $variant) {
                    $query->orWhere('phone', $variant);
                }
            })
            ->first();
    }

    /**
     * Normalize a Palestinian mobile to local 05XXXXXXXX form when possible.
     */
    public static function normalizePhone(?string $phone): ?string
    {
        if ($phone === null) {
            return null;
        }

        $trimmed = trim($phone);
        if ($trimmed === '') {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $trimmed) ?: '';

        if (str_starts_with($digits, '970') && strlen($digits) >= 12) {
            return '0'.substr($digits, 3);
        }

        if (str_starts_with($digits, '0') && strlen($digits) === 10) {
            return $digits;
        }

        if (strlen($digits) === 9 && str_starts_with($digits, '5')) {
            return '0'.$digits;
        }

        return $trimmed;
    }

    /**
     * @return list<string>
     */
    public static function phoneVariants(string $phone): array
    {
        $raw = trim($phone);
        $digits = preg_replace('/\D+/', '', $raw) ?: '';
        $variants = array_filter([$raw, $digits, self::normalizePhone($raw)]);

        if (str_starts_with($digits, '970') && strlen($digits) >= 12) {
            $local = '0'.substr($digits, 3);
            $variants[] = $local;
            $variants[] = substr($digits, 3);
            $variants[] = '+'.$digits;
        }

        if (str_starts_with($digits, '0') && strlen($digits) === 10) {
            $variants[] = '970'.substr($digits, 1);
            $variants[] = '+970'.substr($digits, 1);
            $variants[] = substr($digits, 1);
        }

        if (strlen($digits) === 9 && str_starts_with($digits, '5')) {
            $variants[] = '0'.$digits;
            $variants[] = '970'.$digits;
            $variants[] = '+970'.$digits;
        }

        return array_values(array_unique(array_filter($variants)));
    }
}
