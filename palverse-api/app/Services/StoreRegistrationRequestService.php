<?php

namespace App\Services;

use App\Enums\StoreRequestStatus;
use App\Models\StoreRegistrationRequest;
use App\Models\StoreRequestStatusHistory;
use App\Models\User;
use App\Models\Store;
use App\Models\CommissionRecord;
use App\Enums\StoreStatus;
use App\Enums\CommissionStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StoreRegistrationRequestService
{
    /**
     * Create a draft request for a representative.
     */
    public function createDraft(User $rep, int $zoneId, int $cityId, ?int $categoryId, array $data): StoreRegistrationRequest
    {
        return DB::transaction(function () use ($rep, $zoneId, $cityId, $categoryId, $data) {
            $allowed = array_flip(StoreRegistrationRequest::representativeEditableFields());
            $filtered = array_intersect_key($data, $allowed);

            $request = StoreRegistrationRequest::create(array_merge($filtered, [
                'representative_id' => $rep->id,
                'zone_id' => $zoneId,
                'city_id' => $cityId,
                'category_id' => $categoryId,
                'status' => StoreRequestStatus::DRAFT->value,
            ]));

            StoreRequestStatusHistory::create([
                'request_id' => $request->id,
                'actor_id' => $rep->id,
                'from_status' => null,
                'to_status' => StoreRequestStatus::DRAFT->value,
                'note' => 'تم إنشاء الطلب كمسودة.',
            ]);

            return $request;
        });
    }

    /**
     * Update a request in an editable state.
     */
    public function update(StoreRegistrationRequest $request, User $actor, array $data): StoreRegistrationRequest
    {
        abort_if(! $request->status->isEditable(), 422, 'لا يمكن تعديل الطلب في حالته الحالية.');

        $allowed = array_flip(StoreRegistrationRequest::representativeEditableFields());
        $request->fill(array_intersect_key($data, $allowed));
        $request->save();

        return $request;
    }

    /**
     * Start reviewing a request.
     */
    public function startReview(StoreRegistrationRequest $request, User $admin): StoreRegistrationRequest
    {
        abort_if($request->status !== StoreRequestStatus::SUBMITTED, 422, 'لا يمكن بدء المراجعة إلا للطلبات المقدمة.');

        return DB::transaction(function () use ($request, $admin) {
            $oldStatus = $request->status->value;

            $request->status = StoreRequestStatus::UNDER_REVIEW;
            $request->save();

            StoreRequestStatusHistory::create([
                'request_id' => $request->id,
                'actor_id' => $admin->id,
                'from_status' => $oldStatus,
                'to_status' => StoreRequestStatus::UNDER_REVIEW->value,
                'note' => 'بدأ الموظف بمراجعة الطلب.',
            ]);

            return $request;
        });
    }

    /**
     * Submit a draft/rejected/needs-changes request.
     */
    public function submit(StoreRegistrationRequest $request, User $actor): StoreRegistrationRequest
    {
        abort_if(! $request->status->isSubmittable(), 422, 'لا يمكن تقديم الطلب في حالته الحالية.');
        abort_if(
            $request->category_id === null,
            422,
            'يجب تحديد تصنيف المحل قبل تقديم الطلب.'
        );

        return DB::transaction(function () use ($request, $actor) {
            $oldStatus = $request->status->value;

            $request->status = StoreRequestStatus::SUBMITTED;
            $request->submitted_at = now();
            $request->save();

            StoreRequestStatusHistory::create([
                'request_id' => $request->id,
                'actor_id' => $actor->id,
                'from_status' => $oldStatus,
                'to_status' => StoreRequestStatus::SUBMITTED->value,
                'note' => 'تم تقديم الطلب للمراجعة.',
            ]);

            return $request;
        });
    }

    /**
     * Admin: set status to under_review.
     */
    public function markUnderReview(StoreRegistrationRequest $request, User $admin): StoreRegistrationRequest
    {
        return DB::transaction(function () use ($request, $admin) {
            $oldStatus = $request->status->value;
            $request->status = StoreRequestStatus::UNDER_REVIEW;
            $request->save();

            StoreRequestStatusHistory::create([
                'request_id' => $request->id,
                'actor_id' => $admin->id,
                'from_status' => $oldStatus,
                'to_status' => StoreRequestStatus::UNDER_REVIEW->value,
                'note' => 'الطلب قيد المراجعة من قبل الإدارة.',
            ]);

            return $request;
        });
    }

    /**
     * Admin: approve the request.
     */
    public function approve(StoreRegistrationRequest $request, User $admin, ?string $adminNote = null): StoreRegistrationRequest
    {
        return DB::transaction(function () use ($request, $admin, $adminNote) {
            $oldStatus = $request->status->value;

            // 1. Find or create the Merchant user
            $merchantEmail = $request->proposed_merchant_email ?? ($request->proposed_merchant_phone . '@palverse.temp');

            $existingPhoneUser = User::where('phone', $request->proposed_merchant_phone)
                ->where('email', '!=', $merchantEmail)
                ->first();

            if ($existingPhoneUser) {
                abort(response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => [
                        'phone' => ['رقم الهاتف مسجل مسبقاً لحساب آخر ببريد إلكتروني مختلف. يرجى تعديل طلب التسجيل.']
                    ]
                ], 422));
            }

            $merchant = User::firstOrCreate(
                ['email' => $merchantEmail],
                [
                    'public_id' => (string) Str::ulid(),
                    'name' => $request->proposed_merchant_name,
                    'phone' => $request->proposed_merchant_phone,
                    'password' => Hash::make(Str::random(16)), // They can use "Forgot Password" or admin can set it
                    'preferred_locale' => 'ar',
                    'status' => 'active',
                ]
            );
            
            if (!$merchant->hasRole('merchant')) {
                $merchant->assignRole('merchant');
            }

            // 2. Create the Store — never invent FK ids; production auto-increments may not start at 1.
            if ($request->category_id === null) {
                abort(response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => [
                        'category_id' => ['لا يمكن اعتماد الطلب بدون تصنيف محل صالح. حدّث الطلب ثم أعد المحاولة.'],
                    ],
                ], 422));
            }

            $categoryExists = \App\Models\Category::whereKey($request->category_id)->exists();
            if (! $categoryExists) {
                abort(response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => [
                        'category_id' => ['تصنيف المحل المرتبط بالطلب غير موجود في النظام.'],
                    ],
                ], 422));
            }

            $store = new Store([
                'name_ar' => $request->store_name_ar,
                'name_en' => $request->store_name_en,
                'description_ar' => $request->description_ar ?? 'لا يوجد وصف',
                'description_en' => $request->description_en,
                'phone' => $request->phone,
                'whatsapp' => $request->whatsapp,
                'address_ar' => $request->address_ar,
                'address_en' => $request->address_en,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'category_id' => $request->category_id,
                'city_id' => $request->city_id,
                'zone_id' => $request->zone_id,
            ]);
            
            // Set the store owner and status directly
            $store->owner_id = $merchant->id;
            $store->status = StoreStatus::APPROVED->value;
            $store->approved_at = now();
            $store->approved_by = $admin->id;
            $store->save();

            // 3. Update Request
            $request->status = StoreRequestStatus::APPROVED;
            $request->reviewed_at = now();
            $request->reviewed_by = $admin->id;
            $request->admin_notes = $adminNote;
            $request->resulting_merchant_user_id = $merchant->id;
            $request->resulting_store_id = $store->id;
            $request->save();

            // 4. Create History
            StoreRequestStatusHistory::create([
                'request_id' => $request->id,
                'actor_id' => $admin->id,
                'from_status' => $oldStatus,
                'to_status' => StoreRequestStatus::APPROVED->value,
                'note' => $adminNote ?? 'تمت الموافقة على الطلب وتم إنشاء المحل والتاجر.',
            ]);

            // 5. Generate Pending Commission
            $commissionAmount = (float) (\App\Models\SystemSetting::where('group', 'financial')
                ->where('key', 'representative_commission_amount')
                ->value('value') ?? 100.00);

            CommissionRecord::create([
                'public_id' => (string) Str::ulid(),
                'representative_id' => $request->representative_id,
                'store_registration_request_id' => $request->id,
                'store_id' => $store->id,
                'amount' => $commissionAmount,
                'currency' => 'ILS',
                'status' => CommissionStatus::PENDING->value,
                'reason' => 'store_acquisition',
                'earned_at' => now(),
                'notes' => 'تم إنشاء العمولة بناءً على الموافقة على طلب تسجيل المحل.',
            ]);

            return $request;
        });
    }

    /**
     * Admin: reject the request.
     */
    public function reject(StoreRegistrationRequest $request, User $admin, string $reason): StoreRegistrationRequest
    {
        return DB::transaction(function () use ($request, $admin, $reason) {
            $oldStatus = $request->status->value;

            $request->status = StoreRequestStatus::REJECTED;
            $request->reviewed_at = now();
            $request->reviewed_by = $admin->id;
            $request->rejection_reason = $reason;
            $request->save();

            StoreRequestStatusHistory::create([
                'request_id' => $request->id,
                'actor_id' => $admin->id,
                'from_status' => $oldStatus,
                'to_status' => StoreRequestStatus::REJECTED->value,
                'note' => $reason,
            ]);

            return $request;
        });
    }

    /**
     * Admin: request changes.
     */
    public function requestChanges(StoreRegistrationRequest $request, User $admin, string $reason): StoreRegistrationRequest
    {
        return DB::transaction(function () use ($request, $admin, $reason) {
            $oldStatus = $request->status->value;

            $request->status = StoreRequestStatus::NEEDS_CHANGES;
            $request->reviewed_at = now();
            $request->reviewed_by = $admin->id;
            $request->admin_notes = $reason;
            $request->save();

            StoreRequestStatusHistory::create([
                'request_id' => $request->id,
                'actor_id' => $admin->id,
                'from_status' => $oldStatus,
                'to_status' => StoreRequestStatus::NEEDS_CHANGES->value,
                'note' => $reason,
            ]);

            return $request;
        });
    }
}
