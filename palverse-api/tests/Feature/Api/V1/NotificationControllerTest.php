<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function createNotification(User $user, array $data = [], ?string $readAt = null)
    {
        $id = Str::uuid()->toString();
        $user->notifications()->create([
            'id' => $id,
            'type' => 'App\Notifications\StoreApprovedNotification',
            'data' => array_merge([
                'type' => 'store_approved',
                'title_ar' => 'Test title ar',
                'title_en' => 'Test title en',
                'message_ar' => 'Test message ar',
                'message_en' => 'Test message en',
                'entity_type' => 'store',
                'entity_public_id' => 'store_id_123',
                'action_url' => '/merchant/stores/store-slug',
                'metadata' => ['event_key' => 'some_key'],
            ], $data),
            'read_at' => $readAt,
        ]);

        return $id;
    }

    public function test_guest_cannot_access_notifications()
    {
        $response = $this->getJson('/api/v1/notifications');
        $response->assertStatus(401);
    }

    public function test_user_can_list_own_notifications()
    {
        $user = User::factory()->create();
        $this->createNotification($user);
        $this->createNotification($user, ['type' => 'store_rejected']);

        $response = $this->actingAs($user)->getJson('/api/v1/notifications');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id', 'type', 'title_ar', 'title_en', 'message_ar', 'message_en',
                        'entity_type', 'entity_public_id', 'action_url', 'metadata', 'is_read', 'read_at', 'created_at',
                    ],
                ],
                'meta',
            ])
            ->assertJsonCount(2, 'data');

        // Metadata should not expose event_key
        $this->assertArrayNotHasKey('event_key', $response->json('data.0.metadata'));
    }

    public function test_user_cannot_see_others_notifications()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $this->createNotification($user1);

        $response = $this->actingAs($user2)->getJson('/api/v1/notifications');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_unread_filter_works()
    {
        $user = User::factory()->create();
        $this->createNotification($user); // unread
        $this->createNotification($user, [], now()->toDateTimeString()); // read

        $response = $this->actingAs($user)->getJson('/api/v1/notifications?unread=1');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $this->assertFalse($response->json('data.0.is_read'));
    }

    public function test_type_filter_works()
    {
        $user = User::factory()->create();
        $this->createNotification($user, ['type' => 'store_approved']);
        $this->createNotification($user, ['type' => 'store_rejected']);

        $response = $this->actingAs($user)->getJson('/api/v1/notifications?type=store_rejected');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'store_rejected');
    }

    public function test_unread_count_is_correct()
    {
        $user = User::factory()->create();
        $this->createNotification($user);
        $this->createNotification($user);
        $this->createNotification($user, [], now()->toDateTimeString());

        $response = $this->actingAs($user)->getJson('/api/v1/notifications/unread-count');

        $response->assertStatus(200)
            ->assertJsonPath('data.unread_count', 2);
    }

    public function test_user_can_mark_notification_as_read()
    {
        $user = User::factory()->create();
        $id = $this->createNotification($user);

        $response = $this->actingAs($user)->patchJson("/api/v1/notifications/{$id}/read");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_read', true)
            ->assertJsonPath('data.id', $id);

        $this->assertNotNull($user->notifications()->first()->read_at);
    }

    public function test_user_cannot_mark_others_notification_as_read()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $id = $this->createNotification($user1);

        $response = $this->actingAs($user2)->patchJson("/api/v1/notifications/{$id}/read");

        $response->assertStatus(404);
    }

    public function test_user_can_mark_all_as_read()
    {
        $user = User::factory()->create();
        $this->createNotification($user);
        $this->createNotification($user);

        $response = $this->actingAs($user)->patchJson('/api/v1/notifications/read-all');

        $response->assertStatus(200)
            ->assertJsonPath('data.marked_count', 2);

        $this->assertEquals(0, $user->unreadNotifications()->count());
    }
}
