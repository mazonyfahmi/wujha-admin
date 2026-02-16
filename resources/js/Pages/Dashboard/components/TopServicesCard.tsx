import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';
import { DuotoneIcon } from '@/components/DuotoneIcon';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

interface TopService {
    id: number;
    name: string;
    price: number;
    orders_count: number;
}

interface TopServicesCardProps {
    services: TopService[];
}

export function TopServicesCard({ services }: TopServicesCardProps) {
    const maxOrders = Math.max(...services.map(s => s.orders_count), 1);

    return (
        <Card className="border-border/50">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">Top Services</CardTitle>
                        <CardDescription>Best performing services this period</CardDescription>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                        <DuotoneIcon src="/icons/cup-star.527672.svg" className="h-4 w-4 text-amber-500" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {services.map((service, index) => {
                        const barWidth = (service.orders_count / maxOrders) * 100;
                        return (
                            <div key={service.id} className="group">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold bg-muted text-muted-foreground">
                                            {index + 1}
                                        </span>
                                        <span className="text-sm font-medium truncate">{service.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <Badge variant="outline" className="text-xs font-mono">
                                            {service.orders_count} orders
                                        </Badge>
                                        <span className="text-sm font-semibold w-20 text-right">
                                            {formatCurrency(service.price)}
                                        </span>
                                    </div>
                                </div>
                                {/* Progress bar */}
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-700 ease-out"
                                        style={{ width: `${barWidth}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                    {services.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">No service data available</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
