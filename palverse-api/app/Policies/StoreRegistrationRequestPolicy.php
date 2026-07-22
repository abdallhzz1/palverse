<?php

namespace App\Policies;

use App\Models\StoreRegistrationRequest;
use App\Models\User;

class StoreRegistrationRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['representative', 'admin', 'follow_up']);
    }

    public function view(User $user, StoreRegistrationRequest $request): bool
    {
        if ($user->hasRole(['admin', 'follow_up'])) {
            return true;
        }

        return $user->hasRole('representative') && $request->representative_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('representative');
    }

    public function update(User $user, StoreRegistrationRequest $request): bool
    {
        return $user->hasRole('representative')
            && $request->representative_id === $user->id
            && $request->status->isEditable();
    }

    public function submit(User $user, StoreRegistrationRequest $request): bool
    {
        return $user->hasRole('representative')
            && $request->representative_id === $user->id
            && $request->status->isSubmittable();
    }

    public function review(User $user, StoreRegistrationRequest $request): bool
    {
        return $user->hasRole(['admin', 'follow_up']);
    }
}
