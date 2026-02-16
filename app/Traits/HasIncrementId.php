<?php

namespace App\Traits;

/**
 * Trait HasIncrementId
 *
 * Provides race-condition-safe generation of increment IDs
 * using database-level locking (SELECT FOR UPDATE).
 *
 * Usage: Override the static property $incrementIdPrefix in your model.
 */
trait HasIncrementId
{
    /**
     * Generate a unique increment ID with database-level locking.
     * Prevents race conditions where two concurrent requests could get the same ID.
     *
     * @return string e.g. "INV-00001", "REF-00001"
     */
    public static function generateIncrementId(): string
    {
        $prefix = static::$incrementIdPrefix ?? 'ID';
        $padLength = static::$incrementIdPadLength ?? 5;

        // Use database-level locking to prevent race conditions
        $lastRecord = static::query()
            ->lockForUpdate()
            ->orderByRaw('CAST(SUBSTRING(increment_id, ' . (strlen($prefix) + 2) . ') AS UNSIGNED) DESC')
            ->value('increment_id');

        if ($lastRecord) {
            $lastNumber = (int) substr($lastRecord, strlen($prefix) + 1);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return $prefix . '-' . str_pad($nextNumber, $padLength, '0', STR_PAD_LEFT);
    }
}
