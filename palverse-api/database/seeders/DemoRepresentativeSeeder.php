<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\RepresentativeProfile;
use App\Models\RepresentativeZoneAssignment;
use App\Models\Zone;
use App\Models\City;
use App\Models\Category;
use App\Models\StoreRegistrationRequest;
use App\Enums\StoreRequestStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoRepresentativeSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create a demo representative
        $representative = User::updateOrCreate(
            ['email' => 'representative1@palverse.demo'],
            [
                'public_id' => (string) Str::ulid(),
                'name' => 'Demo Representative',
                'password' => Hash::make(config('palverse.demo.representative_password', 'DemoRepresentative123!')),
                'email_verified_at' => now(),
                'phone' => '0599000003',
                'preferred_locale' => 'ar',
                'status' => 'active',
            ]
        );
        $representative->assignRole('representative');

        // 2. Create Representative Profile
        RepresentativeProfile::updateOrCreate(
            ['user_id' => $representative->id],
            [
                'public_id' => (string) Str::ulid(),
                'employee_code' => 'REP-001',
                'phone' => '0599000003',
                'status' => 'active',
                'hired_at' => now()->subMonths(6),
                'activated_at' => now()->subMonths(6),
            ]
        );

        // 3. Assign Zones (Give them all zones for demo purposes)
        $zones = Zone::all();
        foreach ($zones as $zone) {
            RepresentativeZoneAssignment::updateOrCreate(
                [
                    'representative_id' => $representative->id,
                    'zone_id' => $zone->id,
                ],
                [
                    'public_id' => (string) Str::ulid(),
                    'is_active' => true,
                    'assigned_at' => now()->subMonths(6),
                ]
            );
        }

        // 4. Seed some Store Registration Requests for the Admin Review queue
        $firstZone = $zones->first();
        $firstCity = City::first();
        $firstCategory = Category::first();

        if (!$firstZone || !$firstCity) return;

        // Draft Request
        StoreRegistrationRequest::firstOrCreate(
            [
                'representative_id' => $representative->id,
                'proposed_merchant_phone' => '0599111222',
            ],
            [
                'public_id' => (string) Str::ulid(),
                'zone_id' => $firstZone->id,
                'city_id' => $firstCity->id,
                'category_id' => $firstCategory?->id,
                'proposed_merchant_name' => 'John Draft',
                'proposed_merchant_email' => 'draft@palverse.demo',
                'store_name_ar' => 'محل مسودة',
                'store_name_en' => 'Draft Store',
                'phone' => '0599111222',
                'address_ar' => 'شارع الارسال',
                'latitude' => 31.5326 + (rand(-100, 100) / 10000),
                'longitude' => 35.0998 + (rand(-100, 100) / 10000),
                'status' => StoreRequestStatus::DRAFT,
            ]
        );

        // Submitted Request (Pending Admin Review)
        StoreRegistrationRequest::firstOrCreate(
            [
                'representative_id' => $representative->id,
                'proposed_merchant_phone' => '0599333444',
            ],
            [
                'public_id' => (string) Str::ulid(),
                'zone_id' => $firstZone->id,
                'city_id' => $firstCity->id,
                'category_id' => $firstCategory?->id,
                'proposed_merchant_name' => 'Ahmed Submitted',
                'proposed_merchant_email' => 'submitted@palverse.demo',
                'store_name_ar' => 'محل مقدم للمراجعة',
                'store_name_en' => 'Submitted Store',
                'phone' => '0599333444',
                'address_ar' => 'رام الله، الماصيون',
                'latitude' => 31.5326 + (rand(-100, 100) / 10000),
                'longitude' => 35.0998 + (rand(-100, 100) / 10000),
                'status' => StoreRequestStatus::SUBMITTED,
                'submitted_at' => now()->subHours(2),
            ]
        );

        // Under Review Request
        StoreRegistrationRequest::firstOrCreate(
            [
                'representative_id' => $representative->id,
                'proposed_merchant_phone' => '0599555666',
            ],
            [
                'public_id' => (string) Str::ulid(),
                'zone_id' => $firstZone->id,
                'city_id' => $firstCity->id,
                'category_id' => $firstCategory?->id,
                'proposed_merchant_name' => 'Sami Under Review',
                'store_name_ar' => 'محل قيد المراجعة',
                'phone' => '0599555666',
                'address_ar' => 'رام الله، الطيرة',
                'latitude' => 31.5326 + (rand(-100, 100) / 10000),
                'longitude' => 35.0998 + (rand(-100, 100) / 10000),
                'status' => StoreRequestStatus::UNDER_REVIEW,
                'submitted_at' => now()->subDays(1),
            ]
        );

        // Needs Changes Request
        StoreRegistrationRequest::firstOrCreate(
            [
                'representative_id' => $representative->id,
                'proposed_merchant_phone' => '0599777888',
            ],
            [
                'public_id' => (string) Str::ulid(),
                'zone_id' => $firstZone->id,
                'city_id' => $firstCity->id,
                'category_id' => $firstCategory?->id,
                'proposed_merchant_name' => 'Omar Needs Changes',
                'store_name_ar' => 'محل يحتاج تعديلات',
                'phone' => '0599777888',
                'address_ar' => 'نابلس',
                'latitude' => 31.5326 + (rand(-100, 100) / 10000),
                'longitude' => 35.0998 + (rand(-100, 100) / 10000),
                'status' => StoreRequestStatus::NEEDS_CHANGES,
                'submitted_at' => now()->subDays(2),
                'admin_notes' => 'يرجى إرفاق صورة واضحة لرخصة الحرفة، وتأكيد رقم الهاتف.',
            ]
        );
    }
}
