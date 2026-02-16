<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

/**
 * ServiceSlot Model
 * 
 * Represents a bookable time slot for appointment-based services.
 * 
 * @property int $id
 * @property int $service_id
 * @property Carbon|null $date
 * @property string $start_time
 * @property string $end_time
 * @property int $capacity
 * @property int $booked_count
 * @property bool $is_available
 */
class ServiceSlot extends Model
{
    protected $fillable = [
        'service_id',
        'date',
        'start_time',
        'end_time',
        'capacity',
        'booked_count',
        'is_available',
    ];

    protected $casts = [
        'date' => 'date',
        'capacity' => 'integer',
        'booked_count' => 'integer',
        'is_available' => 'boolean',
    ];

    /**
     * Get the service this slot belongs to
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Check if slot has available capacity
     */
    public function hasAvailability(): bool
    {
        return $this->is_available && ($this->booked_count < $this->capacity);
    }

    /**
     * Get remaining capacity
     */
    public function getRemainingCapacityAttribute(): int
    {
        return max(0, $this->capacity - $this->booked_count);
    }

    /**
     * Get formatted time range
     */
    public function getTimeRangeAttribute(): string
    {
        return "{$this->start_time} - {$this->end_time}";
    }

    /**
     * Get formatted date
     */
    public function getFormattedDateAttribute(): string
    {
        return $this->date ? $this->date->format('Y-m-d') : '';
    }

    /**
     * Scope: Available slots
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)
            ->whereColumn('booked_count', '<', 'capacity');
    }

    /**
     * Scope: Future slots
     */
    public function scopeFuture($query)
    {
        return $query->where('date', '>=', now()->toDateString())
            ->orWhereNull('date');
    }

    /**
     * Scope: On specific date
     */
    public function scopeOnDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }
}
