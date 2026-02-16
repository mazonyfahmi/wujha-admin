import { useEffect, useRef, useState } from 'react';
import {
    DollarSign,
    ShoppingBag,
    Users,
    Activity,
    TrendingUp,
    TrendingDown,
    Minus,
    Clock,
    Package,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DuotoneIcon } from '@/components/DuotoneIcon';
import { formatCurrency } from '@/lib/utils';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';

interface SparklineData {
    value: number;
}

interface KpiCardProps {
    title: string;
    value: number;
    format?: 'currency' | 'number';
    trend?: number; // percentage change
    icon: React.ElementType;
    sparklineData?: SparklineData[];
    accent: string; // tailwind color class
    delay?: number;
}

function useCountUp(end: number, duration = 1200, delay = 0) {
    const [value, setValue] = useState(0);
    const frameRef = useRef<number>();

    useEffect(() => {
        const timeout = setTimeout(() => {
            const startTime = performance.now();
            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // easeOutExpo
                const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                setValue(Math.floor(eased * end));
                if (progress < 1) {
                    frameRef.current = requestAnimationFrame(animate);
                }
            };
            frameRef.current = requestAnimationFrame(animate);
        }, delay);

        return () => {
            clearTimeout(timeout);
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [end, duration, delay]);

    return value;
}

function KpiCard({ title, value, format = 'number', trend, icon: Icon, sparklineData, accent, delay = 0 }: KpiCardProps) {
    const animatedValue = useCountUp(value, 1200, delay);

    const trendColor = trend && trend > 0 ? 'text-emerald-500' : trend && trend < 0 ? 'text-red-500' : 'text-muted-foreground';
    const TrendIcon = trend && trend > 0 ? TrendingUp : trend && trend < 0 ? TrendingDown : Minus;

    return (
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold tracking-tight">
                            {format === 'currency' ? formatCurrency(animatedValue) : animatedValue.toLocaleString()}
                        </p>
                        {trend !== undefined && (
                            <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                                <TrendIcon className="h-3 w-3" />
                                <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}%</span>
                                <span className="text-muted-foreground font-normal">vs last period</span>
                            </div>
                        )}
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${accent}/10 ${accent === 'primary' ? 'bg-primary/10' : ''}`}
                        style={{
                            backgroundColor: accent === 'emerald' ? 'rgb(16 185 129 / 0.1)' :
                                accent === 'blue' ? 'rgb(59 130 246 / 0.1)' :
                                    accent === 'amber' ? 'rgb(245 158 11 / 0.1)' :
                                        accent === 'violet' ? 'rgb(139 92 246 / 0.1)' :
                                            accent === 'rose' ? 'rgb(244 63 94 / 0.1)' :
                                                'hsl(var(--primary) / 0.1)'
                        }}
                    >
                        <Icon className="h-5 w-5"
                            style={{
                                color: accent === 'emerald' ? 'rgb(16 185 129)' :
                                    accent === 'blue' ? 'rgb(59 130 246)' :
                                        accent === 'amber' ? 'rgb(245 158 11)' :
                                            accent === 'violet' ? 'rgb(139 92 246)' :
                                                accent === 'rose' ? 'rgb(244 63 94)' :
                                                    'hsl(var(--primary))'
                            }}
                        />
                    </div>
                </div>
                {sparklineData && sparklineData.length > 0 && (
                    <div className="mt-4 h-10 -mx-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparklineData}>
                                <defs>
                                    <linearGradient id={`spark-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={
                                            accent === 'emerald' ? 'rgb(16 185 129)' :
                                                accent === 'blue' ? 'rgb(59 130 246)' :
                                                    accent === 'amber' ? 'rgb(245 158 11)' :
                                                        accent === 'violet' ? 'rgb(139 92 246)' :
                                                            accent === 'rose' ? 'rgb(244 63 94)' :
                                                                'hsl(var(--primary))'
                                        } stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={
                                            accent === 'emerald' ? 'rgb(16 185 129)' :
                                                accent === 'blue' ? 'rgb(59 130 246)' :
                                                    accent === 'amber' ? 'rgb(245 158 11)' :
                                                        accent === 'violet' ? 'rgb(139 92 246)' :
                                                            accent === 'rose' ? 'rgb(244 63 94)' :
                                                                'hsl(var(--primary))'
                                        } stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={
                                        accent === 'emerald' ? 'rgb(16 185 129)' :
                                            accent === 'blue' ? 'rgb(59 130 246)' :
                                                accent === 'amber' ? 'rgb(245 158 11)' :
                                                    accent === 'violet' ? 'rgb(139 92 246)' :
                                                        accent === 'rose' ? 'rgb(244 63 94)' :
                                                            'hsl(var(--primary))'
                                    }
                                    fill={`url(#spark-${title.replace(/\s/g, '')})`}
                                    strokeWidth={1.5}
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface DashboardStatsProps {
    stats: {
        total_revenue: number;
        total_orders: number;
        active_customers: number;
        sales_today: number;
        active_now: number;
        pending_orders: number;
    };
    monthlyTrend?: { month: number; year: number; total: number; count: number }[];
}

export function DashboardStats({ stats, monthlyTrend = [] }: DashboardStatsProps) {
    // Compute real trends from monthly data
    const computeTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const currentMonthRevenue = monthlyTrend.length > 0 ? Number(monthlyTrend[monthlyTrend.length - 1]?.total || 0) : 0;
    const previousMonthRevenue = monthlyTrend.length > 1 ? Number(monthlyTrend[monthlyTrend.length - 2]?.total || 0) : 0;
    const revenueTrend = computeTrend(currentMonthRevenue, previousMonthRevenue);

    const currentMonthOrders = monthlyTrend.length > 0 ? monthlyTrend[monthlyTrend.length - 1]?.count || 0 : 0;
    const previousMonthOrders = monthlyTrend.length > 1 ? monthlyTrend[monthlyTrend.length - 2]?.count || 0 : 0;
    const ordersTrend = computeTrend(currentMonthOrders, previousMonthOrders);

    const revenueSparkline = monthlyTrend.map(m => ({ value: Number(m.total) }));
    const ordersSparkline = monthlyTrend.map(m => ({ value: m.count }));

    const kpis: KpiCardProps[] = [
        {
            title: 'Total Revenue',
            value: stats.total_revenue,
            format: 'currency',
            trend: revenueTrend,
            icon: (props) => <DuotoneIcon src="/icons/banknote-2.528025.svg" {...props} />,
            sparklineData: revenueSparkline,
            accent: 'emerald',
            delay: 0,
        },
        {
            title: 'Total Orders',
            value: stats.total_orders,
            format: 'number',
            trend: ordersTrend,
            icon: (props) => <DuotoneIcon src="/icons/bag-4.528016.svg" {...props} />,
            sparklineData: ordersSparkline,
            accent: 'blue',
            delay: 100,
        },
        {
            title: 'Active Customers',
            value: stats.active_customers,
            format: 'number',
            icon: (props) => <DuotoneIcon src="/icons/users-group-rounded.527963.svg" {...props} />,
            accent: 'violet',
            delay: 200,
        },
        {
            title: 'Orders Today',
            value: stats.sales_today,
            format: 'number',
            icon: (props) => <DuotoneIcon src="/icons/graph-new-up.528301.svg" {...props} />,
            accent: 'amber',
            delay: 300,
        },
        {
            title: 'Pending Orders',
            value: stats.pending_orders,
            format: 'number',
            icon: (props) => <DuotoneIcon src="/icons/clock-circle.528155.svg" {...props} />,
            accent: 'rose',
            delay: 400,
        },
        {
            title: 'Total Services',
            value: 0, // Will be passed dynamically
            format: 'number',
            icon: (props) => <DuotoneIcon src="/icons/box-minimalistic.527629.svg" {...props} />,
            accent: 'primary',
            delay: 500,
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {kpis.map((kpi) => (
                <KpiCard key={kpi.title} {...kpi} />
            ))}
        </div>
    );
}
