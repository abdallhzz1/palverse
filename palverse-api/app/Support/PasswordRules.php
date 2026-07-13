<?php

namespace App\Support;

use Illuminate\Validation\Rules\Password;

/**
 * Centralized password rule factory for Palverse.
 *
 * Applied consistently in:
 *  - Public merchant registration
 *  - Admin merchant creation
 *  - Admin password reset
 *  - Self-service password reset
 */
final class PasswordRules
{
    /**
     * Returns the standard Palverse password rule.
     *
     * Requirements:
     *  - Minimum 10 characters
     *  - At least one letter (upper and lower case)
     *  - At least one number
     */
    public static function default(): Password
    {
        return Password::min(10)
            ->letters()
            ->mixedCase()
            ->numbers();
    }
}
