<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ApiToken extends Model
{
    protected $fillable = [
        'name',
        'token',
        'abilities',
        'last_used_at',
        'expires_at',
    ];

    protected $casts = [
        'abilities' => 'array',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected $hidden = [
        'token',
    ];

    /**
     * Generate a new API token
     */
    public static function createToken(string $name, array $abilities = ['*'], ?string $expiresAt = null): array
    {
        $plainToken = Str::random(64);
        
        $token = self::create([
            'name' => $name,
            'token' => hash('sha256', $plainToken),
            'abilities' => $abilities,
            'expires_at' => $expiresAt,
        ]);

        return [
            'token' => $token,
            'plainToken' => $plainToken,
        ];
    }

    /**
     * Check if token has a specific ability
     */
    public function hasAbility(string $ability): bool
    {
        return in_array('*', $this->abilities ?? []) || 
               in_array($ability, $this->abilities ?? []);
    }

    /**
     * Check if token is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Check if token is active
     */
    public function isActive(): bool
    {
        return !$this->isExpired();
    }

    /**
     * Update last used timestamp
     */
    public function recordUsage(): void
    {
        $this->update(['last_used_at' => now()]);
    }
}
