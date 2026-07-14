<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class SystemController extends Controller
{
    /**
     * Liveness check (lightweight)
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'System is healthy.',
            'data' => [
                'status' => 'healthy',
                'timestamp' => now()->toIso8601String(),
                'version' => env('PALVERSE_API_VERSION', '1.0.0'),
            ],
            'meta' => [],
        ]);
    }

    /**
     * Readiness check (checks dependencies)
     */
    public function ready(): JsonResponse
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'storage' => $this->checkStorage(),
        ];

        $isReady = ! in_array(false, $checks, true);

        if (! $isReady) {
            return response()->json([
                'success' => false,
                'message' => 'System is not ready.',
                'error' => [
                    'code' => 'SERVICE_UNAVAILABLE',
                    'details' => $checks,
                ],
            ], 503);
        }

        return response()->json([
            'success' => true,
            'message' => 'System is ready.',
            'data' => [
                'status' => 'ready',
                'checks' => $checks,
                'timestamp' => now()->toIso8601String(),
                'version' => env('PALVERSE_API_VERSION', '1.0.0'),
            ],
            'meta' => [],
        ]);
    }

    protected function checkDatabase(): bool
    {
        try {
            DB::connection()->getPdo();

            return true;
        } catch (Throwable $e) {
            return false;
        }
    }

    protected function checkCache(): bool
    {
        try {
            $key = 'palverse.health_check';
            Cache::put($key, 'ok', 10);

            return Cache::get($key) === 'ok';
        } catch (Throwable $e) {
            return false;
        }
    }

    protected function checkStorage(): bool
    {
        try {
            // Only check if the disk is resolvable and accessible, don't write
            $disk = config('filesystems.default');
            // Check if the disk directory exists or can be resolved
            Storage::disk($disk)->exists('/');

            return true;
        } catch (Throwable $e) {
            return false;
        }
    }
}
