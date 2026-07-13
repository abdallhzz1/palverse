<?php

namespace App\Policies;

use App\Models\Offer;
use App\Models\User;

class OfferPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('offers.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Offer $offer): bool
    {
        if ($user->can('offers.manage')) {
            // Admins can manage all, merchants can manage theirs
            if ($user->hasRole('admin')) {
                return true;
            }
        }

        if ($user->can('offers.view')) {
            if ($user->hasRole('admin')) {
                return true;
            }

            // Merchant viewing their own store's offer
            return $offer->store->owner_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('offers.manage');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Offer $offer): bool
    {
        if ($user->can('offers.manage')) {
            if ($user->hasRole('admin')) {
                return true;
            }

            return $offer->store->owner_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Offer $offer): bool
    {
        return $this->update($user, $offer);
    }
}
