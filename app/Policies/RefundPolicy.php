<?php

namespace App\Policies;

use App\Models\Refund;
use App\Models\User;

class RefundPolicy
{
    /**
     * Determine whether the user can view any refunds.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'agent']);
    }

    /**
     * Determine whether the user can view the refund.
     */
    public function view(User $user, Refund $refund): bool
    {
        return in_array($user->role, ['admin', 'agent']);
    }

    /**
     * Determine whether the user can create refunds.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'agent']);
    }

    /**
     * Determine whether the user can update (approve/reject) the refund.
     * Only admins can approve/reject refunds.
     */
    public function update(User $user, Refund $refund): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can delete the refund.
     * Only pending refunds can be deleted, and only by admins.
     */
    public function delete(User $user, Refund $refund): bool
    {
        if ($user->role !== 'admin') {
            return false;
        }

        // Only pending refunds can be deleted
        return $refund->state === 'pending';
    }
}
