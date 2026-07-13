<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Models\Category;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCategoryTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    private function actingAsAdmin(): static
    {
        return $this->actingAs($this->admin, 'sanctum');
    }

    // ─── ADM-12: List categories ───────────────────────────────────────────────

    public function test_admin_can_list_categories(): void
    {
        Category::factory()->count(3)->create();

        $this->actingAsAdmin()
            ->getJson('/api/v1/admin/categories')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_guest_cannot_access_admin_categories(): void
    {
        $this->getJson('/api/v1/admin/categories')
            ->assertUnauthorized();
    }

    public function test_merchant_cannot_access_admin_categories(): void
    {
        $merchant = User::factory()->create();
        $merchant->assignRole('merchant');

        $this->actingAs($merchant, 'sanctum')
            ->getJson('/api/v1/admin/categories')
            ->assertForbidden();
    }

    // ─── ADM-13: Create category ───────────────────────────────────────────────

    public function test_admin_can_create_category(): void
    {
        $response = $this->actingAsAdmin()
            ->postJson('/api/v1/admin/categories', [
                'name_ar' => 'مطاعم',
                'name_en' => 'Restaurants',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name_ar', 'مطاعم')
            ->assertJsonPath('data.name_en', 'Restaurants');

        $this->assertDatabaseHas('categories', [
            'name_ar' => 'مطاعم',
            'name_en' => 'Restaurants',
            'slug' => 'restaurants',
        ]);
    }

    public function test_slug_falls_back_to_arabic_when_name_en_is_absent(): void
    {
        $this->actingAsAdmin()
            ->postJson('/api/v1/admin/categories', [
                'name_ar' => 'مطاعم',
            ]);

        $this->assertDatabaseHas('categories', ['name_ar' => 'مطاعم']);

        $category = Category::where('name_ar', 'مطاعم')->firstOrFail();
        $this->assertNotEmpty($category->slug);
    }

    public function test_create_category_requires_name_ar(): void
    {
        $this->actingAsAdmin()
            ->postJson('/api/v1/admin/categories', ['name_en' => 'Restaurants'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name_ar']);
    }

    public function test_create_category_rejects_duplicate_name_ar(): void
    {
        Category::factory()->create(['name_ar' => 'مطاعم']);

        $this->actingAsAdmin()
            ->postJson('/api/v1/admin/categories', ['name_ar' => 'مطاعم'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name_ar']);
    }

    // ─── ADM-14: Show category ─────────────────────────────────────────────────

    public function test_admin_can_view_category_by_public_id(): void
    {
        $category = Category::factory()->create();

        $this->actingAsAdmin()
            ->getJson("/api/v1/admin/categories/{$category->public_id}")
            ->assertOk()
            ->assertJsonPath('data.public_id', $category->public_id);
    }

    public function test_show_returns_404_for_unknown_public_id(): void
    {
        $this->actingAsAdmin()
            ->getJson('/api/v1/admin/categories/01NONEXISTENT')
            ->assertNotFound();
    }

    // ─── ADM-15: Update category ───────────────────────────────────────────────

    public function test_admin_can_update_category_names(): void
    {
        $category = Category::factory()->create(['name_en' => 'Old Name']);

        $this->actingAsAdmin()
            ->putJson("/api/v1/admin/categories/{$category->public_id}", [
                'name_en' => 'New Name',
            ])
            ->assertOk()
            ->assertJsonPath('data.name_en', 'New Name');
    }

    public function test_slug_is_not_changed_on_update(): void
    {
        $category = Category::factory()->create(['name_en' => 'Old Name']);
        $originalSlug = $category->slug;

        $this->actingAsAdmin()
            ->putJson("/api/v1/admin/categories/{$category->public_id}", [
                'name_en' => 'New Name',
            ]);

        $this->assertEquals($originalSlug, $category->fresh()->slug);
    }

    // ─── ADM-16: Delete category ───────────────────────────────────────────────

    public function test_admin_can_delete_category_without_stores(): void
    {
        $category = Category::factory()->create();

        $this->actingAsAdmin()
            ->deleteJson("/api/v1/admin/categories/{$category->public_id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }
}
