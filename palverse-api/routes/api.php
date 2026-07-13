<?php

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', function (): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => 'Palverse API is running.',
            'data' => [
                'service' => 'palverse-api',
                'status' => 'healthy',
                'timestamp' => now()->toIso8601String(),
            ],
            'meta' => [],
        ]);
    });
});
