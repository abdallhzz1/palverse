<?php

namespace App\Http\Requests\Concerns;

trait NormalizesBooleanQueryParams
{
    /**
     * Normalize query-string boolean values ("true"/"false") before Laravel's boolean rule.
     *
     * @param  list<string>  $keys
     */
    protected function normalizeBooleanQueryParams(array $keys): void
    {
        foreach ($keys as $key) {
            if (! $this->exists($key)) {
                continue;
            }

            $value = $this->input($key);
            if (! is_string($value)) {
                continue;
            }

            $normalized = strtolower(trim($value));
            if (in_array($normalized, ['true', '1', 'yes', 'on'], true)) {
                $this->merge([$key => true]);
            } elseif (in_array($normalized, ['false', '0', 'no', 'off'], true)) {
                $this->merge([$key => false]);
            }
        }
    }
}
