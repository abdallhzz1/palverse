<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\FaqResource;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    /**
     * Get active FAQs list.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Faq::active()->ordered();

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('query')) {
            $q = $request->input('query');
            $query->where(function ($b) use ($q) {
                $b->where('question_ar', 'like', "%{$q}%")
                    ->orWhere('question_en', 'like', "%{$q}%")
                    ->orWhere('answer_ar', 'like', "%{$q}%")
                    ->orWhere('answer_en', 'like', "%{$q}%");
            });
        }

        $faqs = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الأسئلة الشائعة بنجاح.',
            'data' => FaqResource::collection($faqs),
            'meta' => [],
        ]);
    }
}
