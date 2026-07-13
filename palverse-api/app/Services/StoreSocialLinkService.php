<?php

namespace App\Services;

use App\Enums\AuditAction;
use App\Models\Store;
use App\Models\StoreSocialLink;
use Illuminate\Support\Facades\DB;

class StoreSocialLinkService
{
    public function __construct(protected AuditLogService $auditLogService) {}

    /**
     * Creates a social link ensuring only one active link per platform per store.
     */
    public function createLink(Store $store, array $data): StoreSocialLink
    {
        return DB::transaction(function () use ($store, $data) {
            $isActive = $data['is_active'] ?? true;

            if ($isActive) {
                // Ensure no other active link exists for this platform
                $existingActive = $store->socialLinks()
                    ->active()
                    ->where('platform', $data['platform'])
                    ->first();

                if ($existingActive) {
                    throw new \Exception('An active social link for this platform already exists.');
                }
            }

            $link = StoreSocialLink::create([
                'store_id' => $store->id,
                'platform' => $data['platform'],
                'url' => $data['url'],
                'username' => $data['username'] ?? null,
                'sort_order' => $data['sort_order'] ?? 0,
                'is_active' => $isActive,
            ]);

            $this->auditLogService->recordFromRequest(
                action: AuditAction::StoreSocialLinkCreated,
                subject: $store,
                newValues: ['platform' => $data['platform'], 'url' => $data['url']]
            );

            return $link;
        });
    }

    /**
     * Updates a social link ensuring uniqueness rules.
     */
    public function updateLink(StoreSocialLink $link, array $data): StoreSocialLink
    {
        return DB::transaction(function () use ($link, $data) {
            $platform = $data['platform'] ?? $link->platform->value;
            $isActive = array_key_exists('is_active', $data) ? $data['is_active'] : $link->is_active;

            if ($isActive) {
                $existingActive = $link->store->socialLinks()
                    ->active()
                    ->where('platform', $platform)
                    ->where('id', '!=', $link->id)
                    ->first();

                if ($existingActive) {
                    throw new \Exception('An active social link for this platform already exists.');
                }
            }

            $oldValues = $link->only(['platform', 'url', 'username', 'is_active']);
            $link->update($data);

            $this->auditLogService->recordFromRequest(
                action: AuditAction::StoreSocialLinkUpdated,
                subject: $link->store,
                oldValues: $oldValues,
                newValues: $link->only(['platform', 'url', 'username', 'is_active'])
            );

            return $link;
        });
    }

    /**
     * Deletes a social link safely.
     */
    public function deleteLink(StoreSocialLink $link): void
    {
        DB::transaction(function () use ($link) {
            $store = $link->store;
            $platform = $link->platform?->value ?? $link->platform;

            $link->delete();

            $this->auditLogService->recordFromRequest(
                action: AuditAction::StoreSocialLinkDeleted,
                subject: $store,
                oldValues: ['platform' => $platform]
            );
        });
    }
}
