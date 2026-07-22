<?php

namespace App\Http\Middleware;

use App\Enums\UserStatus;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->status !== UserStatus::Active) {
            return response()->json([
                'success' => false,
                'message' => 'حسابك غير نشط. يرجى التواصل مع الدعم.',
                'error' => [
                    'code' => 'ACCOUNT_INACTIVE',
                    'details' => [],
                ],
            ], 403);
        }

        return $next($request);
    }
}
