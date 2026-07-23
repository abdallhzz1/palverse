<?php

namespace Tests\Feature\Api\V1;

use App\Models\Category;
use App\Models\City;
use App\Models\Faq;
use App\Models\StaticPage;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\SystemSettingService;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SystemSettingsAndFaqTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $merchant;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->merchant = User::factory()->create();
        $this->merchant->assignRole('merchant');
    }

    /**
     * Test guest can retrieve public settings and private settings are hidden.
     */
    public function test_guest_can_retrieve_public_settings_only(): void
    {
        // 1. Create a public setting
        SystemSetting::create([
            'group' => 'general',
            'key' => 'platform_name_ar',
            'value' => 'بالفيرس',
            'type' => 'string',
            'is_public' => true,
        ]);

        // 2. Create a private setting
        SystemSetting::create([
            'group' => 'general',
            'key' => 'secret_key',
            'value' => 'private-value',
            'type' => 'string',
            'is_public' => false,
        ]);

        $response = $this->getJson('/api/v1/settings');
        $response->assertStatus(200);

        // Assert public setting is returned
        $response->assertJsonPath('data.general.platform_name_ar', 'بالفيرس');

        // Assert private setting is hidden
        $this->assertNull($response->json('data.general.secret_key'));
    }

    /**
     * Test admin can view and update settings.
     */
    public function test_admin_settings_authorization_and_updates(): void
    {
        // Setup setting to update
        SystemSetting::create([
            'group' => 'contact',
            'key' => 'support_email',
            'value' => 'info@palverse.ps',
            'type' => 'email',
            'is_public' => true,
        ]);

        SystemSetting::create([
            'group' => 'maintenance',
            'key' => 'registration_enabled',
            'value' => '1',
            'type' => 'boolean',
            'is_public' => true,
        ]);

        // 1. Merchant gets 403
        $this->actingAs($this->merchant)
            ->getJson('/api/v1/admin/settings')
            ->assertStatus(403);

        // 2. Admin gets 200
        $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/settings')
            ->assertStatus(200);

        // 3. Admin updates valid setting
        $response = $this->actingAs($this->admin)
            ->putJson('/api/v1/admin/settings', [
                'settings' => [
                    'contact' => [
                        'support_email' => 'new-support@palverse.ps',
                    ],
                    'maintenance' => [
                        'registration_enabled' => false,
                    ],
                ],
            ]);

        $response->assertStatus(200);

        // Check values updated and cast correctly
        $this->assertEquals('new-support@palverse.ps', app(SystemSettingService::class)->get('contact', 'support_email'));
        $this->assertFalse(app(SystemSettingService::class)->get('maintenance', 'registration_enabled'));

        // 4. Update with invalid email format is rejected (422)
        $this->actingAs($this->admin)
            ->putJson('/api/v1/admin/settings', [
                'settings' => [
                    'contact' => [
                        'support_email' => 'invalid-email-format',
                    ],
                ],
            ])
            ->assertStatus(422);

        // 5. Unknown key is rejected
        $this->actingAs($this->admin)
            ->putJson('/api/v1/admin/settings', [
                'settings' => [
                    'general' => [
                        'unknown_non_existent_key' => 'some-value',
                    ],
                ],
            ])
            ->assertStatus(422);
    }

    public function test_admin_financial_settings_group_is_created_when_missing(): void
    {
        SystemSetting::query()
            ->where('group', 'financial')
            ->where('key', 'representative_commission_amount')
            ->delete();

        $this->assertDatabaseMissing('system_settings', [
            'group' => 'financial',
            'key' => 'representative_commission_amount',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/settings/financial')
            ->assertOk();

        $this->assertEquals(100.0, (float) $response->json('data.representative_commission_amount.value'));

        $this->assertDatabaseHas('system_settings', [
            'group' => 'financial',
            'key' => 'representative_commission_amount',
        ]);

        $this->actingAs($this->admin)
            ->putJson('/api/v1/admin/settings/financial', [
                'settings' => [
                    'representative_commission_amount' => '150.50',
                ],
            ])
            ->assertOk();

        $this->assertEquals(150.5, app(SystemSettingService::class)->get('financial', 'representative_commission_amount'));
    }

    public function test_admin_settings_unknown_group_returns_not_found(): void
    {
        $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/settings/unknown-group')
            ->assertNotFound();
    }

    /**
     * Test public static pages access.
     */
    public function test_public_static_pages_visibility(): void
    {
        // 1. Published page
        $page1 = StaticPage::create([
            'slug' => 'about-us',
            'title_ar' => 'من نحن',
            'content_ar' => '# من نحن',
            'is_published' => true,
            'published_at' => now(),
        ]);

        // 2. Unpublished page
        StaticPage::create([
            'slug' => 'draft-page',
            'title_ar' => 'مسودة',
            'content_ar' => '# مسودة',
            'is_published' => false,
        ]);

        // 3. Index returns only published page summaries (content hidden)
        $response = $this->getJson('/api/v1/pages');
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $response->assertJsonPath('data.0.slug', 'about-us');
        $this->assertNull($response->json('data.0.content_ar'));

        // 4. Detail returns full content
        $this->getJson('/api/v1/pages/about-us')
            ->assertStatus(200)
            ->assertJsonPath('data.content_ar', '# من نحن');

        // 5. Unpublished page detail returns 404
        $this->getJson('/api/v1/pages/draft-page')->assertStatus(404);
    }

    public function test_public_static_page_reflects_admin_updates_immediately(): void
    {
        $page = StaticPage::create([
            'slug' => 'about-us',
            'title_ar' => 'من نحن',
            'content_ar' => 'المحتوى القديم',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $this->getJson('/api/v1/pages/about-us')
            ->assertOk()
            ->assertJsonPath('data.content_ar', 'المحتوى القديم');

        $this->actingAs($this->admin)
            ->putJson("/api/v1/admin/pages/{$page->public_id}", [
                'content_ar' => 'المحتوى بعد التعديل من الأدمن',
            ])
            ->assertOk();

        $this->getJson('/api/v1/pages/about-us')
            ->assertOk()
            ->assertJsonPath('data.content_ar', 'المحتوى بعد التعديل من الأدمن');
    }

    public function test_missing_public_static_page_is_not_cached_as_not_found(): void
    {
        $this->getJson('/api/v1/pages/soon-page')->assertNotFound();

        StaticPage::create([
            'slug' => 'soon-page',
            'title_ar' => 'صفحة جديدة',
            'content_ar' => 'ظهرت الآن',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $this->getJson('/api/v1/pages/soon-page')
            ->assertOk()
            ->assertJsonPath('data.content_ar', 'ظهرت الآن');
    }

    public function test_public_static_page_slug_aliases_resolve(): void
    {
        StaticPage::create([
            'slug' => 'about',
            'title_ar' => 'من نحن',
            'content_ar' => 'محتوى من نحن',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $this->getJson('/api/v1/pages/about-us')
            ->assertOk()
            ->assertJsonPath('data.slug', 'about')
            ->assertJsonPath('data.content_ar', 'محتوى من نحن');

        $this->getJson('/api/v1/pages/about')
            ->assertOk()
            ->assertJsonPath('data.slug', 'about');

        StaticPage::create([
            'slug' => 'privacy-policy',
            'title_ar' => 'الخصوصية',
            'content_ar' => 'محتوى الخصوصية',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $this->getJson('/api/v1/pages/privacy')
            ->assertOk()
            ->assertJsonPath('data.slug', 'privacy-policy');
    }

    /**
     * Test admin static pages management and sanitation.
     */
    public function test_admin_static_pages_management(): void
    {
        // 1. Create static page
        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/admin/pages', [
                'slug' => 'privacy-policy',
                'title_ar' => 'سياسة الخصوصية',
                'content_ar' => '<script>alert("hack");</script><h1>سياسة الخصوصية</h1><iframe src="unsafe"></iframe>',
                'is_published' => true,
            ]);

        $response->assertStatus(201);
        $publicId = $response->json('data.public_id');

        // Assert dangerous HTML is sanitized
        $this->assertStringNotContainsString('<script>', $response->json('data.content_ar'));
        $this->assertStringNotContainsString('<iframe>', $response->json('data.content_ar'));
        $this->assertStringContainsString('<h1>سياسة الخصوصية</h1>', $response->json('data.content_ar'));

        // 2. Publish/Unpublish
        $this->actingAs($this->admin)
            ->patchJson("/api/v1/admin/pages/{$publicId}/unpublish")
            ->assertStatus(200)
            ->assertJsonPath('data.is_published', false);

        // 3. Soft delete
        $this->actingAs($this->admin)
            ->deleteJson("/api/v1/admin/pages/{$publicId}")
            ->assertStatus(200);

        $this->assertSoftDeleted('static_pages', ['public_id' => $publicId]);
    }

    /**
     * Test FAQs endpoints.
     */
    public function test_faqs_endpoints(): void
    {
        // 1. Active FAQ
        Faq::create([
            'question_ar' => 'كيف أسجل؟',
            'answer_ar' => 'عبر النقر على زر التسجيل.',
            'category' => 'general',
            'is_active' => true,
        ]);

        // 2. Inactive FAQ
        Faq::create([
            'question_ar' => 'سؤال معطل',
            'answer_ar' => 'إجابة معطلة',
            'is_active' => false,
        ]);

        // 3. Guest list active FAQs
        $response = $this->getJson('/api/v1/faqs');
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $response->assertJsonPath('data.0.question_ar', 'كيف أسجل؟');
        $response->assertJsonStructure(['data' => [['public_id', 'question_ar', 'answer_ar']]]);

        // 4. Admin CRUD
        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/admin/faqs', [
                'question_ar' => 'سؤال جديد؟',
                'answer_ar' => 'إجابة جديدة.',
                'category' => 'account',
                'is_active' => true,
            ]);

        $response->assertStatus(201);
        $publicId = $response->json('data.public_id');

        $this->actingAs($this->admin)
            ->deleteJson("/api/v1/admin/faqs/{$publicId}")
            ->assertStatus(200);

        $this->assertSoftDeleted('faqs', ['public_id' => $publicId]);
    }

    /**
     * Test bootstrap endpoint return payload.
     */
    public function test_bootstrap_endpoint(): void
    {
        Category::factory()->create(['name_ar' => 'ملابس', 'name_en' => 'Clothing', 'slug' => 'clothing']);
        City::factory()->create(['name_ar' => 'نابلس', 'name_en' => 'Nablus']);

        SystemSetting::create([
            'group' => 'general',
            'key' => 'platform_name_ar',
            'value' => 'بالفيرس',
            'type' => 'string',
            'is_public' => true,
        ]);

        StaticPage::create([
            'slug' => 'about-us',
            'title_ar' => 'من نحن',
            'content_ar' => '# من نحن',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/bootstrap');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'settings',
                    'categories',
                    'cities',
                    'pages',
                ],
                'meta',
            ]);

        $response->assertJsonPath('data.settings.general.platform_name_ar', 'بالفيرس');
        $this->assertNotEmpty($response->json('data.categories'));
        $this->assertNotEmpty($response->json('data.cities'));
        $this->assertNotEmpty($response->json('data.pages'));
    }
}
