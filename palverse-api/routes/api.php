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
use App\Http\Controllers\Api\V1\Auth\ProfileController;
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
    Route::get('/health', [SystemController::class, 'health'])
        ->withoutMiddleware(['throttle:api']);
    Route::get('/ready', [SystemController::class, 'ready'])
        ->withoutMiddleware(['throttle:api']);
    Route::post('/bootstrap/seed-demo', [SystemController::class, 'seedDemo'])
        ->middleware('throttle:5,1')
        ->withoutMiddleware(['throttle:api']);

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

        Route::middleware(['auth:sanctum', 'user.active'])->group(function (): void {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);

            // Profile
            Route::put('/profile', [ProfileController::class, 'update']);
            Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);

            // Email Verification
            Route::prefix('email')->group(function (): void {
                Route::get('/status', [VerificationController::class, 'status']);
                Route::post('/verification-notification', [VerificationController::class, 'send'])
                    ->middleware('throttle:verification-notification');
                Route::get('/verify/{id}/{hash}', [VerificationController::class, 'verify'])
                    ->name('verification.verify')
                    ->withoutMiddleware('auth:sanctum')
                    ->middleware(['signed', 'throttle:email-verification']);
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
        ->middleware(['auth:sanctum', 'user.active'])
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

    Route::post('/merchant-join-requests', [\App\Http\Controllers\Api\V1\Public\MerchantJoinRequestController::class, 'store']);

    Route::get('/search/suggestions', [SearchSuggestionController::class, 'suggest']);

    Route::prefix('stores')->group(function (): void {
        Route::get('/', [PublicStoreController::class, 'index']);
        Route::get('/{slug}/links', [StoreLinkController::class, 'links']);
        Route::get('/{slug}/qr', [StoreLinkController::class, 'qr'])->name('api.v1.public.stores.qr');
        Route::get('/{slug}/related', [PublicStoreController::class, 'related']);
        Route::get('/{slug}', [PublicStoreController::class, 'show']);
        Route::get('/{slug}/offers', [PublicStoreController::class, 'offers']);

        Route::get('/{slug}/reviews', [\App\Http\Controllers\Api\V1\Public\ReviewController::class, 'index']);
        Route::get('/{slug}/reviews/summary', [\App\Http\Controllers\Api\V1\Public\ReviewController::class, 'summary']);
        Route::post('/{slug}/reviews', [\App\Http\Controllers\Api\V1\Public\ReviewController::class, 'store']);
    });

    // Global Offers
    Route::get('/offers', [App\Http\Controllers\Api\V1\Public\OfferController::class, 'index']);

    // Advertisements (Public)
    Route::get('/advertisements/banners', [\App\Http\Controllers\Api\V1\Public\AdvertisementController::class, 'banners']);

    // Statistics (Public)
    Route::get('/stats', [\App\Http\Controllers\Api\V1\Public\StatsController::class, 'index']);

    // Articles (Blog)
    Route::get('/articles', [\App\Http\Controllers\Api\V1\Public\ArticleController::class, 'index']);
    Route::get('/articles/{slug}', [\App\Http\Controllers\Api\V1\Public\ArticleController::class, 'show']);

    // ─── Merchant (Sanctum + merchant role/permissions required) ───────────────
    Route::prefix('merchant')
        ->middleware(['auth:sanctum', 'user.active', 'role:merchant'])
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

                // Reviews
                Route::get('/{publicId}/reviews', [\App\Http\Controllers\Api\V1\Merchant\ReviewController::class, 'index']);
                Route::get('/{publicId}/reviews/summary', [\App\Http\Controllers\Api\V1\Merchant\ReviewController::class, 'summary']);
                Route::post('/{publicId}/reviews/{reviewPublicId}/report', [\App\Http\Controllers\Api\V1\Merchant\ReviewController::class, 'report']);
            });
        });

    // ─── Representative (Sanctum + representative role/permissions required) ───────────────
    Route::prefix('representative')
        ->middleware(['auth:sanctum', 'user.active', 'role:representative'])
        ->group(function (): void {
            // Dashboard
            Route::get('/dashboard/summary', [\App\Http\Controllers\Api\V1\Representative\DashboardController::class, '__invoke']);

            // Zones
            Route::get('/zones', [\App\Http\Controllers\Api\V1\Representative\ZoneController::class, 'index']);

            // Store Requests
            Route::prefix('store-requests')->group(function (): void {
                Route::get('/', [\App\Http\Controllers\Api\V1\Representative\StoreRegistrationRequestController::class, 'index']);
                Route::post('/', [\App\Http\Controllers\Api\V1\Representative\StoreRegistrationRequestController::class, 'store']);
                Route::get('/{publicId}', [\App\Http\Controllers\Api\V1\Representative\StoreRegistrationRequestController::class, 'show']);
                Route::put('/{publicId}', [\App\Http\Controllers\Api\V1\Representative\StoreRegistrationRequestController::class, 'update']);
                Route::post('/{publicId}/submit', [\App\Http\Controllers\Api\V1\Representative\StoreRegistrationRequestController::class, 'submit']);
            });

            // Rejection Reports
            Route::prefix('rejection-reports')->group(function (): void {
                Route::get('/', [\App\Http\Controllers\Api\V1\Representative\RejectionReportController::class, 'index']);
                Route::post('/', [\App\Http\Controllers\Api\V1\Representative\RejectionReportController::class, 'store']);
            });

            // Commissions
            Route::get('/commissions', [\App\Http\Controllers\Api\V1\Representative\CommissionController::class, 'index']);

            // Receipts
            Route::prefix('receipts')->group(function (): void {
                Route::get('/', [\App\Http\Controllers\Api\V1\Representative\ReceiptController::class, 'index']);
                Route::post('/', [\App\Http\Controllers\Api\V1\Representative\ReceiptController::class, 'store']);
            });
        });

    // ─── Administration (Sanctum + admin role required) ────────────────────────
    Route::prefix('admin')
        ->middleware(['auth:sanctum', 'user.active', 'role:admin'])
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

            // Representatives
            Route::prefix('representatives')->group(function (): void {
                Route::get('/', [\App\Http\Controllers\Api\V1\Admin\RepresentativeController::class, 'index']);
                Route::post('/', [\App\Http\Controllers\Api\V1\Admin\RepresentativeController::class, 'store']);
                Route::get('/{publicId}', [\App\Http\Controllers\Api\V1\Admin\RepresentativeController::class, 'show']);
                Route::put('/{publicId}', [\App\Http\Controllers\Api\V1\Admin\RepresentativeController::class, 'update']);
                Route::post('/{publicId}/assign-zones', [\App\Http\Controllers\Api\V1\Admin\RepresentativeController::class, 'assignZones']);
            });

            // Commissions
            Route::prefix('commissions')->group(function (): void {
                Route::get('/', [\App\Http\Controllers\Api\V1\Admin\CommissionController::class, 'index']);
                Route::post('/{publicId}/pay', [\App\Http\Controllers\Api\V1\Admin\CommissionController::class, 'markAsPaid']);
            });

            // Store Requests (Admin Review)
            Route::prefix('store-requests')->group(function (): void {
                Route::get('/', [\App\Http\Controllers\Api\V1\Admin\StoreRegistrationRequestController::class, 'index']);
                Route::get('/{publicId}', [\App\Http\Controllers\Api\V1\Admin\StoreRegistrationRequestController::class, 'show']);
                Route::post('/{publicId}/review', [\App\Http\Controllers\Api\V1\Admin\StoreRegistrationRequestController::class, 'review']);
            });

            // Join Requests from website
            Route::prefix('join-requests')->group(function (): void {
                Route::get('/', [\App\Http\Controllers\Api\V1\Admin\MerchantJoinRequestController::class, 'index']);
                Route::get('/{publicId}', [\App\Http\Controllers\Api\V1\Admin\MerchantJoinRequestController::class, 'show']);
                Route::put('/{publicId}/status', [\App\Http\Controllers\Api\V1\Admin\MerchantJoinRequestController::class, 'updateStatus']);
            });

            // Audit Logs
            Route::prefix('audit-logs')->group(function (): void {
                Route::get('/', [AuditLogController::class, 'index']);
                Route::get('/{publicId}', [AuditLogController::class, 'show']);
            });

            // Reviews
            Route::prefix('reviews')->group(function (): void {
                Route::get('/', [\App\Http\Controllers\Api\V1\Admin\ReviewController::class, 'index']);
                Route::get('/{publicId}', [\App\Http\Controllers\Api\V1\Admin\ReviewController::class, 'show']);
                Route::patch('/{publicId}/{action}', [\App\Http\Controllers\Api\V1\Admin\ReviewController::class, 'moderate']);
            });

            // System Settings
            Route::prefix('settings')->group(function (): void {
                Route::get('/', [\App\Http\Controllers\Api\V1\Admin\SystemSettingController::class, 'index']);
                Route::put('/', [\App\Http\Controllers\Api\V1\Admin\SystemSettingController::class, 'update']);
            });

            // Receipts
            Route::get('/receipts', [\App\Http\Controllers\Api\V1\Admin\ReceiptController::class, 'index']);
            Route::post('/receipts/{publicId}/settle', [\App\Http\Controllers\Api\V1\Admin\ReceiptController::class, 'settle']);

            // Rejection Reports
            Route::get('/rejection-reports', [\App\Http\Controllers\Api\V1\Admin\RejectionReportController::class, 'index']);
        });

    // ─── Follow-Up (Authenticated Follow-Up Role) ─────────────────────────────
    Route::prefix('follow-up')
        ->middleware(['auth:sanctum', 'user.active', 'role:follow_up'])
        ->group(function (): void {
            // Dashboard Summary
            Route::get('/dashboard/summary', [\App\Http\Controllers\Api\V1\FollowUp\DashboardController::class, 'summary']);

            // Store Requests (Shared Queue)
            Route::prefix('store-requests')->group(function (): void {
                Route::get('/', [\App\Http\Controllers\Api\V1\FollowUp\StoreRequestController::class, 'index']);
                Route::get('/{publicId}', [\App\Http\Controllers\Api\V1\FollowUp\StoreRequestController::class, 'show']);
                Route::post('/{publicId}/review', [\App\Http\Controllers\Api\V1\FollowUp\StoreRequestController::class, 'review']);
            });

            // Merchant Join Requests (Public Site)
            Route::prefix('merchant-join-requests')->group(function (): void {
                Route::get('/', [\App\Http\Controllers\Api\V1\FollowUp\MerchantJoinRequestController::class, 'index']);
                Route::get('/{publicId}', [\App\Http\Controllers\Api\V1\FollowUp\MerchantJoinRequestController::class, 'show']);
                Route::put('/{publicId}/status', [\App\Http\Controllers\Api\V1\FollowUp\MerchantJoinRequestController::class, 'updateStatus']);
            });

            // Renewals
            Route::get('/renewals', [\App\Http\Controllers\Api\V1\FollowUp\RenewalController::class, 'index']);
            Route::get('/renewals/{publicId}', [\App\Http\Controllers\Api\V1\FollowUp\RenewalController::class, 'show']);
            Route::post('/renewals/{publicId}/renew', [\App\Http\Controllers\Api\V1\FollowUp\RenewalController::class, 'renew']);
            Route::put('/renewals/{publicId}/cancel', [\App\Http\Controllers\Api\V1\FollowUp\RenewalController::class, 'cancel']);

            // Unpaid Subscriptions
            Route::get('/unpaid-subscriptions', [\App\Http\Controllers\Api\V1\FollowUp\UnpaidSubscriptionController::class, 'index']);
            Route::get('/unpaid-subscriptions/{publicId}', [\App\Http\Controllers\Api\V1\FollowUp\UnpaidSubscriptionController::class, 'show']);
            Route::put('/unpaid-subscriptions/{publicId}/pay', [\App\Http\Controllers\Api\V1\FollowUp\UnpaidSubscriptionController::class, 'pay']);
            Route::put('/unpaid-subscriptions/{publicId}/cancel', [\App\Http\Controllers\Api\V1\FollowUp\UnpaidSubscriptionController::class, 'cancel']);

            // Calls
            Route::prefix('calls')->group(function (): void {
                Route::get('/', [\App\Http\Controllers\Api\V1\FollowUp\CallController::class, 'index']);
                Route::post('/', [\App\Http\Controllers\Api\V1\FollowUp\CallController::class, 'store']);
                Route::get('/{publicId}', [\App\Http\Controllers\Api\V1\FollowUp\CallController::class, 'show']);
                Route::put('/{publicId}', [\App\Http\Controllers\Api\V1\FollowUp\CallController::class, 'update']);
            });

            // Receipts
            Route::get('/receipts', [\App\Http\Controllers\Api\V1\FollowUp\ReceiptController::class, 'index']);
            Route::post('/receipts/{publicId}/settle', [\App\Http\Controllers\Api\V1\FollowUp\ReceiptController::class, 'settle']);

            // Rejection Reports
            Route::get('/rejection-reports', [\App\Http\Controllers\Api\V1\FollowUp\RejectionReportController::class, 'index']);

            // Advertisements
            Route::prefix('advertisements')->group(function (): void {
                Route::get('/', [\App\Http\Controllers\Api\V1\FollowUp\AdvertisementController::class, 'index']);
                Route::post('/', [\App\Http\Controllers\Api\V1\FollowUp\AdvertisementController::class, 'store']);
                Route::put('/{public_id}', [\App\Http\Controllers\Api\V1\FollowUp\AdvertisementController::class, 'update']);
                Route::delete('/{public_id}', [\App\Http\Controllers\Api\V1\FollowUp\AdvertisementController::class, 'destroy']);
            });

            // Representatives
            Route::prefix('representatives')->group(function (): void {
                Route::get('/', [\App\Http\Controllers\Api\V1\FollowUp\RepresentativeController::class, 'index']);
                Route::post('/', [\App\Http\Controllers\Api\V1\FollowUp\RepresentativeController::class, 'store']);
                Route::get('/{publicId}', [\App\Http\Controllers\Api\V1\FollowUp\RepresentativeController::class, 'show']);
            });

            // Articles (Blog)
            Route::prefix('articles')->group(function (): void {
                Route::get('/', [\App\Http\Controllers\Api\V1\FollowUp\ArticleController::class, 'index']);
                Route::post('/', [\App\Http\Controllers\Api\V1\FollowUp\ArticleController::class, 'store']);
                Route::get('/{publicId}', [\App\Http\Controllers\Api\V1\FollowUp\ArticleController::class, 'show']);
                Route::put('/{publicId}', [\App\Http\Controllers\Api\V1\FollowUp\ArticleController::class, 'update']);
                Route::delete('/{publicId}', [\App\Http\Controllers\Api\V1\FollowUp\ArticleController::class, 'destroy']);
            });
        });
});
