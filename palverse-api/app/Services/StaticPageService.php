<?php

namespace App\Services;

use App\Models\StaticPage;
use Illuminate\Support\Facades\DB;

class StaticPageService
{
    /**
     * Create a static page.
     */
    public function createPage(array $data): StaticPage
    {
        return DB::transaction(function () use ($data) {
            $isPublished = filter_var($data['is_published'] ?? false, FILTER_VALIDATE_BOOLEAN);

            if ($isPublished && empty($data['published_at'])) {
                $data['published_at'] = now();
            }

            if (isset($data['content_ar'])) {
                $data['content_ar'] = $this->sanitizeHtml($data['content_ar']);
            }
            if (isset($data['content_en'])) {
                $data['content_en'] = $this->sanitizeHtml($data['content_en']);
            }

            return StaticPage::create($data);
        });
    }

    /**
     * Update a static page.
     */
    public function updatePage(StaticPage $page, array $data): StaticPage
    {
        return DB::transaction(function () use ($page, $data) {
            if (isset($data['is_published'])) {
                $isPublished = filter_var($data['is_published'], FILTER_VALIDATE_BOOLEAN);
                if ($isPublished && (empty($page->published_at) && empty($data['published_at']))) {
                    $data['published_at'] = now();
                }
            }

            if (isset($data['content_ar'])) {
                $data['content_ar'] = $this->sanitizeHtml($data['content_ar']);
            }
            if (isset($data['content_en'])) {
                $data['content_en'] = $this->sanitizeHtml($data['content_en']);
            }

            $page->update($data);

            return $page;
        });
    }

    /**
     * Sanitize dangerous HTML tags and event handlers.
     */
    public function sanitizeHtml(string $content): string
    {
        // Remove script tags and content
        $content = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $content);
        // Remove iframe tags
        $content = preg_replace('/<iframe\b[^>]*>(.*?)<\/iframe>/is', '', $content);
        // Remove object and embed tags
        $content = preg_replace('/<object\b[^>]*>(.*?)<\/object>/is', '', $content);
        $content = preg_replace('/<embed\b[^>]*>(.*?)<\/embed>/is', '', $content);

        // Remove inline event handlers (onmouseover, onclick, onload, etc.)
        $content = preg_replace('/\son[a-zA-Z]+=\s*[\'"][^\'"]*[\'"]/i', '', $content);
        $content = preg_replace('/\son[a-zA-Z]+=\s*[^\s>]+/i', '', $content);

        // Remove javascript: URLs
        $content = preg_replace('/href\s*=\s*[\'"]\s*javascript\s*:[^\'"]*[\'"]/i', 'href="#"', $content);

        return $content;
    }

    /**
     * Publish a static page.
     */
    public function publish(StaticPage $page): StaticPage
    {
        return DB::transaction(function () use ($page) {
            $page->is_published = true;
            if (empty($page->published_at)) {
                $page->published_at = now();
            }
            $page->save();

            return $page;
        });
    }

    /**
     * Unpublish a static page.
     */
    public function unpublish(StaticPage $page): StaticPage
    {
        return DB::transaction(function () use ($page) {
            $page->is_published = false;
            $page->save();

            return $page;
        });
    }

    /**
     * Delete a static page.
     */
    public function deletePage(StaticPage $page): void
    {
        $page->delete();
    }
}
