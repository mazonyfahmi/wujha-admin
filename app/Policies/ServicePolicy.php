<?php

namespace App\Policies;

use App\Models\Service;
use App\Models\User;

class ServicePolicy
{
    /**
     * Determine whether the user can view any services.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'agent']);
    }

    /**
     * Determine whether the user can view the service.
     */
    public function view(User $user, Service $service): bool
    {
        return in_array($user->role, ['admin', 'agent']);
    }

    /**
     * Determine whether the user can create services.
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the service.
     */
    public function update(User $user, Service $service): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can delete the service.
     * Prevents deleting services with active orders.
     */
    public function delete(User $user, Service $service): bool
    {
        if ($user->role !== 'admin') {
            return false;
        }

        // Prevent deleting services that have active orders
        $activeStatuses = ['pending', 'payment_confirmation', 'review', 'sent_to_agent', 'in_progress'];
        if ($service->orders()->whereIn('status', $activeStatuses)->exists()) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can bulk delete services.
     */
    public function bulkDelete(User $user): bool
    {
        return $user->role === 'admin';
    }
}
