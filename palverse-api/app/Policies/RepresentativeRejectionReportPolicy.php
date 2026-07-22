<?php

namespace App\Policies;

use App\Models\RepresentativeRejectionReport;
use App\Models\User;

class RepresentativeRejectionReportPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['representative', 'admin']);
    }

    public function view(User $user, RepresentativeRejectionReport $report): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('representative') && $report->representative_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('representative');
    }

    public function update(User $user, RepresentativeRejectionReport $report): bool
    {
        return $user->hasRole('representative') && $report->representative_id === $user->id;
    }
}
