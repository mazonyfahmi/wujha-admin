<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ServiceAttribute Model
 * 
 * Represents a dynamic custom attribute for a service.
 * 
 * @property int $id
 * @property int $service_id
 * @property string $key
 * @property string $value_type (text, number, boolean, select)
 * @property string|null $value
 * @property array|null $options
 * @property bool $is_required
 * @property int $sort_order
 */
class ServiceAttribute extends Model
{
    protected $fillable = [
        'service_id',
        'key',
        'value_type',
        'value',
        'options',
        'is_required',
        'sort_order',
    ];

    protected $casts = [
        'options' => 'array',
        'is_required' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the service this attribute belongs to
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get typed value based on value_type
     */
    public function getTypedValueAttribute(): mixed
    {
        return match($this->value_type) {
            'number' => is_numeric($this->value) ? (float) $this->value : null,
            'boolean' => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            default => $this->value,
        };
    }

    /**
     * Check if attribute has options (for select type)
     */
    public function hasOptions(): bool
    {
        return $this->value_type === 'select' && !empty($this->options);
    }

    /**
     * Validate a value against this attribute's rules
     */
    public function validateValue(mixed $value): bool
    {
        // Required check
        if ($this->is_required && ($value === null || $value === '')) {
            return false;
        }

        // Type-specific validation
        return match($this->value_type) {
            'number' => is_numeric($value),
            'boolean' => is_bool($value) || in_array($value, ['true', 'false', '0', '1', 0, 1]),
            'select' => in_array($value, $this->options ?? []),
            default => true,
        };
    }

    /**
     * Get human-readable label from key
     */
    public function getLabelAttribute(): string
    {
        return ucwords(str_replace('_', ' ', $this->key));
    }
}
