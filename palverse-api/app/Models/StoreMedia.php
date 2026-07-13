<?php

namespace App\Models;

use App\Enums\StoreMediaType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StoreMedia extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'store_media';

    protected $fillable = [
        'store_id',
        'type',
        'file_path',
        'disk',
        'original_name',
        'mime_type',
        'file_size',
        'width',
        'height',
        'sort_order',
        'alt_text_ar',
        'alt_text_en',
    ];

    protected $hidden = [
        'id',
        'store_id',
        'file_path',
        'disk',
    ];

    protected $casts = [
        'type' => StoreMediaType::class,
        'file_size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'url',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($media) {
            if (empty($media->public_id)) {
                $media->public_id = (string) Str::ulid();
            }
        });

        // Handle physical file cleanup upon actual deletion (force delete or normal delete depending on soft delete implementation)
        static::forceDeleted(function ($media) {
            Storage::disk($media->disk)->delete($media->file_path);
        });
    }

    public function getUrlAttribute(): ?string
    {
        if (! $this->file_path) {
            return null;
        }

        return Storage::disk($this->disk)->url($this->file_path);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function scopeLogo(Builder $query): Builder
    {
        return $query->where('type', StoreMediaType::LOGO->value);
    }

    public function scopeCover(Builder $query): Builder
    {
        return $query->where('type', StoreMediaType::COVER->value);
    }

    public function scopeGallery(Builder $query): Builder
    {
        return $query->where('type', StoreMediaType::GALLERY->value);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'asc');
    }
}
