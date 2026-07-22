<?php

namespace Database\Seeders;

use App\Enums\DayOfWeek;
use App\Enums\SocialPlatform;
use App\Enums\StoreStatus;
use App\Models\Category;
use App\Models\Store;
use App\Models\User;
use App\Models\Zone;
use App\Services\StoreMediaService;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DemoStoreSeeder extends Seeder
{
    protected StoreMediaService $mediaService;

    public function __construct(StoreMediaService $mediaService)
    {
        $this->mediaService = $mediaService;
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@palverse.demo')->first();
        $merchants = User::role('merchant')->get();

        if ($merchants->isEmpty()) {
            $this->command->error('No merchants found. Please run DemoUserSeeder first.');
            return;
        }

        $storesData = [
            ['name_ar' => 'مطعم دار الخليل', 'name_en' => 'Dar Al-Khalil Restaurant', 'cat' => 'Restaurants', 'zone' => 'Hebron City', 'status' => StoreStatus::APPROVED, 'active' => true],
            ['name_ar' => 'قهوة البلدة القديمة', 'name_en' => 'Old City Coffee', 'cat' => 'Cafes & Sweets', 'zone' => 'Hebron City', 'status' => StoreStatus::APPROVED, 'active' => true],
            ['name_ar' => 'حلويات الكرم', 'name_en' => 'Al-Karam Sweets', 'cat' => 'Cafes & Sweets', 'zone' => 'Halhul', 'status' => StoreStatus::APPROVED, 'active' => true],
            ['name_ar' => 'أزياء الزيتونة', 'name_en' => 'Al-Zaytouna Fashion', 'cat' => 'Fashion & Clothing', 'zone' => 'Dura', 'status' => StoreStatus::APPROVED, 'active' => true],
            ['name_ar' => 'لمسة للعبايات', 'name_en' => 'Lamsa Abayas', 'cat' => 'Fashion & Clothing', 'zone' => 'Yatta', 'status' => StoreStatus::APPROVED, 'active' => true],
            ['name_ar' => 'تك زون للهواتف', 'name_en' => 'Tech Zone Mobile', 'cat' => 'Electronics & Mobile', 'zone' => 'Hebron City', 'status' => StoreStatus::APPROVED, 'active' => true],
            ['name_ar' => 'بيت الإلكترونيات', 'name_en' => 'Electronics House', 'cat' => 'Electronics & Mobile', 'zone' => 'Idhna', 'status' => StoreStatus::APPROVED, 'active' => true],
            ['name_ar' => 'مفروشات الأصالة', 'name_en' => 'Al-Asala Furniture', 'cat' => 'Furniture & Home', 'zone' => "Bani Na'im", 'status' => StoreStatus::APPROVED, 'active' => true],
            ['name_ar' => 'لمسات البيت', 'name_en' => 'Home Touches', 'cat' => 'Furniture & Home', 'zone' => 'Beit Ummar', 'status' => StoreStatus::APPROVED, 'active' => true],
            ['name_ar' => 'صيانة البيت الحديثة', 'name_en' => 'Modern Home Maintenance', 'cat' => 'Home Services', 'zone' => "Sa'ir", 'status' => StoreStatus::APPROVED, 'active' => true],
            // Pending
            ['name_ar' => 'مركز إشراقة للجمال', 'name_en' => 'Ishraqa Beauty Center', 'cat' => 'Health & Beauty', 'zone' => 'Hebron City', 'status' => StoreStatus::PENDING, 'active' => false],
            ['name_ar' => 'أكاديمية الريادة', 'name_en' => 'Al-Riyada Academy', 'cat' => 'Education & Training', 'zone' => 'Halhul', 'status' => StoreStatus::PENDING, 'active' => false],
            ['name_ar' => 'مركز الإبداع للتدريب', 'name_en' => 'Creativity Training Center', 'cat' => 'Education & Training', 'zone' => 'Taffuh', 'status' => StoreStatus::PENDING, 'active' => false],
            // Rejected
            ['name_ar' => 'أوتو الخليل', 'name_en' => 'Hebron Auto', 'cat' => 'Automotive', 'zone' => 'Adh-Dhahiriya', 'status' => StoreStatus::REJECTED, 'active' => false, 'reason' => 'يرجى إضافة صورة غلاف واضحة للمحل.'],
            ['name_ar' => 'سوق الخير', 'name_en' => 'Souq Al-Khair', 'cat' => 'Groceries', 'zone' => 'Tarqumiyah', 'status' => StoreStatus::REJECTED, 'active' => false, 'reason' => 'عنوان المحل غير مكتمل، يرجى تحديد الشارع.'],
            // Inactive but approved
            ['name_ar' => 'ورد وهدايا البلد', 'name_en' => 'Al-Balad Flowers & Gifts', 'cat' => 'Gifts & Flowers', 'zone' => 'Hebron City', 'status' => StoreStatus::APPROVED, 'active' => false],
            ['name_ar' => 'تطريز الكوفية', 'name_en' => 'Kufiya Embroidery', 'cat' => 'Local Crafts', 'zone' => 'Surif', 'status' => StoreStatus::APPROVED, 'active' => false],
            // Last pending
            ['name_ar' => 'زيتون فلسطين', 'name_en' => 'Palestine Olive Products', 'cat' => 'Local Crafts', 'zone' => 'Beit Ula', 'status' => StoreStatus::PENDING, 'active' => false],
        ];

        $merchantIndex = 0;

        foreach ($storesData as $index => $data) {
            $category = Category::where('name_en', $data['cat'])->first();
            $zone = Zone::where('name_en', $data['zone'])->first();
            $owner = $merchants[$merchantIndex % $merchants->count()];
            $merchantIndex++;

            if (!$category || !$zone) {
                $this->command->warn("Missing category or zone for {$data['name_en']}. Skipping.");
                continue;
            }

            $store = Store::where('name_en', $data['name_en'])->first();

            if (!$store) {
                $slug = Str::slug($data['name_en']);
                // Ensure unique slug
                if (Store::where('slug', $slug)->exists()) {
                    $slug .= '-' . uniqid();
                }

                $store = Store::create([
                    'owner_id' => $owner->id,
                    'category_id' => $category->id,
                    'city_id' => $zone->city_id,
                    'zone_id' => $zone->id,
                    'name_ar' => $data['name_ar'],
                    'name_en' => $data['name_en'],
                    'slug' => $slug,
                    'description_ar' => "وصف تجريبي لمحل {$data['name_ar']} المتخصص في تقديم أفضل الخدمات في الخليل.",
                    'description_en' => "Demo description for {$data['name_en']} specializing in the best services in Hebron.",
                    'address_ar' => "الخليل، {$data['name_ar']}",
                    'address_en' => "Hebron, {$data['name_en']}",
                    'latitude' => 31.5326 + (rand(-100, 100) / 10000), // Random offset near Hebron center
                    'longitude' => 35.0998 + (rand(-100, 100) / 10000), // Random offset near Hebron center
                    'phone' => '0590003' . str_pad($index, 3, '0', STR_PAD_LEFT),
                    'status' => $data['status']->value,
                    'is_active' => $data['active'],
                    'rejection_reason' => $data['reason'] ?? null,
                    'approved_by' => $data['status'] === StoreStatus::APPROVED ? $admin->id : null,
                    'approved_at' => $data['status'] === StoreStatus::APPROVED ? now() : null,
                    'rejected_by' => $data['status'] === StoreStatus::REJECTED ? $admin->id : null,
                    'rejected_at' => $data['status'] === StoreStatus::REJECTED ? now() : null,
                ]);
            } else {
                // Update existing
                $store->update([
                    'status' => $data['status']->value,
                    'is_active' => $data['active'],
                ]);
            }

            // Attach demo media/hours/social for approved stores (also on re-seed).
            if ($data['status'] === StoreStatus::APPROVED) {
                $this->attachMedia($store);
                $this->addWorkingHours($store);
                $this->addSocialLinks($store);
            }
        }
    }

    private function attachMedia(Store $store)
    {
        // Check if media already exists to avoid recreating it
        if ($store->logo()->exists() && $store->cover()->exists()) {
            return;
        }

        // Generate PNG logo
        $logoPath = $this->generatePngPlaceholder(400, 400, substr($store->name_en, 0, 2), '#E2E8F0', '#1E293B');
        $logoFile = new UploadedFile($logoPath, 'logo.png', 'image/png', null, true);
        try {
            $this->mediaService->uploadLogo($store, $logoFile);
            $this->command?->info("Attached logo for {$store->name_en}");
        } catch (\Exception $e) {
            $this->command?->warn("Logo upload failed for {$store->name_en}: {$e->getMessage()}");
        }

        // Generate PNG cover
        $coverPath = $this->generatePngPlaceholder(1200, 400, $store->name_en, '#1E293B', '#FFFFFF');
        $coverFile = new UploadedFile($coverPath, 'cover.png', 'image/png', null, true);
        try {
            $this->mediaService->uploadCover($store, $coverFile);
            $this->command?->info("Attached cover for {$store->name_en}");
        } catch (\Exception $e) {
            $this->command?->warn("Cover upload failed for {$store->name_en}: {$e->getMessage()}");
        }
    }

    private function addWorkingHours(Store $store)
    {
        if ($store->workingHours()->exists()) {
            return;
        }

        $days = DayOfWeek::cases();
        foreach ($days as $day) {
            // Friday closed
            if ($day === DayOfWeek::FRIDAY) {
                $store->workingHours()->create([
                    'day_of_week' => $day->value,
                    'is_closed' => true,
                ]);
                continue;
            }

            // Normal hours
            $store->workingHours()->create([
                'day_of_week' => $day->value,
                'period_index' => 0,
                'is_closed' => false,
                'opens_at' => '09:00',
                'closes_at' => '20:00',
            ]);
        }
    }

    private function addSocialLinks(Store $store)
    {
        if ($store->socialLinks()->exists()) {
            return;
        }

        $slug = $store->slug;

        $store->socialLinks()->create([
            'platform' => SocialPlatform::FACEBOOK->value,
            'url' => "https://www.facebook.com/palverse.demo.{$slug}",
        ]);

        $store->socialLinks()->create([
            'platform' => SocialPlatform::INSTAGRAM->value,
            'url' => "https://www.instagram.com/palverse_{$slug}",
        ]);
    }

    /**
     * Generate a simple PNG placeholder using GD.
     */
    private function generatePngPlaceholder(int $width, int $height, string $text, string $bgHex, string $textHex): string
    {
        $path = sys_get_temp_dir() . '/' . uniqid('palverse_demo_') . '.png';
        
        if (!function_exists('imagecreatetruecolor')) {
            // Minimal valid 1x1 PNG fallback when GD is unavailable.
            file_put_contents($path, base64_decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5W2fQAAAAASUVORK5CYII='
            ));
            return $path;
        }

        $image = imagecreatetruecolor($width, $height);
        
        list($r, $g, $b) = sscanf($bgHex, "#%02x%02x%02x");
        $bgColor = imagecolorallocate($image, $r, $g, $b);
        imagefill($image, 0, 0, $bgColor);
        
        list($r, $g, $b) = sscanf($textHex, "#%02x%02x%02x");
        $textColor = imagecolorallocate($image, $r, $g, $b);
        
        // Very basic text rendering (GD default font)
        $font = 5; // Built-in font
        $fw = imagefontwidth($font);
        $fh = imagefontheight($font);
        $tw = strlen($text) * $fw;
        
        $x = ($width - $tw) / 2;
        $y = ($height - $fh) / 2;
        
        imagestring($image, $font, (int)$x, (int)$y, $text, $textColor);
        
        imagepng($image, $path);
        imagedestroy($image);
        
        return $path;
    }
}
