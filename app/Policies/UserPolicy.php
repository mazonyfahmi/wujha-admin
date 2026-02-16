<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any users.
     * Only admins can manage users.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can create users.
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the model.
     * Admins cannot change their own role.
     */
    public function update(User $user, User $model): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can change the role of another user.
     * Prevents admin from changing their own role.
     */
    public function changeRole(User $user, User $model): bool
    {
        if ($user->role !== 'admin') {
            return false;
        }

        // Cannot change your own role
        return $user->id !== $model->id;
    }

    /**
     * Determine whether the user can delete the model.
     * Cannot delete yourself.
     */
    public function delete(User $user, User $model): bool
    {
        if ($user->role !== 'admin') {
            return false;
        }

        // Cannot delete yourself
        return $user->id !== $model->id;
    }
}
