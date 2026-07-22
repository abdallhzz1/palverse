<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoFollowUpSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make(config('palverse.demo.follow_up_password', 'DemoFollowUp123!'));

        $followUp1 = User::firstOrCreate(
            ['email' => 'followup1@palverse.demo'],
            [
                'name' => 'موظف متابعة 1',
                'password' => $password,
                'email_verified_at' => now(),
                'public_id' => Str::ulid(),
            ]
        );
        $followUp1->assignRole('follow_up');

        $followUp2 = User::firstOrCreate(
            ['email' => 'followup2@palverse.demo'],
            [
                'name' => 'موظف متابعة 2',
                'password' => $password,
                'email_verified_at' => now(),
                'public_id' => Str::ulid(),
            ]
        );
        $followUp2->assignRole('follow_up');
    }
}
