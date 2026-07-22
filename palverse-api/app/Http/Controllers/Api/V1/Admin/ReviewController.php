<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\StoreReviewStatus;
use App\Http\Controllers\Controller;
use App\Models\StoreReview;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status');

        $query = StoreReview::with(['store:id,public_id,name_ar,name_en']);

        if ($status) {
            $query->where('status', $status);
        }

        $reviews = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($reviews);
    }

    public function show(string $publicId)
    {
        $review = StoreReview::with(['store:id,public_id,name_ar,name_en'])
            ->where('public_id', $publicId)
            ->firstOrFail();

        return response()->json([
            'data' => $review
        ]);
    }

    public function moderate(Request $request, string $publicId, string $action)
    {
        if (!in_array($action, ['approve', 'reject', 'hide', 'restore'])) {
            return response()->json(['message' => 'Invalid action'], 400);
        }

        $review = StoreReview::where('public_id', $publicId)->firstOrFail();

        $review->reviewed_by = $request->user()->id;

        switch ($action) {
            case 'approve':
                $review->status = StoreReviewStatus::PUBLISHED->value;
                $review->published_at = now();
                $review->hidden_at = null;
                break;
            case 'reject':
                $review->status = StoreReviewStatus::REJECTED->value;
                break;
            case 'hide':
                $review->status = StoreReviewStatus::HIDDEN->value;
                $review->hidden_at = now();
                break;
            case 'restore':
                $review->status = StoreReviewStatus::PENDING->value;
                $review->published_at = null;
                $review->hidden_at = null;
                break;
        }

        $review->save();

        return response()->json([
            'message' => "Review {$action}d successfully.",
            'review' => $review
        ]);
    }
}
