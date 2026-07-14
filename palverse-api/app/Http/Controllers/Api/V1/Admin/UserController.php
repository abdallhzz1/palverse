<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\AdminResetUserPasswordRequest;
use App\Http\Requests\Api\V1\Admin\AdminUserIndexRequest;
use App\Http\Requests\Api\V1\Admin\CreateMerchantRequest;
use App\Http\Requests\Api\V1\Admin\DeactivateUserRequest;
use App\Http\Requests\Api\V1\Admin\SuspendUserRequest;
use App\Http\Requests\Api\V1\Admin\UpdateAdminUserRequest;
use App\Http\Requests\Api\V1\Admin\UpdateUserRolesRequest;
use App\Http\Resources\Api\V1\StoreResource;
use App\Http\Resources\Api\V1\StoreSubscriptionResource;
use App\Http\Resources\Api\V1\UserManagementResource;
use App\Models\StoreSubscription;
use App\Models\User;
use App\Services\UserManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

/**
 * Maps a service-level InvalidArgumentException error code string to a
 * bilingual human-readable message for the standard error envelope.
 */
class UserController extends Controller
{
    protected UserManagementService $userService;

    public function __construct(UserManagementService $userService)
    {
        $this->userService = $userService;
    }

    public function index(AdminUserIndexRequest $request): JsonResponse
    {
        $query = User::query()
            ->with(['roles', 'suspendedBy', 'deactivatedBy', 'createdBy'])
            ->withCount(['storesOwned', 'subscriptionsAssigned']);

        if ($request->filled('query')) {
            $query->search($request->input('query'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('role')) {
            $query->role($request->input('role'));
        }

        if ($request->filled('email_verified')) {
            if ($request->boolean('email_verified')) {
                $query->whereNotNull('email_verified_at');
            } else {
                $query->whereNull('email_verified_at');
            }
        }

        if ($request->filled('has_stores')) {
            if ($request->boolean('has_stores')) {
                $query->has('storesOwned');
            } else {
                $query->doesntHave('storesOwned');
            }
        }

        if ($request->filled('created_from')) {
            $query->whereDate('created_at', '>=', $request->input('created_from'));
        }

        if ($request->filled('created_to')) {
            $query->whereDate('created_at', '<=', $request->input('created_to'));
        }

        $sort = $request->input('sort', 'newest');
        $direction = $request->input('direction', 'desc');

        match ($sort) {
            'oldest' => $query->orderBy('created_at', $direction === 'desc' ? 'asc' : 'desc'),
            'name' => $query->orderBy('name', $direction),
            'email' => $query->orderBy('email', $direction),
            'last_login' => $query->orderBy('last_login_at', $direction),
            default => $query->orderBy('created_at', $direction),
        };

        $users = $query->paginate($request->input('per_page', 15));

        $resourceResponse = UserManagementResource::collection($users)->response()->getData(true);

        return response()->json([
            'success' => true,
            'message' => app()->getLocale() === 'en' ? 'Users retrieved successfully.' : 'تم جلب المستخدمين بنجاح.',
            'data' => $resourceResponse['data'] ?? [],
            'meta' => $resourceResponse['meta'] ?? [],
            'links' => $resourceResponse['links'] ?? [],
        ]);
    }

    public function storeMerchant(CreateMerchantRequest $request): JsonResponse
    {
        $user = $this->userService->createMerchant(
            $request->validated(),
            $request->user()
        );

        $user->load(['roles', 'createdBy']);

        return response()->json([
            'success' => true,
            'message' => app()->getLocale() === 'en' ? 'Merchant created successfully.' : 'تم إنشاء التاجر بنجاح.',
            'data' => new UserManagementResource($user),
        ], 201);
    }

    public function show(string $publicId): JsonResponse
    {
        $user = User::where('public_id', $publicId)
            ->with(['roles', 'suspendedBy', 'deactivatedBy', 'createdBy'])
            ->withCount(['storesOwned', 'subscriptionsAssigned', 'unreadNotifications'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => app()->getLocale() === 'en' ? 'User details retrieved successfully.' : 'تم جلب بيانات المستخدم بنجاح.',
            'data' => new UserManagementResource($user),
        ]);
    }

    public function update(UpdateAdminUserRequest $request, string $publicId): JsonResponse
    {
        $user = User::where('public_id', $publicId)->firstOrFail();

        $updatedUser = $this->userService->updateUser($user, $request->validated());

        return response()->json([
            'success' => true,
            'message' => app()->getLocale() === 'en' ? 'User updated successfully.' : 'تم تحديث بيانات المستخدم بنجاح.',
            'data' => new UserManagementResource($updatedUser->load(['roles', 'suspendedBy', 'deactivatedBy', 'createdBy'])),
        ]);
    }

    public function activate(string $publicId): JsonResponse
    {
        $user = User::where('public_id', $publicId)->firstOrFail();

        try {
            $user = $this->userService->activateUser($user);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => app()->getLocale() === 'en' ? 'Cannot activate user.' : 'لا يمكن تفعيل المستخدم.',
                'error' => ['code' => $e->getMessage(), 'details' => []],
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => app()->getLocale() === 'en' ? 'User activated successfully.' : 'تم تفعيل المستخدم بنجاح.',
            'data' => new UserManagementResource($user->load(['roles'])),
        ]);
    }

    public function deactivate(DeactivateUserRequest $request, string $publicId): JsonResponse
    {
        $user = User::where('public_id', $publicId)->firstOrFail();

        try {
            $user = $this->userService->deactivateUser(
                $user,
                $request->user(),
                $request->input('reason'),
                $request->input('revoke_tokens', true)
            );
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => app()->getLocale() === 'en' ? 'Cannot deactivate user.' : 'لا يمكن تعطيل المستخدم.',
                'error' => ['code' => $e->getMessage(), 'details' => []],
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => app()->getLocale() === 'en' ? 'User deactivated successfully.' : 'تم تعطيل المستخدم بنجاح.',
            'data' => new UserManagementResource($user->load(['roles', 'deactivatedBy'])),
        ]);
    }

    public function suspend(SuspendUserRequest $request, string $publicId): JsonResponse
    {
        $user = User::where('public_id', $publicId)->firstOrFail();

        try {
            $user = $this->userService->suspendUser(
                $user,
                $request->user(),
                $request->input('suspension_reason'),
                $request->input('revoke_tokens', true)
            );
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => app()->getLocale() === 'en' ? 'Cannot suspend user.' : 'لا يمكن تعليق حساب المستخدم.',
                'error' => ['code' => $e->getMessage(), 'details' => []],
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => app()->getLocale() === 'en' ? 'User suspended successfully.' : 'تم تعليق حساب المستخدم بنجاح.',
            'data' => new UserManagementResource($user->load(['roles', 'suspendedBy'])),
        ]);
    }

    public function updateRoles(UpdateUserRolesRequest $request, string $publicId): JsonResponse
    {
        $user = User::where('public_id', $publicId)->firstOrFail();

        try {
            $user = $this->userService->updateRoles(
                $user,
                $request->input('roles'),
                $request->user()
            );
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => app()->getLocale() === 'en' ? 'Cannot update user roles.' : 'لا يمكن تعديل أدوار المستخدم.',
                'error' => ['code' => $e->getMessage(), 'details' => []],
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => app()->getLocale() === 'en' ? 'User roles updated successfully.' : 'تم تعديل أدوار المستخدم بنجاح.',
            'data' => collect($user->roles->pluck('name')),
        ]);
    }

    public function revokeTokens(string $publicId): JsonResponse
    {
        $user = User::where('public_id', $publicId)->firstOrFail();

        $revokedCount = $this->userService->revokeTokens($user);

        return response()->json([
            'success' => true,
            'message' => app()->getLocale() === 'en' ? 'Tokens revoked successfully.' : 'تم إلغاء الجلسات بنجاح.',
            'data' => [
                'revoked_count' => $revokedCount,
            ],
        ]);
    }

    public function resetPassword(AdminResetUserPasswordRequest $request, string $publicId): JsonResponse
    {
        $user = User::where('public_id', $publicId)->firstOrFail();

        $this->userService->resetPassword(
            $user,
            $request->input('password'),
            $request->input('revoke_tokens', true)
        );

        return response()->json([
            'success' => true,
            'message' => app()->getLocale() === 'en' ? 'Password reset successfully.' : 'تم إعادة تعيين كلمة المرور بنجاح.',
            'data' => null,
        ]);
    }

    public function stores(Request $request, string $publicId): JsonResponse
    {
        $user = User::where('public_id', $publicId)->firstOrFail();

        $stores = $user->storesOwned()
            ->with(['category', 'city', 'zone', 'media'])
            ->paginate($request->input('per_page', 15));

        $resourceResponse = StoreResource::collection($stores)->response()->getData(true);

        return response()->json([
            'success' => true,
            'message' => app()->getLocale() === 'en' ? 'User stores retrieved successfully.' : 'تم جلب متاجر المستخدم بنجاح.',
            'data' => $resourceResponse['data'] ?? [],
            'meta' => $resourceResponse['meta'] ?? [],
            'links' => $resourceResponse['links'] ?? [],
        ]);
    }

    public function subscriptions(Request $request, string $publicId): JsonResponse
    {
        $user = User::where('public_id', $publicId)->firstOrFail();

        // Assuming we want subscriptions of stores owned by this user
        $subscriptions = StoreSubscription::whereIn('store_id', $user->storesOwned()->select('id'))
            ->with(['store', 'plan'])
            ->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        $resourceResponse = StoreSubscriptionResource::collection($subscriptions)->response()->getData(true);

        return response()->json([
            'success' => true,
            'message' => app()->getLocale() === 'en' ? 'User store subscriptions retrieved successfully.' : 'تم جلب اشتراكات متاجر المستخدم بنجاح.',
            'data' => $resourceResponse['data'] ?? [],
            'meta' => $resourceResponse['meta'] ?? [],
            'links' => $resourceResponse['links'] ?? [],
        ]);
    }
}
