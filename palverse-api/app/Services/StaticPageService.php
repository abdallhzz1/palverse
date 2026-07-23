<?php

namespace App\Services;

use App\Enums\AuditAction;
use App\Enums\StaticPageType;
use App\Models\StaticPage;
use App\Support\StaticPageMeta;
use Illuminate\Support\Facades\DB;

class StaticPageService
{
    public function __construct(protected AuditLogService $auditLogService) {}

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

            if (! isset($data['page_type'])) {
                $data['page_type'] = in_array($data['slug'] ?? '', ['contact', 'contact-us'], true)
                    ? StaticPageType::Contact->value
                    : StaticPageType::Content->value;
            }

            if (($data['page_type'] ?? null) === StaticPageType::Contact->value) {
                $data['meta'] = array_merge(
                    StaticPageMeta::defaultContactMeta(),
                    StaticPageMeta::sanitize($data['meta'] ?? null) ?? []
                );
            } elseif (array_key_exists('meta', $data)) {
                $data['meta'] = StaticPageMeta::sanitize($data['meta']);
            }

            $page = StaticPage::create($data);

            $this->auditLogService->recordFromRequest(
                action: AuditAction::PageCreated,
                subject: $page,
                newValues: $page->only(['slug', 'title_ar', 'title_en', 'is_published']) // Omitting huge content payloads
            );

            return $page;
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

            if (array_key_exists('meta', $data)) {
                $incoming = StaticPageMeta::sanitize($data['meta']) ?? [];
                $pageType = $data['page_type'] ?? $page->page_type;
                if ($pageType === StaticPageType::Contact->value) {
                    $data['meta'] = array_merge(
                        StaticPageMeta::defaultContactMeta(),
                        is_array($page->meta) ? $page->meta : [],
                        $incoming
                    );
                } else {
                    $data['meta'] = $incoming === [] ? null : $incoming;
                }
            }

            $oldValues = $page->only(array_keys($data));
            $page->update($data);

            // Filter out content from being stored entirely unless necessary, or just store safe keys
            $safeOld = collect($oldValues)->except(['content_ar', 'content_en'])->toArray();
            $safeNew = collect($data)->except(['content_ar', 'content_en'])->toArray();

            $this->auditLogService->recordFromRequest(
                action: AuditAction::PageUpdated,
                subject: $page,
                oldValues: $safeOld,
                newValues: $safeNew
            );

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
            $oldStatus = $page->is_published;
            $page->is_published = true;
            if (empty($page->published_at)) {
                $page->published_at = now();
            }
            $page->save();

            $this->auditLogService->recordFromRequest(
                action: AuditAction::PagePublished,
                subject: $page,
                oldValues: ['is_published' => $oldStatus],
                newValues: ['is_published' => true]
            );

            return $page;
        });
    }

    /**
     * Unpublish a static page.
     */
    public function unpublish(StaticPage $page): StaticPage
    {
        return DB::transaction(function () use ($page) {
            $oldStatus = $page->is_published;
            $page->is_published = false;
            $page->save();

            $this->auditLogService->recordFromRequest(
                action: AuditAction::PageUnpublished,
                subject: $page,
                oldValues: ['is_published' => $oldStatus],
                newValues: ['is_published' => false]
            );

            return $page;
        });
    }

    public function deletePage(StaticPage $page): void
    {
        DB::transaction(function () use ($page) {
            $page->delete();

            $this->auditLogService->recordFromRequest(
                action: AuditAction::PageDeleted,
                subject: $page,
                oldValues: $page->only(['slug', 'title_en', 'title_ar'])
            );
        });
    }
}
