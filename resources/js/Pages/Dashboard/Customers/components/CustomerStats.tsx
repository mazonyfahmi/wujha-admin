import { DuotoneIcon } from '@/components/DuotoneIcon';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CustomerStatsProps {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
}

export function CustomerStats({ total, active, inactive, suspended }: CustomerStatsProps) {
    const items = [
        {
            title: 'Total Customers',
            value: total,
            description: 'All registered',
            icon: 'users-group-two-rounded.527964.svg',
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            title: 'Active',
            value: active,
            description: `${total > 0 ? ((active / total) * 100).toFixed(0) : 0}% of total`,
            icon: 'user-check-rounded.527947.svg',
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-100 dark:bg-emerald-900/20',
        },
        {
            title: 'Inactive',
            value: inactive,
            description: 'Deactivated accounts',
            icon: 'user-block-rounded.527944.svg',
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-100 dark:bg-red-900/20',
        },
        {
            title: 'Suspended',
            value: suspended,
            description: 'Requires attention',
            icon: 'shield-warning.527887.svg',
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-100 dark:bg-amber-900/20',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <Card key={item.title} className="shadow-sm border-border/50">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                            <span className="text-2xl font-bold">{item.value.toLocaleString()}</span>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
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
