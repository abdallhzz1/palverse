<?php

namespace App\Http\Controllers\Api\V1\FollowUp;

use App\Http\Controllers\Controller;
use App\Models\MerchantJoinRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MerchantJoinRequestController extends Controller
{
    /**
     * Display a listing of the merchant join requests.
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');

        $requests = MerchantJoinRequest::with(['city', 'handler'])
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // We can use a resource, but for simplicity we'll just format it here
        $formatted = $requests->map(function ($req) {
            return [
                'public_id' => $req->public_id,
                'merchant_name' => $req->merchant_name,
                'store_name' => $req->store_name,
                'phone' => $req->phone,
                'email' => $req->email,
                'status' => $req->status,
                'status_label' => $req->status->labelAr(),
                'city' => $req->city ? ['id' => $req->city->id, 'name_ar' => $req->city->name_ar] : null,
                'created_at' => $req->created_at?->toIso8601String(),
                'handler' => $req->handler ? ['id' => $req->handler->id, 'name' => $req->handler->name] : null,
            ];
        });

        return response()->json([
            'data' => $formatted,
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'total' => $requests->total(),
            ]
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $publicId): JsonResponse
    {
        $req = MerchantJoinRequest::with(['city', 'handler'])->where('public_id', $publicId)->firstOrFail();

        return response()->json([
            'data' => [
                'public_id' => $req->public_id,
                'merchant_name' => $req->merchant_name,
                'store_name' => $req->store_name,
                'phone' => $req->phone,
                'email' => $req->email,
                'notes' => $req->notes,
                'status' => $req->status,
                'status_label' => $req->status->labelAr(),
                'city' => $req->city ? ['id' => $req->city->id, 'name_ar' => $req->city->name_ar] : null,
                'created_at' => $req->created_at?->toIso8601String(),
                'handler' => $req->handler ? ['id' => $req->handler->id, 'name' => $req->handler->name] : null,
            ]
        ]);
    }

    /**
     * Update the status of the specified resource.
     */
    public function updateStatus(Request $request, string $publicId): JsonResponse
    {
        $joinRequest = MerchantJoinRequest::where('public_id', $publicId)->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:new,contacted,approved,rejected',
            'password' => 'required_if:status,approved|string|min:8',
            'subscription_plan_id' => 'required_if:status,approved|exists:subscription_plans,public_id',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($joinRequest, $validated, $request) {
            if ($validated['status'] === 'approved') {
                if ($joinRequest->email) {
                    $existingEmailUser = \App\Models\User::where('email', $joinRequest->email)
                        ->where('phone', '!=', $joinRequest->phone)
                        ->first();
                    
                    if ($existingEmailUser) {
                        abort(response()->json([
                            'message' => 'The given data was invalid.',
                            'errors' => [
                                'email' => ['البريد الإلكتروني للتاجر (' . $joinRequest->email . ') مسجل مسبقاً لحساب آخر برقم هاتف مختلف. يرجى تعديل طلب الانضمام أو التواصل مع التاجر.']
                            ]
                        ], 422));
                    }
                }

                // Ensure merchant user doesn't already exist with same phone
                $user = \App\Models\User::firstOrCreate(
                    ['phone' => $joinRequest->phone],
                    [
                        'name' => $joinRequest->merchant_name,
                        'email' => $joinRequest->email,
                        'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
                    ]
                );

                if (!$user->hasRole('merchant')) {
                    $user->assignRole('merchant');
                }

                // Create Store — do not hardcode id=1; production may not have that row.
                $categoryId = \App\Models\Category::query()->value('id');
                $zoneId = \App\Models\Zone::where('city_id', $joinRequest->city_id)->value('id');

                if (! $categoryId || ! $zoneId) {
                    abort(response()->json([
                        'message' => 'The given data was invalid.',
                        'errors' => [
                            'store' => ['تعذر إنشاء المحل: تأكد من وجود تصنيفات ومناطق في النظام.'],
                        ],
                    ], 422));
                }

                $store = \App\Models\Store::firstOrCreate(
                    ['owner_id' => $user->id, 'name_ar' => $joinRequest->store_name],
                    [
                        'city_id' => $joinRequest->city_id,
                        'zone_id' => $zoneId,
                        'category_id' => $categoryId,
                        'description_ar' => 'تم إنشاؤه عبر طلب الانضمام',
                        'address_ar' => 'غير محدد',
                        'phone' => $joinRequest->phone,
                        'email' => $joinRequest->email,
                        'status' => \App\Enums\StoreStatus::APPROVED->value,
                        'is_active' => true,
                    ]
                );

                // Create Subscription
                $plan = \App\Models\SubscriptionPlan::where('public_id', $validated['subscription_plan_id'])->first();
                if ($plan) {
                    \App\Models\StoreSubscription::create([
                        'store_id' => $store->id,
                        'subscription_plan_id' => $plan->id,
                        'status' => \App\Enums\SubscriptionStatus::PENDING->value,
                        'starts_at' => now(),
                        'ends_at' => now()->addDays($plan->duration_days),
                        'assigned_by' => $request->user()->id,
                        'price_snapshot' => $plan->price,
                        'currency_snapshot' => $plan->currency,
                        'plan_name_ar_snapshot' => $plan->name_ar,
                        'plan_name_en_snapshot' => $plan->name_en,
                    ]);
                }
            }

            $joinRequest->update([
                'status' => $validated['status'],
                'handled_by' => $request->user()->id,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
        ]);
    }
}
