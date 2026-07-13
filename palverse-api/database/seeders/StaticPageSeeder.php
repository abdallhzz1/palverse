<?php

namespace Database\Seeders;

use App\Models\StaticPage;
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
                'slug' => 'about-us',
                'title_ar' => 'من نحن',
                'title_en' => 'About Us',
                'content_ar' => '# من نحن\\n\\nمرحباً بكم في بالفيرس، دليل الأعمال الفلسطيني الأول.',
                'content_en' => '# About Us\\n\\nWelcome to Palverse, the premier Palestinian business directory.',
                'excerpt_ar' => 'تعرف على منصة بالفيرس ورؤيتنا.',
                'excerpt_en' => 'Learn more about Palverse and our vision.',
                'is_published' => true,
                'published_at' => now(),
                'sort_order' => 1,
            ],
            [
                'slug' => 'privacy-policy',
                'title_ar' => 'سياسة الخصوصية',
                'title_en' => 'Privacy Policy',
                'content_ar' => '# سياسة الخصوصية\\n\\n> [!IMPORTANT]\\n> سياسة الخصوصية هذه تتطلب مراجعة قانونية نهائية قبل الإنتاج.\\n\\nنحن نحترم خصوصيتك ونلتزم بحمايتها.',
                'content_en' => '# Privacy Policy\\n\\n> [!IMPORTANT]\\n> This privacy policy requires final legal review before production.\\n\\nWe value your privacy and commit to protecting it.',
                'excerpt_ar' => 'سياسة الخصوصية وحماية البيانات الشخصية.',
                'excerpt_en' => 'Privacy policy and personal data protection.',
                'is_published' => true,
                'published_at' => now(),
                'sort_order' => 2,
            ],
            [
                'slug' => 'terms-and-conditions',
                'title_ar' => 'الشروط والأحكام',
                'title_en' => 'Terms and Conditions',
                'content_ar' => '# الشروط والأحكام\\n\\n> [!IMPORTANT]\\n> الشروط والأحكام القانونية تتطلب مراجعة قانونية نهائية قبل الإنتاج.\\n\\nباستخدامك للمنصة، فإنك توافق على هذه الشروط.',
                'content_en' => '# Terms and Conditions\\n\\n> [!IMPORTANT]\\n> These legal terms require final legal review before production.\\n\\nBy using this platform, you agree to these terms.',
                'excerpt_ar' => 'الشروط والأحكام المنظمة لاستخدام المنصة.',
                'excerpt_en' => 'Terms and conditions governing platform usage.',
                'is_published' => true,
                'published_at' => now(),
                'sort_order' => 3,
            ],
            [
                'slug' => 'contact-us',
                'title_ar' => 'تواصل معنا',
                'title_en' => 'Contact Us',
                'content_ar' => '# تواصل معنا\\n\\nيسعدنا دائماً تواصلكم معنا للاستفسار أو الدعم.',
                'content_en' => '# Contact Us\\n\\nWe are always happy to hear from you for support or inquiries.',
                'excerpt_ar' => 'طرق التواصل وتقديم الدعم الفني.',
                'excerpt_en' => 'Support contact methods.',
                'is_published' => true,
                'published_at' => now(),
                'sort_order' => 4,
            ],
        ];

        foreach ($pages as $page) {
            StaticPage::updateOrCreate(
                ['slug' => $page['slug']],
                [
                    'title_ar' => $page['title_ar'],
                    'title_en' => $page['title_en'],
                    'content_ar' => $page['content_ar'],
                    'content_en' => $page['content_en'],
                    'excerpt_ar' => $page['excerpt_ar'],
                    'excerpt_en' => $page['excerpt_en'],
                    'is_published' => $page['is_published'],
                    'published_at' => $page['published_at'],
                    'sort_order' => $page['sort_order'],
                ]
            );
        }
    }
}
