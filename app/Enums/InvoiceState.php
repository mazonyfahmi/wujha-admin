<?php

namespace App\Enums;

/**
 * Invoice State Enum
 *
 * Defines the lifecycle states of an invoice:
 * - PENDING: Invoice created but not yet paid
 * - PAID: Payment received and confirmed
 * - CANCELLED: Invoice voided
 * - REFUNDED: Payment returned to customer
 */
enum InvoiceState: string
{
    case PENDING = 'pending';
    case PAID = 'paid';
    case CANCELLED = 'cancelled';
    case REFUNDED = 'refunded';

    /**
     * Human-readable label
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::PAID => 'Paid',
            self::CANCELLED => 'Cancelled',
            self::REFUNDED => 'Refunded',
        };
    }

    /**
     * Badge color variant
     */
    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'yellow',
            self::PAID => 'green',
            self::CANCELLED => 'red',
            self::REFUNDED => 'blue',
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
