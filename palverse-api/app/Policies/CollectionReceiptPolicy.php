<?php

namespace App\Policies;

use App\Models\CollectionReceipt;
use App\Models\User;

class CollectionReceiptPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['representative', 'admin']);
    }

    public function view(User $user, CollectionReceipt $receipt): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('representative') && $receipt->representative_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('representative');
    }

    public function settle(User $user): bool
    {
        return $user->hasPermissionTo('receipts.manage')
            || ($user->hasRole('follow_up') && $user->hasPermissionTo('renewals.follow_up'));
    }
}
