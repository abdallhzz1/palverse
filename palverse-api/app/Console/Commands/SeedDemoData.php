<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Artisan;

class SeedDemoData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'palverse:seed-demo {--force : Force the operation to run when in production}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed the database with a comprehensive, production-safe demo dataset';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (App::environment('production') && ! $this->option('force') && ! config('palverse.demo.allow_seeding', false)) {
            $this->error('Demo data seeding is blocked in production. Use --force or set PALVERSE_ALLOW_DEMO_SEEDING=true.');
            return Command::FAILURE;
        }

        if ($this->option('force')) {
            config(['palverse.demo.allow_seeding' => true]);
        }

        if (! $this->option('force') && ! $this->confirm('This will seed the database with demo data (Hebron localized). Unrelated existing data will be preserved. Do you wish to continue?')) {
            $this->info('Operation cancelled.');
            return Command::SUCCESS;
        }

        $this->info('Seeding demo data...');

        Artisan::call('db:seed', [
            '--class' => 'Database\\Seeders\\PalverseDemoSeeder',
            '--force' => true,
        ]);

        $this->info($this->getArtisanOutput());

        $this->info('=============================================');
        $this->info('Palverse Demo Data is ready!');
        $this->info('=============================================');
        $this->newLine();
        
        $this->info('Admin Credential:');
        $this->line('Email:    admin@palverse.demo');
        
        if (! App::environment('production')) {
            $this->line('Password: ' . env('PALVERSE_DEMO_ADMIN_PASSWORD', 'DemoAdmin123!'));
        }
        $this->newLine();

        $this->info('Merchant Credential:');
        $this->line('Email:    merchant1@palverse.demo');
        if (! App::environment('production')) {
            $this->line('Password: ' . env('PALVERSE_DEMO_MERCHANT_PASSWORD', 'DemoMerchant123!'));
        }
        $this->newLine();

        $this->info('Representative Credential:');
        $this->line('Email:    representative1@palverse.demo');
        if (! App::environment('production')) {
            $this->line('Password: ' . env('PALVERSE_DEMO_REPRESENTATIVE_PASSWORD', 'DemoRepresentative123!'));
        }
        $this->newLine();

        $this->info('Follow-Up Credential:');
        $this->line('Email:    followup1@palverse.demo');
        if (! App::environment('production')) {
            $this->line('Password: ' . env('PALVERSE_DEMO_FOLLOWUP_PASSWORD', 'DemoFollowUp123!'));
        }
        $this->newLine();

        $this->info('Frontend URLs (Local Defaults):');
        $this->line('Admin Dashboard: http://localhost:3001');
        $this->line('Public Web:      http://localhost:3000');
        $this->newLine();
        
        $this->info('Note: Run `php artisan storage:link` if images do not load.');

        return Command::SUCCESS;
    }

    /**
     * Get the output of the last Artisan command.
     */
    protected function getArtisanOutput(): string
    {
        return trim(Artisan::output());
    }
}
