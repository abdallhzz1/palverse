<?php

namespace App\Policies;

use App\Models\Store;
use App\Models\User;

class StorePolicy
{
    /**
     * Determine if the given user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('stores.view');
    }

    /**
     * Determine if the given user can view the model.
     */
    public function view(User $user, Store $store): bool
    {
        if ($user->hasAnyRole(['admin', 'follow_up'])) {
            return true;
        }

        if ($user->can('stores.approve')) {
            return true;
        }

        return $store->owner_id == $user->id;
    }

    /**
     * Determine if the given user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('stores.create');
    }

    /**
     * Determine if the given user can update the model.
     */
    public function update(User $user, Store $store): bool
    {
        if ($user->hasAnyRole(['admin', 'follow_up'])) {
            return true;
        }

        return $user->can('stores.update') && $store->owner_id == $user->id;
    }

    /**
     * Determine if the given user can approve the model.
     */
    public function approve(User $user, Store $store): bool
    {
        return $user->can('stores.approve');
    }

    /**
     * Determine if the given user can reject the model.
     */
    public function reject(User $user, Store $store): bool
    {
        return $user->can('stores.reject');
    }

    /**
     * Determine if the given user can activate the model.
     */
    public function activate(User $user, Store $store): bool
    {
        return $user->can('stores.activate');
    }

    /**
     * Determine if the given user can deactivate the model.
     */
    public function deactivate(User $user, Store $store): bool
    {
        return $user->can('stores.deactivate');
    }
}
