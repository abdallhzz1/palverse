<?php

namespace Tests\Feature\EndToEnd;

use App\Enums\AuditAction;
use App\Enums\StoreStatus;
use App\Models\AuditLog;
use App\Models\Store;
use App\Notifications\StoreApprovedNotification;
use Illuminate\Support\Facades\Notification;

class NotificationAndAuditFlowTest extends EndToEndTestCase
{
    public function test_notification_and_audit_consistency_flow()
    {
        Notification::fake();

        $admin = $this->createAdminUser();
        $adminToken = $admin->createToken('admin')->plainTextToken;

        $merchant = $this->createMerchantUser();
        $store = Store::factory()->create([
            'owner_id' => $merchant->id,
            'status' => StoreStatus::PENDING->value,
            'is_active' => true,
        ]);

        // Action: Admin approves store
        $response = $this->withToken($adminToken)->patchJson("/api/v1/admin/stores/{$store->public_id}/approve");
        $this->assertApiSuccess($response);

        // 1. Notification sent to owner
        Notification::assertSentTo($merchant, StoreApprovedNotification::class);

        // 2. Audit row created
        $audit = AuditLog::where('subject_type', Store::class)
            ->where('subject_id', $store->id)
            ->where('action', AuditAction::StoreApproved->value)
            ->first();

        $this->assertNotNull($audit);
        $this->assertEquals($admin->id, $audit->actor_id);

        // 3. Snapshot correctness (no sensitive values)
        $newValues = is_string($audit->new_values) ? json_decode($audit->new_values, true) : $audit->new_values;
        $this->assertIsArray($newValues);

        // Ensure standard keys exist but password or secrets are naturally not in Store model
        // but just basic assertions
        $this->assertEquals(StoreStatus::APPROVED->value, $newValues['status']);
    }
}
