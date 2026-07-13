<?php

use App\Http\Controllers\Api\V1\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\CityController as AdminCityController;
use App\Http\Controllers\Api\V1\Admin\StoreController as AdminStoreController;
use App\Http\Controllers\Api\V1\Admin\ZoneController as AdminZoneController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Merchant\StoreController as MerchantStoreController;
use App\Http\Controllers\Api\V1\Public\CategoryController as PublicCategoryController;
use App\Http\Controllers\Api\V1\Public\CityController as PublicCityController;
use App\Http\Controllers\Api\V1\Public\StoreController as PublicStoreController;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {

    // ─── Health check ─────────────────────────────────────────────────────────
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

    // ─── Authentication ────────────────────────────────────────────────────────
    Route::prefix('auth')->group(function (): void {
        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:login');

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    // ─── Public endpoints (no authentication required) ─────────────────────────
    Route::prefix('categories')->group(function (): void {
        Route::get('/', [PublicCategoryController::class, 'index']);
        Route::get('/{slug}', [PublicCategoryController::class, 'show']);
    });

    Route::prefix('cities')->group(function (): void {
        Route::get('/', [PublicCityController::class, 'index']);
        Route::get('/{publicId}/zones', [PublicCityController::class, 'zones']);
    });

    Route::prefix('stores')->group(function (): void {
        Route::get('/', [PublicStoreController::class, 'index']);
        Route::get('/{slug}', [PublicStoreController::class, 'show']);
    });

    // ─── Merchant (Sanctum + merchant role/permissions required) ───────────────
    Route::prefix('merchant')
        ->middleware(['auth:sanctum']) // Role/permission is handled by Policies and route scopes
        ->group(function (): void {
            Route::prefix('stores')->group(function (): void {
                Route::get('/', [MerchantStoreController::class, 'index']);
                Route::post('/', [MerchantStoreController::class, 'store']);
                Route::get('/{publicId}', [MerchantStoreController::class, 'show']);
                Route::put('/{publicId}', [MerchantStoreController::class, 'update']);
                Route::get('/{publicId}/status', [MerchantStoreController::class, 'status']);
            });
        });

    // ─── Administration (Sanctum + admin role required) ────────────────────────
    Route::prefix('admin')
        ->middleware(['auth:sanctum', 'role:admin'])
        ->group(function (): void {

            // Categories
            Route::get('/categories', [AdminCategoryController::class, 'index']);
            Route::post('/categories', [AdminCategoryController::class, 'store']);
            Route::get('/categories/{publicId}', [AdminCategoryController::class, 'show']);
            Route::put('/categories/{publicId}', [AdminCategoryController::class, 'update']);
            Route::delete('/categories/{publicId}', [AdminCategoryController::class, 'destroy']);

            // Cities
            Route::get('/cities', [AdminCityController::class, 'index']);
            Route::post('/cities', [AdminCityController::class, 'store']);
            Route::get('/cities/{publicId}', [AdminCityController::class, 'show']);
            Route::put('/cities/{publicId}', [AdminCityController::class, 'update']);
            Route::delete('/cities/{publicId}', [AdminCityController::class, 'destroy']);
            Route::get('/cities/{publicId}/zones', [AdminCityController::class, 'zones']);

            // Zones
            Route::get('/zones', [AdminZoneController::class, 'index']);
            Route::post('/zones', [AdminZoneController::class, 'store']);
            Route::get('/zones/{publicId}', [AdminZoneController::class, 'show']);
            Route::put('/zones/{publicId}', [AdminZoneController::class, 'update']);
            Route::delete('/zones/{publicId}', [AdminZoneController::class, 'destroy']);

            // Stores
            Route::prefix('stores')->group(function (): void {
                Route::get('/', [AdminStoreController::class, 'index']);
                Route::get('/{publicId}', [AdminStoreController::class, 'show']);
                Route::patch('/{publicId}/approve', [AdminStoreController::class, 'approve']);
                Route::patch('/{publicId}/reject', [AdminStoreController::class, 'reject']);
                Route::patch('/{publicId}/activate', [AdminStoreController::class, 'activate']);
                Route::patch('/{publicId}/deactivate', [AdminStoreController::class, 'deactivate']);
            });
        });
});
