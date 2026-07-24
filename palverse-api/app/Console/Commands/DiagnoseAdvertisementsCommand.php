<?php

namespace App\Console\Commands;

use App\Models\Store;
use App\Models\StoreAdvertisement;
use App\Support\PublicStorageUrl;
use Illuminate\Console\Command;

class DiagnoseAdvertisementsCommand extends Command
{
    protected $signature = 'ads:diagnose
                            {--extend= : Extend active (or all) ads end_date by N days from today}
                            {--all : When extending, include inactive/expired ads too}';

    protected $description = 'Diagnose why homepage advertisements are not public, optionally extend schedule';

    public function handle(): int
    {
        $today = now()->toDateString();
        $this->info("Today (APP_TIMEZONE=".config('app.timezone')."): {$today}");
        $this->info('APP_URL='.config('app.url'));
        $this->newLine();

        $ads = StoreAdvertisement::query()
            ->with(['store:id,public_id,slug,name_ar,name_en,status,is_active'])
            ->orderByDesc('id')
            ->get();

        if ($ads->isEmpty()) {
            $this->warn('No rows in store_advertisements.');
            $this->line('Create ads from Follow-up/Admin first.');

            return self::SUCCESS;
        }

        $this->table(
            ['ID', 'Type', 'Active', 'Start', 'End', 'Window', 'StoreVisible', 'Image', 'Store', 'WhyHidden'],
            $ads->map(function (StoreAdvertisement $ad) use ($today) {
                $storeVisible = $ad->store_id
                    ? Store::query()->whereKey($ad->store_id)->publicVisible()->exists()
                    : false;

                $start = optional($ad->start_date)->toDateString();
                $end = optional($ad->end_date)->toDateString();
                $inWindow = $start && $end && $start <= $today && $end >= $today;
                $hasImage = $ad->ad_type !== 'banner' || filled($ad->image_path);

                $reasons = [];
                if (! $ad->is_active) {
                    $reasons[] = 'inactive';
                }
                if ($start && $start > $today) {
                    $reasons[] = 'scheduled';
                }
                if ($end && $end < $today) {
                    $reasons[] = 'expired';
                }
                if (! $storeVisible) {
                    $reasons[] = 'store_not_public';
                }
                if ($ad->ad_type === 'banner' && blank($ad->image_path)) {
                    $reasons[] = 'missing_banner_image';
                }

                $wouldShow = $ad->is_active && $inWindow && $storeVisible && $hasImage;

                return [
                    $ad->id,
                    $ad->ad_type,
                    $ad->is_active ? 'yes' : 'no',
                    $start,
                    $end,
                    $inWindow ? 'yes' : 'no',
                    $storeVisible ? 'yes' : 'no',
                    $ad->ad_type === 'banner'
                        ? (filled($ad->image_path) ? 'yes' : 'no')
                        : 'n/a',
                    $ad->store?->name_ar ?: ($ad->store?->name_en ?: ('#'.$ad->store_id)),
                    $wouldShow ? 'VISIBLE' : (implode(',', $reasons) ?: 'unknown'),
                ];
            })->all()
        );

        $publicBanners = StoreAdvertisement::query()
            ->where('ad_type', 'banner')
            ->where('is_active', true)
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->whereNotNull('image_path')
            ->whereHas('store', fn ($q) => $q->publicVisible())
            ->count();

        $publicFeatured = StoreAdvertisement::query()
            ->where('ad_type', 'featured_store')
            ->where('is_active', true)
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->whereHas('store', fn ($q) => $q->publicVisible())
            ->count();

        $this->newLine();
        $this->info("Public homepage banners that API would return: {$publicBanners}");
        $this->info("Public featured campaigns that API would return: {$publicFeatured}");

        $sample = StoreAdvertisement::query()
            ->where('ad_type', 'banner')
            ->whereNotNull('image_path')
            ->latest('id')
            ->first();

        if ($sample) {
            $this->line('Sample banner image URL: '.(PublicStorageUrl::fromPath($sample->image_path) ?: 'null'));
        }

        $extendDays = $this->option('extend');
        if ($extendDays !== null && $extendDays !== false && $extendDays !== '') {
            $days = max(1, (int) $extendDays);
            $query = StoreAdvertisement::query();
            if (! $this->option('all')) {
                $query->where('is_active', true);
            }

            $count = $query->update([
                'is_active' => true,
                'start_date' => $today,
                'end_date' => now()->addDays($days)->toDateString(),
            ]);

            $this->newLine();
            $this->info("Extended {$count} advertisement(s) to {$today} → +{$days} days and set is_active=true.");
            $this->warn('Re-run without --extend to verify VISIBLE rows, then hard-refresh the Vercel site.');
        }

        return self::SUCCESS;
    }
}
