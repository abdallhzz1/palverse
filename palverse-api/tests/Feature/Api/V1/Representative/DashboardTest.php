<?php

namespace Tests\Feature\Api\V1\Representative;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $representative;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        $this->representative = User::factory()->create();
        $this->representative->assignRole('representative');
    }

    public function test_representative_can_view_dashboard_summary(): void
    {
        $response = $this->actingAs($this->representative, 'sanctum')
            ->getJson('/api/v1/representative/dashboard/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'summary' => [
                        'zones',
                        'requests',
                        'commissions',
                        'receipts',
                    ],
                    'activity' => [
                        'recent_requests',
                        'recent_commissions',
                        'recent_receipts',
                    ]
                ]
            ]);
    }

    public function test_merchant_cannot_view_representative_dashboard(): void
    {
        $merchant = User::factory()->create();
        $merchant->assignRole('merchant');

        $response = $this->actingAs($merchant, 'sanctum')
            ->getJson('/api/v1/representative/dashboard/summary');

        $response->assertStatus(403);
    }
}
