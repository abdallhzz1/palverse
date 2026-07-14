<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class SeedDemoDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'palverse:demo-seed {--force : Force the operation to run when in production}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed the database with deterministic demo data for development';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (! app()->environment(['local', 'testing', 'development']) && ! $this->option('force')) {
            $this->error('Demo data should only be seeded in local or development environments.');
            $this->error('Use --force to override this warning if you are sure.');

            return 1;
        }

        if (! config('palverse.demo.seed_enabled')) {
            $this->warn('PALVERSE_SEED_DEMO_DATA is false in your environment.');
            if (! $this->confirm('Do you want to temporarily enable it for this command?', true)) {
                return 0;
            }
            config(['palverse.demo.seed_enabled' => true]);
        }

        $this->info('Running DemoDataSeeder...');

        $exitCode = Artisan::call('db:seed', [
            '--class' => 'DemoDataSeeder',
            '--force' => $this->option('force'),
        ]);

        $this->line(Artisan::output());

        if ($exitCode === 0) {
            $this->info('Demo data seeded successfully!');
            $this->newLine();
            $this->info('Admin Account: admin@palverse.test');
            $this->info('Merchant 1: merchant1@palverse.test');
            $this->info('Merchant 2: merchant2@palverse.test');
            $this->info('Default Password: '.config('palverse.demo.password'));
        }

        return $exitCode;
    }
}
