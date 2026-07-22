<?php

namespace App\Models;

use App\Enums\StoreRequestStatus;
use App\Models\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class StoreRegistrationRequest extends Model
{
    use HasFactory, HasPublicId, SoftDeletes;

    protected $fillable = [
        'representative_id', 'zone_id', 'city_id', 'category_id',
        'proposed_merchant_name', 'proposed_merchant_phone', 'proposed_merchant_email',
        'store_name_ar', 'store_name_en', 'description_ar', 'description_en',
        'phone', 'whatsapp', 'email', 'website', 'address_ar', 'address_en',
        'latitude', 'longitude', 'status', 'representative_notes', 'admin_notes',
        'submitted_at', 'reviewed_at', 'reviewed_by', 'rejection_reason',
        'resulting_merchant_user_id', 'resulting_store_id',
    ];

    /**
     * Fields representatives may set when creating or updating a draft request.
     *
     * @return list<string>
     */
    public static function representativeEditableFields(): array
    {
        return [
            'proposed_merchant_name',
            'proposed_merchant_phone',
            'proposed_merchant_email',
            'store_name_ar',
            'store_name_en',
            'description_ar',
            'description_en',
            'phone',
            'whatsapp',
            'email',
            'website',
            'address_ar',
            'address_en',
            'latitude',
            'longitude',
            'representative_notes',
            'zone_id',
            'city_id',
            'category_id',
        ];
    }

    protected $hidden = [
        'id', 'representative_id', 'zone_id', 'city_id', 'category_id',
        'reviewed_by', 'resulting_merchant_user_id', 'resulting_store_id',
    ];

    protected $casts = [
        'status' => StoreRequestStatus::class,
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    public function representative(): BelongsTo
    {
        return $this->belongsTo(User::class, 'representative_id');
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function resultingMerchant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resulting_merchant_user_id');
    }

    public function resultingStore(): BelongsTo
    {
        return $this->belongsTo(Store::class, 'resulting_store_id');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(StoreRequestStatusHistory::class, 'request_id')->orderBy('created_at');
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(CommissionRecord::class, 'store_registration_request_id');
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(CollectionReceipt::class, 'store_registration_request_id');
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->representative_id === $user->id;
    }
}
