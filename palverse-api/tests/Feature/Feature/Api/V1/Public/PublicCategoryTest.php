<?php

namespace Tests\Feature\Api\V1\Public;

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCategoryTest extends TestCase
{
    use RefreshDatabase;

    // ─── PUB-01: List categories ───────────────────────────────────────────────

    public function test_guest_can_list_categories(): void
    {
        Category::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/categories');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data');
    }

    public function test_category_list_returns_expected_fields(): void
    {
        $category = Category::factory()->create([
            'name_ar' => 'مطاعم',
            'name_en' => 'Restaurants',
        ]);

        $response = $this->getJson('/api/v1/categories');

        $response
            ->assertOk()
            ->assertJsonFragment([
                'slug' => $category->slug,
                'name_ar' => 'مطاعم',
                'name_en' => 'Restaurants',
            ]);
    }

    public function test_category_list_does_not_expose_internal_id(): void
    {
        Category::factory()->create();

        $response = $this->getJson('/api/v1/categories');

        $this->assertArrayNotHasKey('id', $response->json('data.0'));
    }

    // ─── PUB-02: Get category by slug ─────────────────────────────────────────

    public function test_guest_can_view_category_by_slug(): void
    {
        $category = Category::factory()->create();

        $response = $this->getJson("/api/v1/categories/{$category->slug}");

        $response
            ->assertOk()
            ->assertJsonPath('data.slug', $category->slug)
            ->assertJsonPath('data.public_id', $category->public_id);
    }

    public function test_category_show_returns_404_for_unknown_slug(): void
    {
        $this->getJson('/api/v1/categories/nonexistent-slug')
            ->assertNotFound();
    }
}
