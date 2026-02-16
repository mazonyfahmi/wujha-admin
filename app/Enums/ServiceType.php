<?php

namespace App\Enums;

/**
 * Service Type Enum
 * 
 * Defines the different types of services available in the system:
 * - CONSULTATION: Appointment-based services with time slots
 * - SUBSCRIPTION: Recurring services with billing cycles
 * - ON_DEMAND: Immediate services with no scheduling
 * - PACKAGE: Bundled services with multiple items
 */
enum ServiceType: string
{
    case CONSULTATION = 'consultation';
    case SUBSCRIPTION = 'subscription';
    case ON_DEMAND = 'on_demand';
    case PACKAGE = 'package';

    /**
     * Get human-readable label
     */
    public function label(): string
    {
        return match($this) {
            self::CONSULTATION => 'Consultation',
            self::SUBSCRIPTION => 'Subscription',
            self::ON_DEMAND => 'On-Demand',
            self::PACKAGE => 'Package',
        };
    }

    /**
     * Get English label
     */
    public function labelEn(): string
    {
        return match($this) {
            self::CONSULTATION => 'Consultation',
            self::SUBSCRIPTION => 'Subscription',
            self::ON_DEMAND => 'On-Demand',
            self::PACKAGE => 'Package',
        };
    }

    /**
     * Check if type requires scheduling
     */
    public function requiresScheduling(): bool
    {
        return match($this) {
            self::CONSULTATION => true,
            self::SUBSCRIPTION => false,
            self::ON_DEMAND => false,
            self::PACKAGE => false,
        };
    }

    /**
     * Get icon name for UI
     */
    public function icon(): string
    {
        return match($this) {
            self::CONSULTATION => 'CalendarOutlined',
            self::SUBSCRIPTION => 'SyncOutlined',
            self::ON_DEMAND => 'ThunderboltOutlined',
            self::PACKAGE => 'AppstoreOutlined',
        };
    }

    /**
     * Get all types as array for select options
     */
    public static function toSelectOptions(): array
    {
        return array_map(
            fn(self $type) => [
                'value' => $type->value,
                'label' => $type->label(),
                'label_en' => $type->labelEn(),
                'requires_scheduling' => $type->requiresScheduling(),
                'icon' => $type->icon(),
            ],
            self::cases()
        );
    }
}
