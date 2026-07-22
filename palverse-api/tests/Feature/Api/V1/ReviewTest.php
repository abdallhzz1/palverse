<?php

namespace Tests\Feature\Api\V1;

use App\Enums\StoreReviewStatus;
use App\Models\Store;
use App\Models\StoreReview;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $merchant;
    private Store $store;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->merchant = User::factory()->create();
        $this->merchant->assignRole('merchant');

        $this->store = Store::factory()->create([
            'owner_id' => $this->merchant->id,
            'status' => 'approved',
            'is_active' => true,
        ]);
        
        // Mock currentSubscription relation manually for testing publicVisible scope
        $this->store->currentSubscription()->create([
            'public_id' => (string) Str::ulid(),
            'subscription_plan_id' => 1,
            'status' => 'active',
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addYear(),
        ]);
    }

    public function test_public_can_submit_review()
    {
        $response = $this->withHeaders([
            'X-Visitor-Token' => 'test-visitor-token'
        ])->postJson("/api/v1/stores/{$this->store->public_id}/reviews", [
            'rating' => 5,
            'reviewer_name' => 'John Doe',
            'comment' => 'Excellent store!',
        ]);

        $response->assertStatus(201);
        $response->assertJsonMissing(['visitor_token_hash']);
        $response->assertJsonMissingPath('review.visitor_token_hash');
        $response->assertJsonMissingPath('review.store_id');
        $this->assertDatabaseHas('store_reviews', [
            'store_id' => $this->store->id,
            'rating' => 5,
            'reviewer_name' => 'John Doe',
            'status' => StoreReviewStatus::PENDING->value,
        ]);
    }

    public function test_public_can_view_published_reviews()
    {
        StoreReview::factory()->create([
            'store_id' => $this->store->id,
            'status' => StoreReviewStatus::PUBLISHED->value,
            'rating' => 4,
        ]);

        $response = $this->getJson("/api/v1/stores/{$this->store->public_id}/reviews");
        
        $response->assertStatus(200);
        $response->assertJsonPath('data.0.rating', 4);
        $response->assertJsonMissing(['visitor_token_hash']);
        $response->assertJsonMissingPath('data.0.store_id');
    }

    public function test_merchant_can_view_reviews_for_their_store()
    {
        StoreReview::factory()->create([
            'store_id' => $this->store->id,
            'status' => StoreReviewStatus::PUBLISHED->value,
        ]);

        $response = $this->actingAs($this->merchant)
            ->getJson("/api/v1/merchant/stores/{$this->store->public_id}/reviews");

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
    }

    public function test_admin_can_moderate_review()
    {
        $review = StoreReview::factory()->create([
            'store_id' => $this->store->id,
            'status' => StoreReviewStatus::PENDING->value,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/v1/admin/reviews/{$review->public_id}/moderate", [
                'action' => 'approve'
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('store_reviews', [
            'id' => $review->id,
            'status' => StoreReviewStatus::PUBLISHED->value,
        ]);
    }
}
