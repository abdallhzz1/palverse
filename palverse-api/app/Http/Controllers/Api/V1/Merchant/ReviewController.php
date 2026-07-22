<?php

namespace App\Http\Controllers\Api\V1\Merchant;

use App\Enums\StoreReviewStatus;
use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request, string $storePublicId)
    {
        $store = Store::where('public_id', $storePublicId)
            ->where('owner_id', $request->user()->id)
            ->firstOrFail();

        $reviews = $store->reviews()
            ->whereIn('status', [StoreReviewStatus::PUBLISHED->value, StoreReviewStatus::HIDDEN->value])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($reviews);
    }

    public function summary(Request $request, string $storePublicId)
    {
        $store = Store::where('public_id', $storePublicId)
            ->where('owner_id', $request->user()->id)
            ->firstOrFail();

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

    public function report(Request $request, string $storePublicId, string $reviewPublicId)
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $store = Store::where('public_id', $storePublicId)
            ->where('owner_id', $request->user()->id)
            ->firstOrFail();

        $review = $store->reviews()
            ->where('public_id', $reviewPublicId)
            ->where('status', StoreReviewStatus::PUBLISHED->value)
            ->firstOrFail();

        $review->is_reported = true;
        $review->report_reason = $request->reason;
        $review->reported_at = now();
        $review->status = StoreReviewStatus::PENDING->value;
        $review->save();

        return response()->json([
            'message' => 'تم استلام بلاغك وإخفاء التقييم للمراجعة',
            'data' => $review
        ]);
    }
}
