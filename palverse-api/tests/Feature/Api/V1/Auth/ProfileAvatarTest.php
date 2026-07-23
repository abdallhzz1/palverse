<?php

namespace Tests\Feature\Api\V1\Auth;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileAvatarTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        Storage::fake('public');
    }

    public function test_user_can_upload_avatar_and_receive_public_url(): void
    {
        $user = User::factory()->create();
        $user->assignRole('follow_up');

        $response = $this->actingAs($user, 'sanctum')
            ->post('/api/v1/auth/profile/avatar', [
                'avatar' => UploadedFile::fake()->image('avatar.jpg', 200, 200),
            ], [
                'Accept' => 'application/json',
            ]);

        $response->assertOk()
            ->assertJsonStructure([
                'avatar_url',
                'user' => ['avatar_url', 'public_id', 'name'],
            ]);

        $avatarUrl = $response->json('avatar_url');
        $this->assertIsString($avatarUrl);
        $this->assertStringContainsString('/storage/avatars/', $avatarUrl);

        $user->refresh();
        $storedPath = $user->getRawOriginal('avatar_url');
        $this->assertNotEmpty($storedPath);
        $this->assertStringStartsWith('avatars/', $storedPath);
        Storage::disk('public')->assertExists($storedPath);

        $me = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/auth/me');

        $me->assertOk()
            ->assertJsonPath('data.user.avatar_url', $avatarUrl);
    }

    public function test_uploading_avatar_replaces_previous_file(): void
    {
        $user = User::factory()->create([
            'avatar_url' => 'avatars/old.jpg',
        ]);
        Storage::disk('public')->put('avatars/old.jpg', 'old');
        $user->assignRole('follow_up');

        $this->actingAs($user, 'sanctum')
            ->post('/api/v1/auth/profile/avatar', [
                'avatar' => UploadedFile::fake()->image('new.png'),
            ], [
                'Accept' => 'application/json',
            ])
            ->assertOk();

        Storage::disk('public')->assertMissing('avatars/old.jpg');
        $user->refresh();
        Storage::disk('public')->assertExists($user->getRawOriginal('avatar_url'));
    }
}
