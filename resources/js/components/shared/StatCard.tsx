import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: { value: number; positive: boolean };
    className?: string;
    iconColor?: string;
}

export function StatCard({ title, value, icon: Icon, description, trend, className, iconColor }: StatCardProps) {
    return (
        <Card className={cn('relative overflow-hidden', className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                        {trend && (
                            <p className={cn('text-xs font-medium', trend.positive ? 'text-emerald-600' : 'text-red-600')}>
                                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </p>
                        )}
                    </div>
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', iconColor || 'bg-primary/10')}>
                        <Icon className={cn('h-6 w-6', iconColor ? 'text-white' : 'text-primary')} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
