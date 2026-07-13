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
        if ($user->can('stores.approve') || $user->can('stores.update')) {
            // Admins with specific permissions can view any store, OR users who own the store
            if ($user->can('stores.approve')) {
                return true; // Assume admin with approve permission can view all
            }
            // For merchants, they can only view if they own it or if they have global view and it's active/public (though admin panel might differ)
        }

        return $store->owner_id === $user->id;
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
        if ($user->can('stores.update') && $store->owner_id === $user->id) {
            return true;
        }

        // Admins might have an overarching update permission,
        // but MVP specifically states: "Merchant may view and update only stores they own."
        // We will strictly check ownership for merchants. Admins might use a different permission bypass,
        // but let's check if user has admin role or specific admin permission.
        return $user->hasRole('admin');
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
