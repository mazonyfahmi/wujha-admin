<?php

namespace App\Enums;

/**
 * Order Status Enum
 *
 * Defines the lifecycle states of an order:
 * - PENDING: New order awaiting action
 * - PAYMENT_CONFIRMATION: Awaiting payment verification
 * - REVIEW: Under admin/agent review
 * - SENT_TO_AGENT: Forwarded to an agent for processing
 * - IN_PROGRESS: Actively being worked on
 * - ISSUED: Completed successfully
 * - REJECTED: Declined by admin/agent
 * - CANCELED: Cancelled by customer
 */
enum OrderStatus: string
{
    case PENDING = 'pending';
    case PAYMENT_CONFIRMATION = 'payment_confirmation';
    case REVIEW = 'review';
    case SENT_TO_AGENT = 'sent_to_agent';
    case IN_PROGRESS = 'in_progress';
    case ISSUED = 'issued';
    case REJECTED = 'rejected';
    case CANCELED = 'canceled';

    /**
     * Human-readable label
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::PAYMENT_CONFIRMATION => 'Payment Confirmation',
            self::REVIEW => 'Under Review',
            self::SENT_TO_AGENT => 'Sent to Agent',
            self::IN_PROGRESS => 'In Progress',
            self::ISSUED => 'Issued',
            self::REJECTED => 'Rejected',
            self::CANCELED => 'Canceled',
        };
    }

    /**
     * Bootstrap badge color variant
     */
    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'yellow',
            self::PAYMENT_CONFIRMATION => 'blue',
            self::REVIEW => 'indigo',
            self::SENT_TO_AGENT => 'purple',
            self::IN_PROGRESS => 'orange',
            self::ISSUED => 'green',
            self::REJECTED => 'red',
            self::CANCELED => 'gray',
        };
    }

    /**
     * Whether this status represents an active (non-terminal) order
     */
    public function isActive(): bool
    {
        return in_array($this, [
            self::PENDING,
            self::PAYMENT_CONFIRMATION,
            self::REVIEW,
            self::SENT_TO_AGENT,
            self::IN_PROGRESS,
        ]);
    }

    /**
     * Whether this status is terminal (order is done)
     */
    public function isTerminal(): bool
    {
        return in_array($this, [
            self::ISSUED,
            self::REJECTED,
            self::CANCELED,
        ]);
    }

    /**
     * Whether the customer can cancel from this status
     */
    public function isCancellable(): bool
    {
        return in_array($this, [
            self::PENDING,
            self::PAYMENT_CONFIRMATION,
            self::REVIEW,
        ]);
    }

    /**
     * Get all statuses as key => label array
     */
    public static function toArray(): array
    {
        return array_combine(
            array_column(self::cases(), 'value'),
            array_map(fn(self $s) => $s->label(), self::cases())
        );
    }

    /**
     * Get active statuses as values array
     */
    public static function activeValues(): array
    {
        return array_map(
            fn(self $s) => $s->value,
            array_filter(self::cases(), fn(self $s) => $s->isActive())
        );
    }
}
