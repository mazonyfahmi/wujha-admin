<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine whether the user can view any orders.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'agent']);
    }

    /**
     * Determine whether the user can view the order.
     */
    public function view(User $user, Order $order): bool
    {
        return in_array($user->role, ['admin', 'agent']);
    }

    /**
     * Determine whether the user can create orders.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'agent']);
    }

    /**
     * Determine whether the user can update the order status.
     */
    public function updateStatus(User $user, Order $order): bool
    {
        return in_array($user->role, ['admin', 'agent']);
    }

    /**
     * Determine whether the user can delete the order.
     * Only admins can delete orders.
     */
    public function delete(User $user, Order $order): bool
    {
        // Only admins can delete orders
        if ($user->role !== 'admin') {
            return false;
        }

        // Prevent deleting orders that have invoices
        if ($order->relationLoaded('invoice') ? $order->invoice !== null : $order->invoice()->exists()) {
            return false;
        }

        return true;
    }
}
