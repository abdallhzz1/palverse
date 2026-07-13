<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\AdminFaqIndexRequest;
use App\Http\Requests\Api\V1\Admin\StoreFaqRequest;
use App\Http\Requests\Api\V1\Admin\UpdateFaqRequest;
use App\Http\Resources\Api\V1\FaqResource;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;

class FaqController extends Controller
{
    /**
     * List FAQs for admin.
     */
    public function index(AdminFaqIndexRequest $request): JsonResponse
    {
        $query = Faq::query();

        if ($request->filled('query')) {
            $q = $request->input('query');
            $query->where(function ($b) use ($q) {
                $b->where('question_ar', 'like', "%{$q}%")
                    ->orWhere('question_en', 'like', "%{$q}%")
                    ->orWhere('answer_ar', 'like', "%{$q}%")
                    ->orWhere('answer_en', 'like', "%{$q}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $sort = $request->input('sort', 'sort_order');
        $direction = $request->input('direction', 'asc');
        $query->orderBy($sort, $direction);

        $perPage = $request->input('per_page', 15);
        $faqs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'تم جلب الأسئلة الشائعة بنجاح.',
            'data' => FaqResource::collection($faqs)->response()->getData(true)['data'],
            'meta' => FaqResource::collection($faqs)->response()->getData(true)['meta'],
        ]);
    }

    /**
     * Store a new FAQ.
     */
    public function store(StoreFaqRequest $request): JsonResponse
    {
        $faq = Faq::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء السؤال الشائع بنجاح.',
            'data' => new FaqResource($faq),
            'meta' => [],
        ], 201);
    }

    /**
     * Show FAQ detail.
     */
    public function show(string $publicId): JsonResponse
    {
        $faq = Faq::where('public_id', $publicId)->first();
        if (! $faq) {
            return response()->json([
                'success' => false,
                'message' => 'السؤال الشائع غير موجود.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم جلب تفاصيل السؤال الشائع بنجاح.',
            'data' => new FaqResource($faq),
            'meta' => [],
        ]);
    }

    /**
     * Update an FAQ.
     */
    public function update(UpdateFaqRequest $request, string $publicId): JsonResponse
    {
        $faq = Faq::where('public_id', $publicId)->first();
        if (! $faq) {
            return response()->json([
                'success' => false,
                'message' => 'السؤال الشائع غير موجود.',
            ], 404);
        }

        $faq->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث السؤال الشائع بنجاح.',
            'data' => new FaqResource($faq->fresh()),
            'meta' => [],
        ]);
    }

    /**
     * Soft delete an FAQ.
     */
    public function destroy(string $publicId): JsonResponse
    {
        $faq = Faq::where('public_id', $publicId)->first();
        if (! $faq) {
            return response()->json([
                'success' => false,
                'message' => 'السؤال الشائع غير موجود.',
            ], 404);
        }

        $faq->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف السؤال الشائع بنجاح.',
            'data' => [],
            'meta' => [],
        ]);
    }
}
