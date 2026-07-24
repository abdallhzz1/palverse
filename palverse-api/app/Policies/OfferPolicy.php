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
        return $user->can('offers.view') || $user->hasAnyRole(['admin', 'follow_up']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Offer $offer): bool
    {
        if ($user->hasAnyRole(['admin', 'follow_up'])) {
            return true;
        }

        if ($user->can('offers.view') || $user->can('offers.manage')) {
            return $offer->store->owner_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('offers.manage') || $user->hasAnyRole(['admin', 'follow_up']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Offer $offer): bool
    {
        if ($user->hasAnyRole(['admin', 'follow_up'])) {
            return true;
        }

        if ($user->can('offers.manage')) {
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
