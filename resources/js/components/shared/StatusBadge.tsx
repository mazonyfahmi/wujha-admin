import { Badge, type BadgeProps } from '@/components/ui/badge';

type StatusVariant = BadgeProps['variant'];

// Order statuses
const orderStatusConfig: Record<string, { label: string; variant: StatusVariant }> = {
    pending: { label: 'Pending', variant: 'warning' },
    payment_confirmation: { label: 'Payment Confirmation', variant: 'warning' },
    review: { label: 'Under Review', variant: 'info' },
    sent_to_agent: { label: 'Sent to Agent', variant: 'purple' },
    in_progress: { label: 'In Progress', variant: 'cyan' },
    issued: { label: 'Issued', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'destructive' },
};

// Invoice states
const invoiceStateConfig: Record<string, { label: string; variant: StatusVariant }> = {
    pending: { label: 'Pending', variant: 'warning' },
    paid: { label: 'Paid', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
    refunded: { label: 'Refunded', variant: 'purple' },
};

// Refund states
const refundStateConfig: Record<string, { label: string; variant: StatusVariant }> = {
    pending: { label: 'Pending', variant: 'warning' },
    approved: { label: 'Approved', variant: 'info' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    processed: { label: 'Processed', variant: 'success' },
};

interface StatusBadgeProps {
    status: string;
    type?: 'order' | 'invoice' | 'refund';
}

export function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
    const configs = { order: orderStatusConfig, invoice: invoiceStateConfig, refund: refundStateConfig };
    const config = configs[type][status];

    if (!config) {
        return <Badge variant="outline">{status}</Badge>;
    }

    return <Badge variant={config.variant}>{config.label}</Badge>;
}

export { orderStatusConfig, invoiceStateConfig, refundStateConfig };
