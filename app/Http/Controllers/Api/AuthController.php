<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Requests\Api\UpdateProfileRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;

class AuthController extends ApiController
{
    /**
     * Register a new user
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $customer = Customer::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'password' => Hash::make($validated['password']),
            'status' => true,
            'is_verified' => true,
        ]);

        Event::dispatch('customer.registered', $customer);

        $token = $customer->createToken(
            $request->device_name ?? 'mobile-app',
            ['*'],
            now()->addDays(30)
        )->plainTextToken;

        return $this->createdResponse([
            'user' => new CustomerResource($customer),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Account created successfully.');
    }

    /**
     * Login user and create token
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = Customer::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->errorResponse(
                'Invalid credentials.',
                Response::HTTP_UNAUTHORIZED
            );
        }

        // Check if user is active
        if (!$user->status) {
            return $this->forbiddenResponse('Account is not activated.');
        }

        // Check if user is suspended
        if ($user->is_suspended) {
            return $this->forbiddenResponse('Account is suspended.');
        }

        // Revoke all previous tokens for security
        $user->tokens()->delete();

        // Create new token with expiration
        $token = $user->createToken(
            $request->device_name ?? 'mobile-app',
            ['*'],
            now()->addDays(30)
        )->plainTextToken;

        Event::dispatch('customer.after.login', $user);

        return $this->successResponse([
            'user' => new CustomerResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Login successful.');
    }

    /**
     * Get authenticated user profile
     */
    public function user(Request $request): JsonResponse
    {
        return $this->resourceResponse(
            new CustomerResource($request->user())
        );
    }

    /**
     * Update user profile
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // Hash password if provided
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $path;
        }

        $user->update($validated);

        Event::dispatch('customer.profile.updated', $user->fresh());

        return $this->successResponse(
            new CustomerResource($user->fresh()),
            'Profile updated successfully.'
        );
    }

    /**
     * Logout user (revoke current token)
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        Event::dispatch('customer.after.logout', $request->user());

        return $this->successResponse(
            null,
            'Logged out successfully.'
        );
    }

    /**
     * Refresh token
     */
    public function refreshToken(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Delete current token
        $request->user()->currentAccessToken()->delete();
        
        // Create new token
        $token = $user->createToken(
            'mobile-app',
            ['*'],
            now()->addDays(30)
        )->plainTextToken;

        return $this->successResponse([
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Token refreshed successfully.');
    }
}
