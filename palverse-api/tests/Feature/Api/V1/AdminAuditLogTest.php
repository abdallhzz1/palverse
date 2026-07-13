<?php

namespace Tests\Feature\Api\V1;

use App\Enums\AuditAction;
use App\Models\AuditLog;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuditLogTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $merchant;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->merchant = User::factory()->create();
        $this->merchant->assignRole('merchant');
    }

    public function test_admin_can_list_audit_logs()
    {
        AuditLog::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)->getJson('/api/v1/admin/audit-logs');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'public_id',
                        'action',
                        'actor',
                        'subject',
                        'route',
                        'method',
                        'ip_address',
                        'user_agent',
                        'request_id',
                        'old_values',
                        'new_values',
                        'metadata',
                        'created_at',
                    ],
                ],
                'meta',
                'links',
            ]);
    }

    public function test_merchant_cannot_list_audit_logs()
    {
        $response = $this->actingAs($this->merchant)->getJson('/api/v1/admin/audit-logs');
        $response->assertStatus(403);
    }

    public function test_admin_can_filter_audit_logs_by_action()
    {
        AuditLog::factory()->create(['action' => AuditAction::UserSuspended->value]);
        AuditLog::factory()->create(['action' => AuditAction::StoreApproved->value]);

        $response = $this->actingAs($this->admin)->getJson('/api/v1/admin/audit-logs?action='.AuditAction::UserSuspended->value);

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals(AuditAction::UserSuspended->value, $response->json('data.0.action'));
    }

    public function test_admin_can_view_audit_log_details()
    {
        $log = AuditLog::factory()->create();

        $response = $this->actingAs($this->admin)->getJson("/api/v1/admin/audit-logs/{$log->public_id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.public_id', $log->public_id);
    }

    public function test_audit_logs_cannot_be_updated()
    {
        $log = AuditLog::factory()->create();

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Audit logs are append-only and cannot be modified.');

        $log->update(['ip_address' => '127.0.0.1']);
    }

    public function test_audit_logs_cannot_be_deleted()
    {
        $log = AuditLog::factory()->create();

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Audit logs are append-only and cannot be deleted.');

        $log->delete();
    }
}
