<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    /**
     * Determine whether the user can view any customers.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'agent']);
    }

    /**
     * Determine whether the user can view the customer.
     */
    public function view(User $user, Customer $customer): bool
    {
        return in_array($user->role, ['admin', 'agent']);
    }

    /**
     * Determine whether the user can create customers.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'agent']);
    }

    /**
     * Determine whether the user can update the customer.
     */
    public function update(User $user, Customer $customer): bool
    {
        return in_array($user->role, ['admin', 'agent']);
    }

    /**
     * Determine whether the user can delete the customer.
     * Only admins can delete customers.
     */
    public function delete(User $user, Customer $customer): bool
    {
        // Only admin can delete
        if ($user->role !== 'admin') {
            return false;
        }

        // Prevent deleting customers with active orders
        $activeStatuses = ['pending', 'payment_confirmation', 'review', 'sent_to_agent', 'in_progress'];
        if ($customer->orders()->whereIn('status', $activeStatuses)->exists()) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can bulk delete customers.
     */
    public function bulkDelete(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can toggle suspension.
     */
    public function toggleSuspension(User $user, Customer $customer): bool
    {
        return $user->role === 'admin';
    }
}
