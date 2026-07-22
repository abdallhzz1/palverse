<?php

namespace Tests\Feature\EndToEnd;

use App\Models\Category;
use App\Models\City;
use App\Models\Store;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class DemoSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // We must enable the demo seeder variable for testing
        putenv('PALVERSE_ALLOW_DEMO_SEEDING=true');
    }

    public function test_demo_seeder_runs_successfully_and_is_idempotent()
    {
        // Setup base data (Roles, Permissions, etc.)
        $this->seed();

        // First run
        $exitCode = Artisan::call('palverse:seed-demo', ['--force' => true]);
        $this->assertEquals(0, $exitCode);

        // Assert data exists
        $this->assertDatabaseHas('users', ['email' => 'admin@palverse.demo']);
        $this->assertDatabaseHas('users', ['email' => 'merchant1@palverse.demo']);
        $this->assertDatabaseHas('users', ['email' => 'representative1@palverse.demo']);
        $this->assertDatabaseHas('users', ['email' => 'followup1@palverse.demo']);

        $hebron = City::where('name_en', 'Hebron')->first();
        $this->assertNotNull($hebron);
        
        $zonesCount = Zone::where('city_id', $hebron->id)->count();
        $this->assertGreaterThanOrEqual(22, $zonesCount);

        $this->assertGreaterThanOrEqual(12, Category::count());
        $this->assertGreaterThanOrEqual(18, Store::count());

        // Capture counts
        $userCount = User::count();
        $storeCount = Store::count();
        $categoryCount = Category::count();

        // Second run (Idempotency check)
        $exitCode2 = Artisan::call('palverse:seed-demo', ['--force' => true]);
        $this->assertEquals(0, $exitCode2);

        // Counts should be identical
        $this->assertEquals($userCount, User::count(), 'Users were duplicated');
        $this->assertEquals($storeCount, Store::count(), 'Stores were duplicated');
        $this->assertEquals($categoryCount, Category::count(), 'Categories were duplicated');
    }

    public function test_demo_seeder_blocked_in_production_without_flag()
    {
        // Simulate production without the flag
        putenv('PALVERSE_ALLOW_DEMO_SEEDING=false');
        $this->app->detectEnvironment(function () {
            return 'production';
        });

        $exitCode = Artisan::call('palverse:seed-demo');
        $this->assertNotEquals(0, $exitCode); // Should fail
    }
}
