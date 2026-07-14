<?php

use App\Http\Controllers\Api\V1\Admin\AuditLogController;
use App\Http\Controllers\Api\V1\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\CityController as AdminCityController;
use App\Http\Controllers\Api\V1\Admin\StoreController as AdminStoreController;
use App\Http\Controllers\Api\V1\Admin\StoreSubscriptionController as AdminStoreSubscriptionController;
use App\Http\Controllers\Api\V1\Admin\SubscriptionPlanController as AdminSubscriptionPlanController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use App\Http\Controllers\Api\V1\Admin\ZoneController as AdminZoneController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\V1\Auth\RegisterMerchantController;
use App\Http\Controllers\Api\V1\Auth\ResetPasswordController;
use App\Http\Controllers\Api\V1\Auth\SessionController;
use App\Http\Controllers\Api\V1\Auth\VerificationController;
use App\Http\Controllers\Api\V1\Merchant\DashboardController;
use App\Http\Controllers\Api\V1\Merchant\OfferController;
use App\Http\Controllers\Api\V1\Merchant\StoreController as MerchantStoreController;
use App\Http\Controllers\Api\V1\Merchant\StoreMediaController;
use App\Http\Controllers\Api\V1\Merchant\StoreSocialLinkController;
use App\Http\Controllers\Api\V1\Merchant\StoreSubscriptionController as MerchantStoreSubscriptionController;
use App\Http\Controllers\Api\V1\Merchant\StoreWorkingHoursController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\Public\BootstrapController;
use App\Http\Controllers\Api\V1\Public\CategoryController as PublicCategoryController;
use App\Http\Controllers\Api\V1\Public\CityController as PublicCityController;
use App\Http\Controllers\Api\V1\Public\FaqController;
use App\Http\Controllers\Api\V1\Public\SearchSuggestionController;
use App\Http\Controllers\Api\V1\Public\StaticPageController;
use App\Http\Controllers\Api\V1\Public\StoreController as PublicStoreController;
use App\Http\Controllers\Api\V1\Public\StoreLinkController;
use App\Http\Controllers\Api\V1\Public\SubscriptionPlanController as PublicSubscriptionPlanController;
use App\Http\Controllers\Api\V1\Public\SystemSettingController;
use App\Http\Controllers\Api\V1\SystemController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {

    // ─── Health & Readiness checks ────────────────────────────────────────────
    Route::get('/health', [SystemController::class, 'health']);
    Route::get('/ready', [SystemController::class, 'ready']);

    // ─── Authentication ────────────────────────────────────────────────────────
    Route::prefix('auth')->group(function (): void {
        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:login');

        // Public merchant self-registration (5 req/min per IP)
        Route::post('/register/merchant', RegisterMerchantController::class)
            ->middleware('throttle:merchant-registration');

        // Forgot password – anti-enumeration, always generic response (5 req/min per IP)
        Route::post('/forgot-password', ForgotPasswordController::class)
            ->middleware('throttle:forgot-password');

        // Reset password with broker-issued token (10 req/min per IP)
        Route::post('/reset-password', ResetPasswordController::class)
            ->middleware('throttle:password-reset');

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);

            // Email Verification
            Route::prefix('email')->group(function (): void {
                Route::get('/status', [VerificationController::class, 'status']);
                Route::post('/verification-notification', [VerificationController::class, 'send'])
                    ->middleware('throttle:verification-notification');
                Route::get('/verify/{id}/{hash}', [VerificationController::class, 'verify'])
                    ->name('verification.verify')
                    ->withoutMiddleware('auth:sanctum') // Support verification without active session
                    ->middleware('throttle:email-verification');
            });

            // Session Management
            Route::prefix('sessions')->group(function (): void {
                Route::get('/', [SessionController::class, 'index']);
                Route::delete('/others', [SessionController::class, 'destroyOthers']);
                Route::delete('/all', [SessionController::class, 'destroyAll'])
                    ->middleware('throttle:sessions-revoke');
                Route::delete('/{publicId}', [SessionController::class, 'destroy']);
            });
        });
    });

    // ─── Notifications (Authenticated User) ───────────────────────────────────
    Route::prefix('notifications')
        ->middleware(['auth:sanctum'])
        ->group(function (): void {
            Route::get('/', [NotificationController::class, 'index']);
            Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
            Route::patch('/read-all', [NotificationController::class, 'markAllAsRead']);
            Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
        });

    // ─── Public endpoints (no authentication required) ─────────────────────────
    Route::prefix('subscription-plans')->group(function (): void {
        Route::get('/', [PublicSubscriptionPlanController::class, 'index']);
        Route::get('/{code}', [PublicSubscriptionPlanController::class, 'show']);
    });

    Route::prefix('categories')->group(function (): void {
        Route::get('/', [PublicCategoryController::class, 'index']);
        Route::get('/{slug}', [PublicCategoryController::class, 'show']);
    });

    Route::prefix('cities')->group(function (): void {
        Route::get('/', [PublicCityController::class, 'index']);
        Route::get('/{publicId}/zones', [PublicCityController::class, 'zones']);
    });

    Route::get('/bootstrap', [BootstrapController::class, '__invoke']);

    Route::prefix('settings')->group(function (): void {
        Route::get('/', [SystemSettingController::class, 'index']);
        Route::get('/{group}', [SystemSettingController::class, 'show']);
    });

    Route::prefix('pages')->group(function (): void {
        Route::get('/', [StaticPageController::class, 'index']);
        Route::get('/{slug}', [StaticPageController::class, 'show']);
    });

    Route::get('/faqs', [FaqController::class, 'index']);

    Route::get('/search/suggestions', [SearchSuggestionController::class, 'suggest']);

    Route::prefix('stores')->group(function (): void {
        Route::get('/', [PublicStoreController::class, 'index']);
        Route::get('/{slug}/links', [StoreLinkController::class, 'links']);
        Route::get('/{slug}/qr', [StoreLinkController::class, 'qr'])->name('api.v1.public.stores.qr');
        Route::get('/{slug}/related', [PublicStoreController::class, 'related']);
        Route::get('/{slug}', [PublicStoreController::class, 'show']);
        Route::get('/{slug}/offers', [PublicStoreController::class, 'offers']);
    });

    // ─── Merchant (Sanctum + merchant role/permissions required) ───────────────
    Route::prefix('merchant')
        ->middleware(['auth:sanctum']) // Role/permission is handled by Policies and route scopes
        ->group(function (): void {
            // Dashboard
            Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
            Route::get('/dashboard/recent-activity', [DashboardController::class, 'recentActivity']);

            Route::prefix('stores')->group(function (): void {
                Route::get('/', [MerchantStoreController::class, 'index']);
                Route::post('/', [MerchantStoreController::class, 'store'])->middleware('verified.api');
                Route::get('/{storePublicId}/dashboard', [DashboardController::class, 'storeDashboard']);
                Route::get('/{publicId}', [MerchantStoreController::class, 'show']);
                Route::put('/{publicId}', [MerchantStoreController::class, 'update'])->middleware('verified.api');
                Route::get('/{publicId}/status', [MerchantStoreController::class, 'status']);

                // Media
                Route::post('/{publicId}/logo', [StoreMediaController::class, 'storeLogo'])->middleware('verified.api');
                Route::delete('/{publicId}/logo', [StoreMediaController::class, 'destroyLogo'])->middleware('verified.api');
                Route::post('/{publicId}/cover', [StoreMediaController::class, 'storeCover'])->middleware('verified.api');
                Route::delete('/{publicId}/cover', [StoreMediaController::class, 'destroyCover'])->middleware('verified.api');
                Route::post('/{publicId}/gallery', [StoreMediaController::class, 'storeGallery'])->middleware('verified.api');
                Route::delete('/{publicId}/gallery/{mediaPublicId}', [StoreMediaController::class, 'destroyGallery'])->middleware('verified.api');
                Route::patch('/{publicId}/gallery/reorder', [StoreMediaController::class, 'reorderGallery'])->middleware('verified.api');

                // Working Hours
                Route::get('/{publicId}/working-hours', [StoreWorkingHoursController::class, 'show']);
                Route::put('/{publicId}/working-hours', [StoreWorkingHoursController::class, 'update']);

                // Social Links
                Route::get('/{publicId}/social-links', [StoreSocialLinkController::class, 'index']);
                Route::post('/{publicId}/social-links', [StoreSocialLinkController::class, 'store']);
                Route::get('/{publicId}/social-links/{socialLinkPublicId}', [StoreSocialLinkController::class, 'show']);
                Route::put('/{publicId}/social-links/{socialLinkPublicId}', [StoreSocialLinkController::class, 'update']);
                Route::delete('/{publicId}/social-links/{socialLinkPublicId}', [StoreSocialLinkController::class, 'destroy']);

                // Offers
                Route::get('/{publicId}/offers', [OfferController::class, 'index']);
                Route::post('/{publicId}/offers', [OfferController::class, 'store'])->middleware('verified.api');
                Route::get('/{publicId}/offers/{offerPublicId}', [OfferController::class, 'show']);
                Route::put('/{publicId}/offers/{offerPublicId}', [OfferController::class, 'update'])->middleware('verified.api');
                Route::delete('/{publicId}/offers/{offerPublicId}', [OfferController::class, 'destroy'])->middleware('verified.api');

                // Subscriptions
                Route::get('/{publicId}/subscription', [MerchantStoreSubscriptionController::class, 'show']);
                Route::get('/{publicId}/subscriptions', [MerchantStoreSubscriptionController::class, 'index']);

                // Links & QR Code
                Route::get('/{storePublicId}/links', [App\Http\Controllers\Api\V1\Merchant\StoreLinkController::class, 'links']);
                Route::get('/{storePublicId}/qr', [App\Http\Controllers\Api\V1\Merchant\StoreLinkController::class, 'qr']);
            });
        });

    // ─── Administration (Sanctum + admin role required) ────────────────────────
    Route::prefix('admin')
        ->middleware(['auth:sanctum', 'role:admin'])
        ->group(function (): void {
            // Dashboard
            Route::prefix('dashboard')->group(function (): void {
                Route::get('/summary', [App\Http\Controllers\Api\V1\Admin\DashboardController::class, 'summary']);
                Route::get('/recent-activity', [App\Http\Controllers\Api\V1\Admin\DashboardController::class, 'recentActivity']);
                Route::get('/stores-by-status', [App\Http\Controllers\Api\V1\Admin\DashboardController::class, 'storesByStatus']);
                Route::get('/subscriptions-by-status', [App\Http\Controllers\Api\V1\Admin\DashboardController::class, 'subscriptionsByStatus']);
                Route::get('/stores-by-category', [App\Http\Controllers\Api\V1\Admin\DashboardController::class, 'storesByCategory']);
                Route::get('/stores-by-city', [App\Http\Controllers\Api\V1\Admin\DashboardController::class, 'storesByCity']);
                Route::get('/subscriptions-by-plan', [App\Http\Controllers\Api\V1\Admin\DashboardController::class, 'subscriptionsByPlan']);
                Route::get('/trends', [App\Http\Controllers\Api\V1\Admin\DashboardController::class, 'trends']);
            });

            // Users
            Route::prefix('users')->group(function (): void {
                Route::get('/', [UserController::class, 'index'])->middleware('permission:users.view');
                Route::post('/merchants', [UserController::class, 'storeMerchant'])->middleware('permission:users.manage');
                Route::get('/{publicId}', [UserController::class, 'show'])->middleware('permission:users.view');
                Route::put('/{publicId}', [UserController::class, 'update'])->middleware('permission:users.manage');
                Route::patch('/{publicId}/activate', [UserController::class, 'activate'])->middleware('permission:users.manage');
                Route::patch('/{publicId}/deactivate', [UserController::class, 'deactivate'])->middleware('permission:users.manage');
                Route::patch('/{publicId}/suspend', [UserController::class, 'suspend'])->middleware('permission:users.manage');
                Route::patch('/{publicId}/roles', [UserController::class, 'updateRoles'])->middleware('permission:users.manage');
                Route::post('/{publicId}/revoke-tokens', [UserController::class, 'revokeTokens'])->middleware('permission:users.manage');
                Route::post('/{publicId}/reset-password', [UserController::class, 'resetPassword'])->middleware('permission:users.manage');

                Route::get('/{publicId}/stores', [UserController::class, 'stores'])->middleware('permission:users.view');
                Route::get('/{publicId}/subscriptions', [UserController::class, 'subscriptions'])->middleware('permission:users.view');
            });

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
                Route::get('/{publicId}/links', [App\Http\Controllers\Api\V1\Admin\StoreLinkController::class, 'links']);
                Route::get('/{publicId}/qr', [App\Http\Controllers\Api\V1\Admin\StoreLinkController::class, 'qr']);
                Route::get('/{publicId}', [AdminStoreController::class, 'show']);
                Route::patch('/{publicId}/approve', [AdminStoreController::class, 'approve']);
                Route::patch('/{publicId}/reject', [AdminStoreController::class, 'reject']);
                Route::patch('/{publicId}/activate', [AdminStoreController::class, 'activate']);
                Route::patch('/{publicId}/deactivate', [AdminStoreController::class, 'deactivate']);
            });

            // Offers
            Route::prefix('offers')->group(function (): void {
                Route::get('/', [App\Http\Controllers\Api\V1\Admin\OfferController::class, 'index']);
                Route::get('/{publicId}', [App\Http\Controllers\Api\V1\Admin\OfferController::class, 'show']);
                Route::patch('/{publicId}/activate', [App\Http\Controllers\Api\V1\Admin\OfferController::class, 'activate']);
                Route::patch('/{publicId}/deactivate', [App\Http\Controllers\Api\V1\Admin\OfferController::class, 'deactivate']);
                Route::delete('/{publicId}', [App\Http\Controllers\Api\V1\Admin\OfferController::class, 'destroy']);
            });

            // Subscription Plans
            Route::prefix('subscription-plans')->group(function (): void {
                Route::get('/', [AdminSubscriptionPlanController::class, 'index']);
                Route::post('/', [AdminSubscriptionPlanController::class, 'store']);
                Route::get('/{publicId}', [AdminSubscriptionPlanController::class, 'show']);
                Route::put('/{publicId}', [AdminSubscriptionPlanController::class, 'update']);
                Route::delete('/{publicId}', [AdminSubscriptionPlanController::class, 'destroy']);
            });

            // Store Subscriptions
            Route::prefix('subscriptions')->group(function (): void {
                Route::get('/', [AdminStoreSubscriptionController::class, 'index']);
                Route::post('/assign', [AdminStoreSubscriptionController::class, 'assign']);
                Route::get('/{publicId}', [AdminStoreSubscriptionController::class, 'show']);
                Route::patch('/{publicId}/cancel', [AdminStoreSubscriptionController::class, 'cancel']);
            });

            Route::get('stores/{storePublicId}/subscriptions', [AdminStoreSubscriptionController::class, 'storeSubscriptions']);

            // Settings
            Route::prefix('settings')->group(function (): void {
                Route::get('/', [App\Http\Controllers\Api\V1\Admin\SystemSettingController::class, 'index']);
                Route::get('/{group}', [App\Http\Controllers\Api\V1\Admin\SystemSettingController::class, 'show']);
                Route::put('/', [App\Http\Controllers\Api\V1\Admin\SystemSettingController::class, 'update']);
                Route::put('/{group}', [App\Http\Controllers\Api\V1\Admin\SystemSettingController::class, 'updateGroup']);
            });

            // Static Pages
            Route::prefix('pages')->group(function (): void {
                Route::get('/', [App\Http\Controllers\Api\V1\Admin\StaticPageController::class, 'index']);
                Route::post('/', [App\Http\Controllers\Api\V1\Admin\StaticPageController::class, 'store']);
                Route::get('/{publicId}', [App\Http\Controllers\Api\V1\Admin\StaticPageController::class, 'show']);
                Route::put('/{publicId}', [App\Http\Controllers\Api\V1\Admin\StaticPageController::class, 'update']);
                Route::delete('/{publicId}', [App\Http\Controllers\Api\V1\Admin\StaticPageController::class, 'destroy']);
                Route::patch('/{publicId}/publish', [App\Http\Controllers\Api\V1\Admin\StaticPageController::class, 'publish']);
                Route::patch('/{publicId}/unpublish', [App\Http\Controllers\Api\V1\Admin\StaticPageController::class, 'unpublish']);
            });

            // FAQs
            Route::prefix('faqs')->group(function (): void {
                Route::get('/', [App\Http\Controllers\Api\V1\Admin\FaqController::class, 'index']);
                Route::post('/', [App\Http\Controllers\Api\V1\Admin\FaqController::class, 'store']);
                Route::get('/{publicId}', [App\Http\Controllers\Api\V1\Admin\FaqController::class, 'show']);
                Route::put('/{publicId}', [App\Http\Controllers\Api\V1\Admin\FaqController::class, 'update']);
                Route::delete('/{publicId}', [App\Http\Controllers\Api\V1\Admin\FaqController::class, 'destroy']);
            });

            // Audit Logs
            Route::prefix('audit-logs')->group(function (): void {
                Route::get('/', [AuditLogController::class, 'index']);
                Route::get('/{publicId}', [AuditLogController::class, 'show']);
            });
        });
});
