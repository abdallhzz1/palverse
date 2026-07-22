<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\App;

class PalverseDemoSeeder extends Seeder
{
    /**
     * Run the comprehensive demo dataset.
     */
    public function run(): void
    {
        // 1. Environment Protection — use config() so this works after config:cache
        if (App::environment('production') && ! config('palverse.demo.allow_seeding', false)) {
            $this->command?->error('Demo data seeding is blocked in production. Set PALVERSE_ALLOW_DEMO_SEEDING=true if you must run this.');
            return;
        }

        $this->command->info('Starting Palverse Demo Dataset Seed...');

        // 2. Orchestrate Sub-Seeders
        $this->call([
            RolesAndPermissionsSeeder::class, // Crucial for fresh migrations!
            DemoLocationSeeder::class,
            DemoCategorySeeder::class,
            DemoUserSeeder::class,
            DemoStoreSeeder::class, // Stores, Media, Working Hours, Social Links
            DemoSubscriptionSeeder::class, // Plans and Assignments
            DemoOfferSeeder::class,
            DemoContentSeeder::class, // Settings, FAQs, Pages
            DemoRepresentativeSeeder::class,
            DemoFollowUpSeeder::class,
            DemoStoreReviewSeeder::class,
        ]);

        $this->command->info('Demo Dataset Seeded Successfully!');
    }
}
