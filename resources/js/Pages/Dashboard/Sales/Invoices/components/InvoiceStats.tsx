import { DuotoneIcon } from '@/components/DuotoneIcon';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';

interface InvoiceStatsProps {
    total: number;
    paid: number;
    pending: number;
    totalAmount: number;
}

export function InvoiceStats({ total, paid, pending, totalAmount }: InvoiceStatsProps) {
    const items = [
        {
            title: 'Total Invoices',
            value: total,
            icon: 'bill-list.528037.svg',
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            title: 'Paid',
            value: paid,
            icon: 'check-circle.527633.svg',
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-100 dark:bg-emerald-900/20',
        },
        {
            title: 'Pending',
            value: pending,
            icon: 'clock-circle.528155.svg',
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-100 dark:bg-amber-900/20',
        },
        {
            title: 'Total Amount',
            value: formatCurrency(totalAmount),
            icon: 'dollar-minimalistic.528208.svg',
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-100 dark:bg-purple-900/20',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <Card key={item.title} className="shadow-sm border-border/50">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                            <span className="text-2xl font-bold">{item.value}</span>
                        </div>
                        <div className={cn('p-3 rounded-full', item.bg)}>
                            <DuotoneIcon src={`/icons/${item.icon}`} className={cn('h-5 w-5', item.color)} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
