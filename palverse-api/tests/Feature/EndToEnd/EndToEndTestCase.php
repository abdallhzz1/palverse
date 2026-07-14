<?php

namespace Tests\Feature\EndToEnd;

use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;
use Tests\Support\ApiTestAssertions;
use Tests\Support\TestSetupHelpers;
use Tests\TestCase;

abstract class EndToEndTestCase extends TestCase
{
    use ApiTestAssertions, RefreshDatabase, TestSetupHelpers;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RolesAndPermissionsSeeder::class);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
