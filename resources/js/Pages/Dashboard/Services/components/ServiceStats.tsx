import { DuotoneIcon } from '@/components/DuotoneIcon';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ServiceStatsProps {
    total: number;
    active: number;
    inactive: number;
}

export function ServiceStats({ total, active, inactive }: ServiceStatsProps) {
    const items = [
        {
            title: 'Total Services',
            value: total,
            icon: 'box-minimalistic.527629.svg',
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            title: 'Active Services',
            value: active,
            icon: 'check-circle.527633.svg',
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-100 dark:bg-emerald-900/20',
        },
        {
            title: 'Inactive Services',
            value: inactive,
            icon: 'close-circle.527651.svg',
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-100 dark:bg-red-900/20',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-3">
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
