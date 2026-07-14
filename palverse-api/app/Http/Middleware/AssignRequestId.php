<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Assigns a stable correlation ID to every API request.
 *
 * Accepts a client-supplied X-Correlation-ID if it is safe (alphanumeric
 * with hyphens/underscores/dots, max 100 chars), otherwise generates a
 * new ULID. The ID is stored in request attributes for use by services
 * and is echoed back in the X-Correlation-ID response header so clients
 * can trace errors across distributed logs.
 */
class AssignRequestId
{
    public function handle(Request $request, Closure $next): Response
    {
        $correlationId = $request->header('X-Correlation-ID')
            ?? $request->header('X-Request-ID');

        // Validate safe header or generate a new ULID
        if (
            blank($correlationId)
            || strlen($correlationId) > 100
            || ! preg_match('/^[a-zA-Z0-9\-\_\.]+$/', $correlationId)
        ) {
            $correlationId = (string) Str::ulid();
        }

        // Make available throughout the request lifecycle
        $request->attributes->set('request_id', $correlationId);

        $response = $next($request);

        // Echo the correlation ID on every response
        $response->headers->set('X-Correlation-ID', $correlationId);

        return $response;
    }
}
