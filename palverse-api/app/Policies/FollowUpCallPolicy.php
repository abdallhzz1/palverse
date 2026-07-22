<?php

namespace App\Policies;

use App\Models\FollowUpCall;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class FollowUpCallPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewDashboard(User $user): bool
    {
        return $user->hasPermissionTo('follow_up.dashboard.view') || $user->hasRole('admin');
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('follow_up_calls.view_own') || $user->hasRole('admin');
    }

    public function view(User $user, FollowUpCall $followUpCall): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasPermissionTo('follow_up_calls.view_own');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('follow_up_calls.create');
    }

    public function update(User $user, FollowUpCall $followUpCall): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasPermissionTo('follow_up_calls.update_own') && $followUpCall->follow_up_user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, FollowUpCall $followUpCall): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, FollowUpCall $followUpCall): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, FollowUpCall $followUpCall): bool
    {
        return false;
    }
}
