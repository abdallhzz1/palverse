<?php

namespace App\Policies;

use App\Models\CommissionRecord;
use App\Models\User;

class CommissionRecordPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['representative', 'admin']);
    }

    public function view(User $user, CommissionRecord $commission): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('representative') && $commission->representative_id === $user->id;
    }
}
