<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use App\Models\Offer;
use App\Models\Store;
use App\Models\StoreSubscription;
use App\Models\User;
use Illuminate\Console\Command;

class CleanDemoDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'palverse:demo-clean {--force : Force operation without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Safely removes demo users, stores, and related data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (! app()->environment(['local', 'testing', 'development']) && ! $this->option('force')) {
            $this->error('Demo cleanup should only be run in local or development environments.');

            return 1;
        }

        if (! $this->option('force') && ! $this->confirm('This will delete all demo accounts and their associated stores and logs. Are you sure?')) {
            return 0;
        }

        $this->info('Cleaning up demo data...');

        $demoEmails = [
            'admin@palverse.test',
            'merchant1@palverse.test',
            'merchant2@palverse.test',
            'suspended@palverse.test',
        ];

        $demoUsers = User::whereIn('email', $demoEmails)->get();

        foreach ($demoUsers as $user) {
            $stores = Store::where('owner_id', $user->id)->get();
            foreach ($stores as $store) {
                // Delete related models
                Offer::where('store_id', $store->id)->forceDelete();
                StoreSubscription::where('store_id', $store->id)->forceDelete();
                AuditLog::where('subject_type', Store::class)->where('subject_id', $store->id)->forceDelete();
                $store->forceDelete();
            }

            AuditLog::where('actor_id', $user->id)->where('actor_type', User::class)->forceDelete();
            $user->forceDelete();
        }

        // We do not delete Taxonomy (Categories, Cities, Zones) because they use generic names
        // that are likely legitimate data, and updateOrCreate preserves them.
        // Only user-specific demo data is deleted.

        $this->info('Demo data cleanup completed.');

        return 0;
    }
}
