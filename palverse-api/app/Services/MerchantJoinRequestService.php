<?php

namespace App\Services;

use App\Enums\MerchantJoinRequestStatus;
use App\Enums\StoreStatus;
use App\Enums\SubscriptionStatus;
use App\Models\Category;
use App\Models\MerchantJoinRequest;
use App\Models\Store;
use App\Models\StoreSubscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MerchantJoinRequestService
{
    /**
     * Approve, contact, or reject a public merchant join request.
     *
     * @param  array{status: string, password?: string, subscription_plan_id?: string, email?: string|null}  $data
     */
    public function updateStatus(MerchantJoinRequest $joinRequest, array $data, User $actor): MerchantJoinRequest
    {
        $status = $data['status'];

        if ($status === MerchantJoinRequestStatus::APPROVED->value) {
            $this->approve($joinRequest, $data, $actor);
        } else {
            $joinRequest->update([
                'status' => $status,
                'handled_by' => $actor->id,
            ]);
        }

        return $joinRequest->fresh(['city', 'handler']);
    }

    /**
     * @param  array{password: string, subscription_plan_id: string, email?: string|null}  $data
     */
    public function approve(MerchantJoinRequest $joinRequest, array $data, User $actor): MerchantJoinRequest
    {
        $email = $this->resolveMerchantEmail($joinRequest, $data['email'] ?? null);

        return DB::transaction(function () use ($joinRequest, $data, $actor, $email) {
            $this->assertEmailAvailable($email, $joinRequest->phone);

            $user = User::query()->where('phone', $joinRequest->phone)->first();

            if ($user) {
                $user->fill([
                    'name' => $joinRequest->merchant_name,
                    'email' => $email,
                    'password' => $data['password'],
                ]);
                $user->save();
            } else {
                $user = User::create([
                    'phone' => $joinRequest->phone,
                    'name' => $joinRequest->merchant_name,
                    'email' => $email,
                    'password' => $data['password'],
                ]);
            }

            if (! $user->hasRole('merchant')) {
                $user->assignRole('merchant');
            }

            $categoryId = Category::query()->value('id');
            $zoneId = Zone::query()->where('city_id', $joinRequest->city_id)->value('id');

            if (! $categoryId || ! $zoneId) {
                throw ValidationException::withMessages([
                    'store' => ['تعذر إنشاء المحل: تأكد من وجود تصنيفات ومناطق في النظام.'],
                ]);
            }

            $store = Store::query()->firstOrCreate(
                ['owner_id' => $user->id, 'name_ar' => $joinRequest->store_name],
                [
                    'city_id' => $joinRequest->city_id,
                    'zone_id' => $zoneId,
                    'category_id' => $categoryId,
                    'description_ar' => 'تم إنشاؤه عبر طلب الانضمام',
                    'address_ar' => 'غير محدد',
                    'phone' => $joinRequest->phone,
                    'email' => $email,
                    'status' => StoreStatus::APPROVED->value,
                    'is_active' => true,
                ]
            );

            $plan = SubscriptionPlan::query()
                ->where('public_id', $data['subscription_plan_id'])
                ->firstOrFail();

            $hasPendingOrActive = StoreSubscription::query()
                ->where('store_id', $store->id)
                ->whereIn('status', [
                    SubscriptionStatus::PENDING->value,
                    SubscriptionStatus::ACTIVE->value,
                ])
                ->exists();

            if (! $hasPendingOrActive) {
                StoreSubscription::create([
                    'store_id' => $store->id,
                    'subscription_plan_id' => $plan->id,
                    'status' => SubscriptionStatus::PENDING->value,
                    'starts_at' => now(),
                    'ends_at' => now()->addDays($plan->duration_days),
                    'assigned_by' => $actor->id,
                    'price_snapshot' => $plan->price,
                    'currency_snapshot' => $plan->currency,
                    'plan_name_ar_snapshot' => $plan->name_ar,
                    'plan_name_en_snapshot' => $plan->name_en,
                ]);
            }

            $joinRequest->update([
                'email' => $email,
                'status' => MerchantJoinRequestStatus::APPROVED->value,
                'handled_by' => $actor->id,
            ]);

            return $joinRequest;
        });
    }

    public function resolveMerchantEmail(MerchantJoinRequest $joinRequest, ?string $overrideEmail): string
    {
        $email = trim((string) ($overrideEmail ?: $joinRequest->email));

        if ($email === '') {
            throw ValidationException::withMessages([
                'email' => ['البريد الإلكتروني مطلوب للموافقة لأن الطلب لا يحتوي على بريد. أدخل بريداً لتسجيل دخول التاجر.'],
            ]);
        }

        return mb_strtolower($email);
    }

    private function assertEmailAvailable(string $email, string $phone): void
    {
        $existing = User::query()
            ->where('email', $email)
            ->where(function ($query) use ($phone) {
                $query->whereNull('phone')->orWhere('phone', '!=', $phone);
            })
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'email' => ['البريد الإلكتروني ('.$email.') مسجل مسبقاً لحساب آخر. يرجى استخدام بريد مختلف.'],
            ]);
        }
    }
}
