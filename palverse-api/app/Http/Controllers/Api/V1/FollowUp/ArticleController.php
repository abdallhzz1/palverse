<?php

namespace App\Http\Controllers\Api\V1\FollowUp;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Article::class);

        $articles = Article::orderBy('created_at', 'desc')->paginate();

        return response()->json([
            'success' => true,
            'data' => $articles->items(),
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'per_page' => $articles->perPage(),
                'total' => $articles->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Article::class);

        $validated = $request->validate([
            'title_ar' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'excerpt_ar' => 'nullable|string',
            'excerpt_en' => 'nullable|string',
            'content_ar' => 'nullable|string',
            'content_en' => 'nullable|string',
            'cover_image' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
        ]);

        $validated['author_id'] = $request->user()->id;

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('articles', 'public');
            $validated['cover_image'] = asset('storage/' . $path);
        }

        if ($request->is_published) {
            $validated['published_at'] = now();
        }

        $article = Article::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Article created successfully',
            'data' => $article,
        ], 201);
    }

    public function show(string $publicId): JsonResponse
    {
        $article = Article::where('public_id', $publicId)->firstOrFail();
        $this->authorize('view', $article);

        return response()->json([
            'success' => true,
            'data' => $article,
        ]);
    }

    public function update(Request $request, string $publicId): JsonResponse
    {
        $article = Article::where('public_id', $publicId)->firstOrFail();
        $this->authorize('update', $article);

        $validated = $request->validate([
            'title_ar' => 'sometimes|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'excerpt_ar' => 'nullable|string',
            'excerpt_en' => 'nullable|string',
            'content_ar' => 'nullable|string',
            'content_en' => 'nullable|string',
            'cover_image' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
        ]);

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('articles', 'public');
            $validated['cover_image'] = asset('storage/' . $path);
        }

        // Handle published_at logic
        if (isset($validated['is_published'])) {
            if ($validated['is_published'] && !$article->is_published) {
                $validated['published_at'] = now();
            } elseif (!$validated['is_published']) {
                $validated['published_at'] = null;
            }
        }

        $article->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Article updated successfully',
            'data' => $article,
        ]);
    }

    public function destroy(string $publicId): JsonResponse
    {
        $article = Article::where('public_id', $publicId)->firstOrFail();
        $this->authorize('delete', $article);

        $article->delete();

        return response()->json([
            'success' => true,
            'message' => 'Article deleted successfully',
        ]);
    }
}
