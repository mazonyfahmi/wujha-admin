<?php

namespace App\Enums;

/**
 * Refund State Enum
 *
 * Defines the lifecycle states of a refund:
 * - PENDING: Refund request submitted
 * - APPROVED: Refund approved by admin
 * - REJECTED: Refund denied by admin
 * - PROCESSED: Refund payment completed
 */
enum RefundState: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case PROCESSED = 'processed';

    /**
     * Human-readable label
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
            self::PROCESSED => 'Processed',
        };
    }

    /**
     * Badge color variant
     */
    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'yellow',
            self::APPROVED => 'blue',
            self::REJECTED => 'red',
            self::PROCESSED => 'green',
        };
    }

    /**
     * Get all states as key => label array
     */
    public static function toArray(): array
    {
        return array_combine(
            array_column(self::cases(), 'value'),
            array_map(fn(self $s) => $s->label(), self::cases())
        );
    }
}
