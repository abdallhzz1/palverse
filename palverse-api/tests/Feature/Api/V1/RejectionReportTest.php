<?php

namespace Tests\Feature\Api\V1;

use App\Enums\RefusalReasonCode;
use App\Models\RepresentativeRejectionReport;
use App\Models\User;
use App\Models\Zone;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RejectionReportTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $representative;

    protected User $otherRepresentative;

    protected Zone $zone;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->representative = User::factory()->create();
        $this->representative->assignRole('representative');

        $this->otherRepresentative = User::factory()->create();
        $this->otherRepresentative->assignRole('representative');

        $this->zone = Zone::factory()->create();
    }

    public function test_representative_list_returns_flat_data_array_with_notes(): void
    {
        RepresentativeRejectionReport::create([
            'representative_id' => $this->representative->id,
            'zone_id' => $this->zone->id,
            'business_name' => 'محل تجريبي',
            'owner_name' => 'أحمد',
            'phone' => '0590000000',
            'refusal_reason_code' => RefusalReasonCode::NOT_INTERESTED,
            'refusal_reason_text' => null,
            'contacted_at' => now(),
            'follow_up_required' => true,
            'notes' => 'ملاحظات عامة عن الزيارة',
        ]);

        RepresentativeRejectionReport::create([
            'representative_id' => $this->otherRepresentative->id,
            'zone_id' => $this->zone->id,
            'business_name' => 'محل آخر',
            'refusal_reason_code' => RefusalReasonCode::PRICE,
            'contacted_at' => now(),
            'follow_up_required' => false,
            'notes' => 'لا يجب أن يظهر للمندوب الأول',
        ]);

        $response = $this->actingAs($this->representative)
            ->getJson('/api/v1/representative/rejection-reports')
            ->assertOk();

        $data = $response->json('data');
        $this->assertIsArray($data);
        $this->assertCount(1, $data);
        $this->assertSame('محل تجريبي', $data[0]['business_name']);
        $this->assertSame('ملاحظات عامة عن الزيارة', $data[0]['notes']);
        $this->assertArrayHasKey('meta', $response->json());
    }

    public function test_admin_list_includes_notes_in_flat_data_array(): void
    {
        RepresentativeRejectionReport::create([
            'representative_id' => $this->representative->id,
            'zone_id' => $this->zone->id,
            'business_name' => 'محل إداري',
            'refusal_reason_code' => RefusalReasonCode::OTHER,
            'refusal_reason_text' => 'سبب خاص',
            'contacted_at' => now(),
            'follow_up_required' => false,
            'notes' => 'ملاحظات الأدمن يجب أن تظهر',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/admin/rejection-reports')
            ->assertOk();

        $data = $response->json('data');
        $this->assertIsArray($data);
        $this->assertCount(1, $data);
        $this->assertSame('ملاحظات الأدمن يجب أن تظهر', $data[0]['notes']);
        $this->assertSame($this->representative->name, $data[0]['representative']['full_name']);
    }
}
