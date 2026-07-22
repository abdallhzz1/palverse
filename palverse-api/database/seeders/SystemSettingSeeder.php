<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'group' => 'financial',
                'key' => 'representative_commission_amount',
                'value' => '100.00',
                'type' => 'decimal',
                'is_public' => false,
                'description_ar' => 'قيمة عمولة المندوب عن كل متجر معتمد',
                'description_en' => 'Commission amount per approved store',
            ],
            // General
            [
                'group' => 'general',
                'key' => 'platform_name_ar',
                'value' => 'بالفيرس',
                'type' => 'string',
                'is_public' => true,
                'description_ar' => 'اسم المنصة بالعربية',
                'description_en' => 'Platform name in Arabic',
            ],
            [
                'group' => 'general',
                'key' => 'platform_name_en',
                'value' => 'Palverse',
                'type' => 'string',
                'is_public' => true,
                'description_ar' => 'اسم المنصة بالإنجليزية',
                'description_en' => 'Platform name in English',
            ],
            [
                'group' => 'general',
                'key' => 'platform_description_ar',
                'value' => 'دليل الأعمال الفلسطيني الثنائي اللغة',
                'type' => 'text',
                'is_public' => true,
                'description_ar' => 'وصف المنصة بالعربية',
                'description_en' => 'Platform description in Arabic',
            ],
            [
                'group' => 'general',
                'key' => 'platform_description_en',
                'value' => 'The bilingual Palestinian business directory platform',
                'type' => 'text',
                'is_public' => true,
                'description_ar' => 'وصف المنصة بالإنجليزية',
                'description_en' => 'Platform description in English',
            ],
            [
                'group' => 'general',
                'key' => 'default_currency',
                'value' => 'ILS',
                'type' => 'string',
                'is_public' => true,
                'description_ar' => 'العملة الافتراضية',
                'description_en' => 'Default currency code',
            ],
            [
                'group' => 'general',
                'key' => 'default_language',
                'value' => 'ar',
                'type' => 'string',
                'is_public' => true,
                'description_ar' => 'اللغة الافتراضية',
                'description_en' => 'Default language code',
            ],
            [
                'group' => 'general',
                'key' => 'supported_languages',
                'value' => json_encode(['ar', 'en']),
                'type' => 'json',
                'is_public' => true,
                'description_ar' => 'اللغات المدعومة',
                'description_en' => 'Supported languages list',
            ],
            [
                'group' => 'general',
                'key' => 'timezone',
                'value' => 'Asia/Hebron',
                'type' => 'string',
                'is_public' => true,
                'description_ar' => 'المنطقة الزمنية الافتراضية',
                'description_en' => 'Default timezone code',
            ],

            // Branding
            [
                'group' => 'branding',
                'key' => 'logo_url',
                'value' => null,
                'type' => 'url',
                'is_public' => true,
                'description_ar' => 'رابط الشعار الأساسي',
                'description_en' => 'Main logo URL',
            ],
            [
                'group' => 'branding',
                'key' => 'logo_dark_url',
                'value' => null,
                'type' => 'url',
                'is_public' => true,
                'description_ar' => 'رابط الشعار المظلم',
                'description_en' => 'Dark mode logo URL',
            ],
            [
                'group' => 'branding',
                'key' => 'favicon_url',
                'value' => null,
                'type' => 'url',
                'is_public' => true,
                'description_ar' => 'رابط أيقونة المفضلة',
                'description_en' => 'Favicon image URL',
            ],
            [
                'group' => 'branding',
                'key' => 'primary_color',
                'value' => '#007FFF',
                'type' => 'string',
                'is_public' => true,
                'description_ar' => 'اللون الأساسي',
                'description_en' => 'Primary theme color hex code',
            ],
            [
                'group' => 'branding',
                'key' => 'secondary_color',
                'value' => '#6C757D',
                'type' => 'string',
                'is_public' => true,
                'description_ar' => 'اللون الثانوي',
                'description_en' => 'Secondary theme color hex code',
            ],

            // Contact
            [
                'group' => 'contact',
                'key' => 'support_email',
                'value' => 'support@palverse.ps',
                'type' => 'email',
                'is_public' => true,
                'description_ar' => 'البريد الإلكتروني للدعم',
                'description_en' => 'Customer support email address',
            ],
            [
                'group' => 'contact',
                'key' => 'support_phone',
                'value' => '+970599000000',
                'type' => 'phone',
                'is_public' => true,
                'description_ar' => 'رقم هاتف الدعم',
                'description_en' => 'Customer support phone number',
            ],
            [
                'group' => 'contact',
                'key' => 'support_whatsapp',
                'value' => '+970599000000',
                'type' => 'phone',
                'is_public' => true,
                'description_ar' => 'رقم واتساب الدعم',
                'description_en' => 'Customer support WhatsApp number',
            ],
            [
                'group' => 'contact',
                'key' => 'address_ar',
                'value' => 'فلسطين، رام الله، المنارة',
                'type' => 'text',
                'is_public' => true,
                'description_ar' => 'العنوان بالعربية',
                'description_en' => 'Physical address in Arabic',
            ],
            [
                'group' => 'contact',
                'key' => 'address_en',
                'value' => 'Palestine, Ramallah, Al-Manara',
                'type' => 'text',
                'is_public' => true,
                'description_ar' => 'العنوان بالإنجليزية',
                'description_en' => 'Physical address in English',
            ],

            // Social
            [
                'group' => 'social',
                'key' => 'facebook_url',
                'value' => 'https://facebook.com/palverse',
                'type' => 'url',
                'is_public' => true,
                'description_ar' => 'رابط صفحة فيسبوك',
                'description_en' => 'Facebook page URL',
            ],
            [
                'group' => 'social',
                'key' => 'instagram_url',
                'value' => 'https://instagram.com/palverse',
                'type' => 'url',
                'is_public' => true,
                'description_ar' => 'رابط صفحة إنستغرام',
                'description_en' => 'Instagram profile URL',
            ],
            [
                'group' => 'social',
                'key' => 'tiktok_url',
                'value' => null,
                'type' => 'url',
                'is_public' => true,
                'description_ar' => 'رابط حساب تيك توك',
                'description_en' => 'TikTok account URL',
            ],
            [
                'group' => 'social',
                'key' => 'linkedin_url',
                'value' => null,
                'type' => 'url',
                'is_public' => true,
                'description_ar' => 'رابط صفحة لينكد إن',
                'description_en' => 'LinkedIn profile URL',
            ],
            [
                'group' => 'social',
                'key' => 'youtube_url',
                'value' => null,
                'type' => 'url',
                'is_public' => true,
                'description_ar' => 'رابط قناة يوتيوب',
                'description_en' => 'YouTube channel URL',
            ],
            [
                'group' => 'social',
                'key' => 'x_url',
                'value' => null,
                'type' => 'url',
                'is_public' => true,
                'description_ar' => 'رابط حساب إكس (تويتر سابقاً)',
                'description_en' => 'X (formerly Twitter) account URL',
            ],

            // Application
            [
                'group' => 'application',
                'key' => 'android_app_url',
                'value' => null,
                'type' => 'url',
                'is_public' => true,
                'description_ar' => 'رابط تحميل تطبيق الأندرويد',
                'description_en' => 'Android application download URL',
            ],
            [
                'group' => 'application',
                'key' => 'ios_app_url',
                'value' => null,
                'type' => 'url',
                'is_public' => true,
                'description_ar' => 'رابط تحميل تطبيق الآي أو إس',
                'description_en' => 'iOS application download URL',
            ],
            [
                'group' => 'application',
                'key' => 'minimum_android_version',
                'value' => '1.0.0',
                'type' => 'string',
                'is_public' => true,
                'description_ar' => 'الحد الأدنى لإصدار أندرويد المدعوم',
                'description_en' => 'Minimum supported Android app version',
            ],
            [
                'group' => 'application',
                'key' => 'minimum_ios_version',
                'value' => '1.0.0',
                'type' => 'string',
                'is_public' => true,
                'description_ar' => 'الحد الأدنى لإصدار آي أو إس المدعوم',
                'description_en' => 'Minimum supported iOS app version',
            ],

            // Maintenance & Registration
            [
                'group' => 'maintenance',
                'key' => 'maintenance_message_ar',
                'value' => 'المنصة قيد الصيانة حالياً. سنعود قريباً!',
                'type' => 'text',
                'is_public' => true,
                'description_ar' => 'رسالة الصيانة بالعربية',
                'description_en' => 'Maintenance mode message in Arabic',
            ],
            [
                'group' => 'maintenance',
                'key' => 'maintenance_message_en',
                'value' => 'The platform is currently undergoing maintenance. We will be back soon!',
                'type' => 'text',
                'is_public' => true,
                'description_ar' => 'رسالة الصيانة بالإنجليزية',
                'description_en' => 'Maintenance mode message in English',
            ],
            [
                'group' => 'maintenance',
                'key' => 'registration_enabled',
                'value' => '1',
                'type' => 'boolean',
                'is_public' => true,
                'description_ar' => 'تفعيل تسجيل حسابات المستخدمين الجديدة',
                'description_en' => 'Enable new user registrations',
            ],
            [
                'group' => 'maintenance',
                'key' => 'merchant_registration_enabled',
                'value' => '1',
                'type' => 'boolean',
                'is_public' => true,
                'description_ar' => 'تفعيل تسجيل حسابات التجار الجديدة',
                'description_en' => 'Enable new merchant registrations',
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['group' => $setting['group'], 'key' => $setting['key']],
                [
                    'value' => $setting['value'],
                    'type' => $setting['type'],
                    'is_public' => $setting['is_public'],
                    'description_ar' => $setting['description_ar'],
                    'description_en' => $setting['description_en'],
                ]
            );
        }
    }
}
