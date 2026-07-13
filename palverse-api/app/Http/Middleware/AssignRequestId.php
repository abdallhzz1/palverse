<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AssignRequestId
{
    public function handle(Request $request, Closure $next): Response
    {
        $requestId = $request->header('X-Request-ID');

        // Validate safe header or generate new ULID
        if (blank($requestId) || strlen($requestId) > 100 || ! preg_match('/^[a-zA-Z0-9\-\_\.]+$/', $requestId)) {
            $requestId = (string) Str::ulid();
        }

        // Make available in request attributes for services
        $request->attributes->set('request_id', $requestId);

        $response = $next($request);

        // Append to response
        $response->headers->set('X-Request-ID', $requestId);

        return $response;
    }
}
