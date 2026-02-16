/**
 * Context-specific actions for each order status.
 * Each status maps to an array of actions the admin can take.
 */

export interface StatusAction {
    label: string;
    targetStatus: string;
    icon: string;
    variant: 'default' | 'success' | 'warning' | 'destructive';
}

/**
 * Returns the context-specific actions available for a given order status.
 */
export function getStatusActions(currentStatus: string): StatusAction[] {
    switch (currentStatus) {
        case 'pending':
            return [
                {
                    label: 'Confirm Payment Received',
                    targetStatus: 'payment_confirmation',
                    icon: '/icons/check-circle.527633.svg',
                    variant: 'success',
                },
                {
                    label: 'Reject Order',
                    targetStatus: 'rejected',
                    icon: '/icons/close-circle.527651.svg',
                    variant: 'destructive',
                },
            ];

        case 'payment_confirmation':
            return [
                {
                    label: 'Payment Verified',
                    targetStatus: 'review',
                    icon: '/icons/check-circle.527633.svg',
                    variant: 'success',
                },
                {
                    label: 'Payment Not Received',
                    targetStatus: 'rejected',
                    icon: '/icons/close-circle.527651.svg',
                    variant: 'warning',
                },
            ];

        case 'review':
            return [
                {
                    label: 'Approve & Send to Agent',
                    targetStatus: 'sent_to_agent',
                    icon: '/icons/alt-arrow-right.527996.svg',
                    variant: 'success',
                },
                {
                    label: 'Reject Order',
                    targetStatus: 'rejected',
                    icon: '/icons/close-circle.527651.svg',
                    variant: 'destructive',
                },
            ];

        case 'sent_to_agent':
            return [
                {
                    label: 'Start Processing',
                    targetStatus: 'in_progress',
                    icon: '/icons/alt-arrow-right.527996.svg',
                    variant: 'success',
                },
                {
                    label: 'Return for Review',
                    targetStatus: 'review',
                    icon: '/icons/undo-left-round.527932.svg',
                    variant: 'warning',
                },
            ];

        case 'in_progress':
            return [
                {
                    label: 'Mark as Issued',
                    targetStatus: 'issued',
                    icon: '/icons/check-circle.527633.svg',
                    variant: 'success',
                },
                {
                    label: 'Return to Agent',
                    targetStatus: 'sent_to_agent',
                    icon: '/icons/undo-left-round.527932.svg',
                    variant: 'warning',
                },
            ];

        case 'issued':
            // Final state — no status actions
            return [];

        case 'rejected':
            return [
                {
                    label: 'Reopen Order',
                    targetStatus: 'pending',
                    icon: '/icons/undo-left-round.527932.svg',
                    variant: 'default',
                },
            ];

        default:
            return [];
    }
}

/**
 * Tailwind classes for each action variant.
 */
export function getActionVariantClasses(variant: StatusAction['variant']): string {
    switch (variant) {
        case 'success':
            return 'text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950/20';
        case 'warning':
            return 'text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/20';
        case 'destructive':
            return 'text-destructive focus:text-destructive focus:bg-destructive/10';
        default:
            return '';
    }
}
