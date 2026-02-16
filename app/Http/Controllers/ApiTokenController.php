<?php

namespace App\Http\Controllers;

use App\Models\ApiToken;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApiTokenController extends Controller
{
    /**
     * Available API abilities
     */
    private const ABILITIES = [
        'read:orders' => 'Read Orders',
        'write:orders' => 'Create/Edit Orders',
        'read:services' => 'Read Services',
        'read:categories' => 'Read Categories',
        'read:banners' => 'Read Banners',
        'read:users' => 'Read Users',
    ];

    /**
     * Display API tokens list
     */
    public function index()
    {
        $tokens = ApiToken::orderBy('created_at', 'desc')->get();
        
        return Inertia::render('Dashboard/ApiTokens/Index', [
            'tokens' => $tokens->map(function ($token) {
                return [
                    'id' => $token->id,
                    'name' => $token->name,
                    'abilities' => $token->abilities,
                    'last_used_at' => $token->last_used_at?->toISOString(),
                    'expires_at' => $token->expires_at?->toISOString(),
                    'is_active' => $token->isActive(),
                    'created_at' => $token->created_at->toISOString(),
                ];
            }),
            'availableAbilities' => self::ABILITIES,
        ]);
    }

    /**
     * Create new API token
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'abilities' => 'required|array|min:1',
            'abilities.*' => 'string|in:' . implode(',', array_keys(self::ABILITIES)),
            'expires_at' => 'nullable|date|after:today',
        ]);

        $result = ApiToken::createToken(
            $validated['name'],
            $validated['abilities'],
            $validated['expires_at'] ?? null
        );

        // Return the plain token ONCE - it won't be shown again
        return response()->json([
            'success' => true,
            'token' => [
                'id' => $result['token']->id,
                'name' => $result['token']->name,
                'plain_token' => $result['plainToken'],
            ],
        ]);
    }

    /**
     * Delete API token
     */
    public function destroy(ApiToken $apiToken)
    {
        $apiToken->delete();

        return redirect()->back()->with('success', 'API token deleted successfully.');
    }
}
