<?php

namespace Database\Seeders;

use App\Enums\StaticPageType;
use App\Models\Faq;
use App\Models\StaticPage;
use App\Models\SystemSetting;
use App\Support\StaticPageMeta;
use Illuminate\Database\Seeder;

class DemoContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedSettings();
        $this->seedPages();
        $this->seedFaqs();
    }

    private function seedSettings()
    {
        $settings = [
            ['group' => 'general', 'key' => 'platform_name_en', 'value' => 'Palverse', 'type' => 'string'],
            ['group' => 'general', 'key' => 'platform_description_ar', 'value' => 'كل فلسطين في دليل واحد', 'type' => 'text'],
            ['group' => 'general', 'key' => 'platform_description_en', 'value' => 'All Palestine in One Directory', 'type' => 'text'],
            ['group' => 'contact', 'key' => 'support_email', 'value' => 'support@palverse.demo', 'type' => 'email'],
            ['group' => 'contact', 'key' => 'support_phone', 'value' => '0590000000', 'type' => 'phone'],
            ['group' => 'contact', 'key' => 'address_ar', 'value' => 'الخليل، فلسطين', 'type' => 'text'],
            ['group' => 'contact', 'key' => 'address_en', 'value' => 'Hebron, Palestine', 'type' => 'text'],
            ['group' => 'social', 'key' => 'facebook_url', 'value' => 'https://facebook.com/palverse.demo', 'type' => 'url'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['group' => $setting['group'], 'key' => $setting['key']],
                ['value' => $setting['value'], 'type' => $setting['type'], 'is_public' => true]
            );
        }
    }

    private function seedPages()
    {
        $pages = [
            [
                'slug' => 'about',
                'page_type' => StaticPageType::Content->value,
                'title_ar' => 'من نحن',
                'title_en' => 'About Us',
                'content_ar' => '<p>Palverse دليل رقمي يساعد المستخدمين على اكتشاف الأنشطة التجارية والخدمات المحلية في فلسطين بسهولة، ويوفر لأصحاب الأعمال مساحة موحدة لعرض معلوماتهم وعروضهم.</p>',
                'content_en' => '<p>Palverse is a digital directory helping users discover local businesses and services in Palestine effortlessly.</p>',
                'meta' => null,
            ],
            [
                'slug' => 'privacy',
                'page_type' => StaticPageType::Content->value,
                'title_ar' => 'سياسة الخصوصية',
                'title_en' => 'Privacy Policy',
                'content_ar' => '<p>هذه سياسة الخصوصية التجريبية الخاصة بـ Palverse.</p>',
                'content_en' => '<p>This is the demo privacy policy for Palverse.</p>',
                'meta' => null,
            ],
            [
                'slug' => 'terms',
                'page_type' => StaticPageType::Content->value,
                'title_ar' => 'الشروط والأحكام',
                'title_en' => 'Terms & Conditions',
                'content_ar' => '<p>هذه الشروط والأحكام التجريبية الخاصة بـ Palverse.</p>',
                'content_en' => '<p>These are the demo terms and conditions for Palverse.</p>',
                'meta' => null,
            ],
            [
                'slug' => 'contact',
                'page_type' => StaticPageType::Contact->value,
                'title_ar' => 'تواصل معنا',
                'title_en' => 'Contact Us',
                'content_ar' => '<p>يمكنك التواصل معنا عبر البريد الإلكتروني أو الهاتف.</p>',
                'content_en' => '<p>You can contact us via email or phone.</p>',
                'meta' => StaticPageMeta::defaultContactMeta(),
            ],
        ];

        foreach ($pages as $page) {
            StaticPage::updateOrCreate(
                ['slug' => $page['slug']],
                [
                    'page_type' => $page['page_type'],
                    'title_ar' => $page['title_ar'],
                    'title_en' => $page['title_en'],
                    'content_ar' => $page['content_ar'],
                    'content_en' => $page['content_en'],
                    'meta' => $page['meta'],
                    'is_published' => true,
                    'published_at' => now(),
                ]
            );
        }
    }

    private function seedFaqs()
    {
        $faqs = [
            ['ar' => 'ما هو Palverse؟', 'en' => 'What is Palverse?'],
            ['ar' => 'كيف أبحث عن محل؟', 'en' => 'How do I search for a store?'],
            ['ar' => 'كيف أتواصل مع صاحب المحل؟', 'en' => 'How do I contact a store owner?'],
            ['ar' => 'كيف أسجل حسابًا؟', 'en' => 'How do I register an account?'],
            ['ar' => 'كيف أضيف محلي؟', 'en' => 'How do I add my store?'],
            ['ar' => 'كم تستغرق مراجعة المحل؟', 'en' => 'How long does a store review take?'],
            ['ar' => 'لماذا لا يظهر المحل للعامة؟', 'en' => 'Why is my store not visible to the public?'],
            ['ar' => 'كيف أضيف عرضًا؟', 'en' => 'How do I add an offer?'],
            ['ar' => 'ما هي خطط الاشتراك؟', 'en' => 'What are the subscription plans?'],
            ['ar' => 'كيف أعدل بيانات محلي؟', 'en' => 'How do I edit my store details?'],
            ['ar' => 'كيف أبلغ عن معلومات غير صحيحة؟', 'en' => 'How do I report incorrect information?'],
            ['ar' => 'كيف أغير كلمة المرور؟', 'en' => 'How do I change my password?'],
        ];

        foreach ($faqs as $index => $faq) {
            Faq::updateOrCreate(
                ['question_en' => $faq['en']],
                [
                    'question_ar' => $faq['ar'],
                    'answer_ar' => "هذه إجابة تجريبية للسؤال: {$faq['ar']}",
                    'answer_en' => "This is a demo answer for: {$faq['en']}",
                    'sort_order' => $index + 1,
                ]
            );
        }
    }
}
