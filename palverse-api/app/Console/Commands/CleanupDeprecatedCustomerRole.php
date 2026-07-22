<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class CleanupDeprecatedCustomerRole extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'palverse:cleanup-deprecated-customer-role {--force : Force the operation to run when in production} {--dry-run : Only show what would be done}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Safely clean up the deprecated customer role and associated demo accounts';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (App::environment('production') && ! $this->option('force')) {
            $this->error('Cleanup is blocked in production. Use --force to override.');
            return Command::FAILURE;
        }

        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('Running in DRY-RUN mode. No changes will be made.');
        }

        $customerRole = Role::where('name', 'customer')->where('guard_name', 'web')->first();

        if (! $customerRole) {
            $this->info('The customer role does not exist. Nothing to do.');
            return Command::SUCCESS;
        }

        $usersWithCustomerRole = User::role('customer')->get();
        $this->info("Found {$usersWithCustomerRole->count()} users with the customer role.");

        DB::beginTransaction();

        try {
            foreach ($usersWithCustomerRole as $user) {
                // Determine if it's a known demo user
                $isDemo = preg_match('/^customer\d+@palverse\.demo$/', $user->email);

                if ($isDemo) {
                    if ($dryRun) {
                        $this->line("DRY RUN: Would delete demo user {$user->email}");
                    } else {
                        // Delete demo user
                        $user->forceDelete();
                        $this->line("Deleted demo user {$user->email}");
                    }
                } else {
                    // For real users, just remove the role
                    if ($dryRun) {
                        $this->line("DRY RUN: Would remove customer role from {$user->email}");
                    } else {
                        $user->removeRole('customer');
                        $this->line("Removed customer role from {$user->email}");
                    }
                }
            }

            // After all users are handled, if no users have the role, we can delete the role record itself safely
            $remainingUsers = User::role('customer')->count();
            if ($remainingUsers === 0) {
                if ($dryRun) {
                    $this->line("DRY RUN: Would delete customer role record");
                } else {
                    $customerRole->delete();
                    $this->info("Customer role record deleted successfully.");
                }
            } else {
                $this->warn("There are still $remainingUsers users with the customer role after cleanup process. Role record was kept.");
            }

            if ($dryRun) {
                DB::rollBack();
                $this->info('Dry-run completed successfully.');
            } else {
                DB::commit();
                $this->info('Cleanup completed successfully.');
            }

            return Command::SUCCESS;

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("An error occurred: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
