<?php

namespace Database\Seeders;

use App\Enums\StoreReviewStatus;
use App\Models\Store;
use App\Models\StoreReview;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoStoreReviewSeeder extends Seeder
{
    public function run(): void
    {
        $stores = Store::take(5)->get();
        $admin = User::role('admin')->first();

        foreach ($stores as $store) {
            for ($i = 1; $i <= 3; $i++) {
                StoreReview::create([
                    'store_id' => $store->id,
                    'rating' => rand(3, 5),
                    'reviewer_name' => "Visitor {$i}",
                    'comment' => "Great store! Highly recommended. #{$i}",
                    'visitor_token_hash' => hash('sha256', "visitor-token-{$store->id}-{$i}"),
                    'status' => StoreReviewStatus::PUBLISHED->value,
                    'reviewed_by' => $admin?->id,
                    'published_at' => now()->subDays(rand(1, 10)),
                ]);
            }
            
            // Add a pending review
            StoreReview::create([
                'store_id' => $store->id,
                'rating' => rand(1, 3),
                'reviewer_name' => "Visitor P",
                'comment' => "Could be better.",
                'visitor_token_hash' => hash('sha256', "visitor-token-pending-{$store->id}"),
                'status' => StoreReviewStatus::PENDING->value,
            ]);
        }
    }
}
