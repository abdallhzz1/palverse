<?php

namespace Database\Seeders;

use App\Enums\StaticPageType;
use App\Models\StaticPage;
use App\Support\StaticPageMeta;
use Illuminate\Database\Seeder;

class StaticPageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pages = [
            [
                'slug' => 'about',
                'page_type' => StaticPageType::Content->value,
                'title_ar' => 'من نحن',
                'title_en' => 'About Us',
                'content_ar' => '<p>مرحباً بكم في بالفيرس، دليل الأعمال الفلسطيني الأول.</p>',
                'content_en' => '<p>Welcome to Palverse, the premier Palestinian business directory.</p>',
                'excerpt_ar' => 'تعرف على منصة بالفيرس ورؤيتنا.',
                'excerpt_en' => 'Learn more about Palverse and our vision.',
                'is_published' => true,
                'published_at' => now(),
                'sort_order' => 1,
                'meta' => ['hero_eyebrow_ar' => 'عن المنصة'],
            ],
            [
                'slug' => 'privacy',
                'page_type' => StaticPageType::Content->value,
                'title_ar' => 'سياسة الخصوصية',
                'title_en' => 'Privacy Policy',
                'content_ar' => '<p>نحن نحترم خصوصيتك ونلتزم بحمايتها.</p>',
                'content_en' => '<p>We value your privacy and commit to protecting it.</p>',
                'excerpt_ar' => 'سياسة الخصوصية وحماية البيانات الشخصية.',
                'excerpt_en' => 'Privacy policy and personal data protection.',
                'is_published' => true,
                'published_at' => now(),
                'sort_order' => 2,
                'meta' => null,
            ],
            [
                'slug' => 'terms',
                'page_type' => StaticPageType::Content->value,
                'title_ar' => 'الشروط والأحكام',
                'title_en' => 'Terms and Conditions',
                'content_ar' => '<p>باستخدامك للمنصة، فإنك توافق على هذه الشروط.</p>',
                'content_en' => '<p>By using this platform, you agree to these terms.</p>',
                'excerpt_ar' => 'الشروط والأحكام المنظمة لاستخدام المنصة.',
                'excerpt_en' => 'Terms and conditions governing platform usage.',
                'is_published' => true,
                'published_at' => now(),
                'sort_order' => 3,
                'meta' => null,
            ],
            [
                'slug' => 'contact',
                'page_type' => StaticPageType::Contact->value,
                'title_ar' => 'تواصل معنا',
                'title_en' => 'Contact Us',
                'content_ar' => '<p>يسعدنا دائماً تواصلكم معنا للاستفسار أو الدعم.</p>',
                'content_en' => '<p>We are always happy to hear from you for support or inquiries.</p>',
                'excerpt_ar' => 'نحن هنا لمساعدتك! لا تتردد في التواصل معنا لأي استفسار أو اقتراح.',
                'excerpt_en' => 'Support contact methods.',
                'is_published' => true,
                'published_at' => now(),
                'sort_order' => 4,
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
                    'excerpt_ar' => $page['excerpt_ar'],
                    'excerpt_en' => $page['excerpt_en'],
                    'is_published' => $page['is_published'],
                    'published_at' => $page['published_at'],
                    'sort_order' => $page['sort_order'],
                    'meta' => $page['meta'],
                ]
            );
        }
    }
}
