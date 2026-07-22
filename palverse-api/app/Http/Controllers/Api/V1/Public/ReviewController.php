<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Enums\StoreReviewStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Public\StoreReviewRequest;
use App\Http\Resources\Api\V1\Public\StoreReviewResource;
use App\Models\Store;
use App\Models\StoreReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use App\Services\ProfanityFilterService;

class ReviewController extends Controller
{
    public function index(string $slug)
    {
        $store = Store::publicVisible()->where(function ($q) use ($slug) {
            $q->where('slug', $slug)->orWhere('public_id', $slug);
        })->firstOrFail();

        $reviews = $store->publishedReviews()
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return StoreReviewResource::collection($reviews);
    }

    public function summary(string $slug)
    {
        $store = Store::publicVisible()->where(function ($q) use ($slug) {
            $q->where('slug', $slug)->orWhere('public_id', $slug);
        })->firstOrFail();

        $publishedReviews = $store->publishedReviews();

        $totalCount = $publishedReviews->count();
        $averageRating = $totalCount > 0 ? (float) $publishedReviews->avg('rating') : 0.0;

        $distribution = [
            1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0,
        ];

        $counts = $store->publishedReviews()
            ->selectRaw('rating, count(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating');

        foreach ($counts as $rating => $count) {
            $distribution[$rating] = $count;
        }

        return response()->json([
            'average_rating' => round($averageRating, 1),
            'total_count' => $totalCount,
            'distribution' => $distribution,
        ]);
    }

    public function store(StoreReviewRequest $request, string $slug)
    {
        $store = Store::publicVisible()->where(function ($q) use ($slug) {
            $q->where('slug', $slug)->orWhere('public_id', $slug);
        })->firstOrFail();

        $ip = $request->ip();
        $rateLimitKey = "store_review:{$ip}";

        if (RateLimiter::tooManyAttempts($rateLimitKey, 5)) {
            return response()->json(['message' => 'Too many review attempts.'], 429);
        }

        $visitorToken = $request->header('X-Visitor-Token');
        if (! $visitorToken) {
            return response()->json(['message' => 'Visitor token missing.'], 400);
        }

        $tokenHash = hash('sha256', $visitorToken);
        $exists = StoreReview::where('store_id', $store->id)
            ->where('visitor_token_hash', $tokenHash)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'You have already reviewed this store.'], 409);
        }

        RateLimiter::hit($rateLimitKey, 86400); // 24 hours

        $review = new StoreReview($request->validated());
        $review->store_id = $store->id;
        $review->visitor_token_hash = $tokenHash;

        $filterService = app(ProfanityFilterService::class);
        $isClean = $filterService->isClean($review->comment);

        if ($isClean) {
            $review->status = StoreReviewStatus::PUBLISHED->value;
            $review->published_at = now();
        } else {
            $review->status = StoreReviewStatus::PENDING->value;
        }

        $review->save();

        return response()->json([
            'message' => 'Review submitted successfully and is pending approval.',
            'review' => new StoreReviewResource($review),
        ], 201);
    }
}
