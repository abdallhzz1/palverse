<?php

namespace App\Console\Commands;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class CreateAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'palverse:create-admin
                            {--name= : The name of the admin}
                            {--email= : The email of the admin}
                            {--verified : Mark the email as verified}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create an initial Super Admin account for production.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Create Initial Admin Account');

        $name = $this->option('name') ?? $this->ask('Enter admin name');
        if (empty($name)) {
            $this->error('Name is required.');

            return self::FAILURE;
        }

        $email = $this->option('email') ?? $this->ask('Enter admin email');
        if (empty($email)) {
            $this->error('Email is required.');

            return self::FAILURE;
        }

        // Validate email
        if (User::where('email', $email)->exists()) {
            $this->error('A user with this email already exists.');

            return self::FAILURE;
        }

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email format.');

            return self::FAILURE;
        }

        // Password input (always hidden, never via option for security)
        $password = $this->secret('Enter admin password');
        $passwordConfirm = $this->secret('Confirm admin password');

        if ($password !== $passwordConfirm) {
            $this->error('Passwords do not match.');

            return self::FAILURE;
        }

        // Validate password strength
        $validator = Validator::make(
            ['password' => $password],
            ['password' => ['required', Password::min(8)->letters()->mixedCase()->numbers()->symbols()]]
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $this->info('Summary:');
        $this->line("- Name: {$name}");
        $this->line("- Email: {$email}");
        $this->line('- Role: admin');

        if (! $this->confirm('Create this admin account?')) {
            $this->info('Aborted.');

            return self::SUCCESS;
        }

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'status' => UserStatus::Active->value,
            'email_verified_at' => $this->option('verified') ? now() : null,
        ]);

        $user->assignRole('admin');

        // Note: Audit log defaults to system creation when no user is logged in via console.

        $this->info('Admin account created successfully.');

        return self::SUCCESS;
    }
}
