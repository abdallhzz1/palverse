<?php

namespace App\Policies;

use App\Models\StoreSubscription;
use App\Models\User;

class StoreSubscriptionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('subscriptions.view') 
            || $user->hasPermissionTo('renewals.view') 
            || $user->hasPermissionTo('unpaid_subscriptions.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, StoreSubscription $storeSubscription): bool
    {
        if ($user->hasPermissionTo('subscriptions.view') 
            || $user->hasPermissionTo('renewals.view') 
            || $user->hasPermissionTo('unpaid_subscriptions.view')) {
            return true;
        }

        // Merchants can view subscriptions of stores they own
        if ($storeSubscription->store->owner_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('subscriptions.manage');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, StoreSubscription $storeSubscription): bool
    {
        return $user->hasPermissionTo('subscriptions.manage');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, StoreSubscription $storeSubscription): bool
    {
        return $user->hasPermissionTo('subscriptions.manage');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, StoreSubscription $storeSubscription): bool
    {
        return $user->hasPermissionTo('subscriptions.manage');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, StoreSubscription $storeSubscription): bool
    {
        return $user->hasPermissionTo('subscriptions.manage');
    }

    public function activateUnpaid(User $user): bool
    {
        return $user->hasPermissionTo('renewals.follow_up')
            && $user->hasPermissionTo('unpaid_subscriptions.view');
    }

    public function renew(User $user): bool
    {
        return $user->hasPermissionTo('renewals.follow_up');
    }

    public function cancelFollowUp(User $user): bool
    {
        return $user->hasPermissionTo('renewals.follow_up');
    }
}
