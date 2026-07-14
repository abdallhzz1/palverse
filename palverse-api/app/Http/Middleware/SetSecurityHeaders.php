<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Appends security-hardening HTTP headers to every API response.
 *
 * These headers protect against common browser-based attacks.
 * They are safe to include on JSON API responses and do not
 * affect non-browser clients (mobile apps, servers).
 */
class SetSecurityHeaders
{
    /**
     * @var array<string, string>
     */
    private array $headers = [
        // Prevent MIME-type sniffing
        'X-Content-Type-Options' => 'nosniff',
        // Block clickjacking
        'X-Frame-Options' => 'DENY',
        // Disable legacy XSS auditor (deprecated but harmless)
        'X-XSS-Protection' => '0',
        // Restrict Referer header leakage
        'Referrer-Policy' => 'strict-origin-when-cross-origin',
        // Disallow browser features not needed by a JSON API
        'Permissions-Policy' => 'camera=(), microphone=(), geolocation=(), payment=()',
        // Force HTTPS for 1 year (enable once TLS is confirmed)
        // 'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains',
        // Remove the X-Powered-By header set by PHP
        'X-Powered-By' => '',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        foreach ($this->headers as $header => $value) {
            if ($value === '') {
                // Setting an empty value effectively removes the header
                $response->headers->remove($header);
            } else {
                $response->headers->set($header, $value);
            }
        }

        return $response;
    }
}
