<?php

namespace Tests\Unit;

use App\Support\PublicStorageUrl;
use Tests\TestCase;

class PublicStorageUrlTest extends TestCase
{
    public function test_to_path_handles_relative_and_absolute_values(): void
    {
        config(['app.url' => 'https://api.example.com']);

        $this->assertSame('avatars/a.jpg', PublicStorageUrl::toPath('avatars/a.jpg'));
        $this->assertSame('avatars/a.jpg', PublicStorageUrl::toPath('storage/avatars/a.jpg'));
        $this->assertSame(
            'avatars/a.jpg',
            PublicStorageUrl::toPath('https://api.example.com/storage/avatars/a.jpg')
        );
        $this->assertNull(PublicStorageUrl::toPath(null));
    }

    public function test_resolve_builds_url_from_relative_path(): void
    {
        config([
            'app.url' => 'https://api.example.com',
            'filesystems.disks.public.url' => 'https://api.example.com/storage',
        ]);

        $this->assertSame(
            'https://api.example.com/storage/avatars/a.jpg',
            PublicStorageUrl::resolve('avatars/a.jpg')
        );
    }
}
