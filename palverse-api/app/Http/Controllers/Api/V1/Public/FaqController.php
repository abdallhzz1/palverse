<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\FaqResource;
use App\Models\Faq;
use App\Services\PublicReferenceCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function __construct(protected PublicReferenceCacheService $cacheService) {}

    /**
     * Get active FAQs list.
     */
    public function index(Request $request): JsonResponse
    {
        $params = [
            'category' => $request->input('category'),
            'query' => $request->input('query'),
        ];

        $data = $this->cacheService->remember('faqs', $params, function () use ($request) {
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

            return FaqResource::collection($faqs)->resolve();
        });

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الأسئلة الشائعة بنجاح.',
            'data' => $data,
            'meta' => [],
        ]);
    }
}
