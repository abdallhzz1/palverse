<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\MerchantJoinRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MerchantJoinRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MerchantJoinRequest::with(['city'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $requests = $query->paginate();

        return response()->json([
            'data' => $requests->map(function ($req) {
                return [
                    'public_id' => $req->public_id,
                    'merchant_name' => $req->merchant_name,
                    'store_name' => $req->store_name,
                    'phone' => $req->phone,
                    'email' => $req->email,
                    'status' => $req->status,
                    'notes' => $req->notes,
                    'created_at' => $req->created_at,
                    'city' => $req->city ? [
                        'public_id' => $req->city->public_id,
                        'name_ar' => $req->city->name_ar,
                    ] : null,
                ];
            }),
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    public function show(string $publicId): JsonResponse
    {
        $joinRequest = MerchantJoinRequest::where('public_id', $publicId)->with(['city'])->firstOrFail();

        return response()->json([
            'data' => [
                'public_id' => $joinRequest->public_id,
                'merchant_name' => $joinRequest->merchant_name,
                'store_name' => $joinRequest->store_name,
                'phone' => $joinRequest->phone,
                'email' => $joinRequest->email,
                'status' => $joinRequest->status,
                'notes' => $joinRequest->notes,
                'created_at' => $joinRequest->created_at,
                'city' => $joinRequest->city ? [
                    'public_id' => $joinRequest->city->public_id,
                    'name_ar' => $joinRequest->city->name_ar,
                ] : null,
            ]
        ]);
    }

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
