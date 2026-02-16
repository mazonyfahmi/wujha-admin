import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { DashboardStats } from './components/DashboardStats';
import { RecentActivity, ActivityItem } from './components/RecentActivity';
import { OrdersByStatusChart } from './components/OrdersByStatusChart';
import { TopServicesCard } from './components/TopServicesCard';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
    Download, Plus, ShoppingCart, ArrowRight, Calendar,
    Sparkles,
} from 'lucide-react';
import { DuotoneIcon } from '@/components/DuotoneIcon';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface Stats {
    total_orders: number;
    pending_orders: number;
    active_customers: number;
    total_services: number;
    monthly_revenue: number;
    orders_today: number;
}

interface Order {
    id: number;
    customer: { full_name?: string; name?: string } | null;
    service: { name: string } | null;
    status: string;
    price: number;
    created_at: string;
}

interface TopService {
    id: number;
    name: string;
    price: number;
    orders_count: number;
}

interface MonthlyTrend {
    month: number;
    year: number;
    total: number;
    count: number;
}

interface Props {
    stats: Stats;
    invoiceStats: any;
    refundStats: any;
    recentOrders: Order[];
    ordersByStatus: Record<string, number>;
    topServices: TopService[];
    recentInvoices: any[];
    recentRefunds: any[];
    monthlyTrend: MonthlyTrend[];
}

const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const IconSun = ({ className }: { className?: string }) => <DuotoneIcon src="/icons/sun-2.528189.svg" className={className} />;
const IconCloudSun = ({ className }: { className?: string }) => <DuotoneIcon src="/icons/cloud-sun.528171.svg" className={className} />;
const IconMoon = ({ className }: { className?: string }) => <DuotoneIcon src="/icons/moon.528415.svg" className={className} />;

function getGreeting(): { text: string; icon: React.ElementType } {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: IconSun };
    if (hour < 17) return { text: 'Good afternoon', icon: IconCloudSun };
    return { text: 'Good evening', icon: IconMoon };
}

const mapOrdersToActivity = (orders: Order[]): ActivityItem[] => {
    return orders.map(order => ({
        id: order.id,
        type: 'order' as const,
        user: {
            name: order.customer?.name || order.customer?.full_name || 'Guest',
        },
        action: 'placed order',
        target: `#${order.id}`,
        amount: `+${formatCurrency(order.price)}`,
        time: order.created_at,
    }));
};

export default function Index({
    stats,
    invoiceStats,
    refundStats,
    recentOrders,
    ordersByStatus,
    topServices,
    recentInvoices,
    recentRefunds,
    monthlyTrend,
}: Props) {
    const [chartType, setChartType] = useState<'area' | 'bar'>('area');
    const greeting = getGreeting();
    const GreetingIcon = greeting.icon;

    const dashboardStats = {
        total_revenue: stats.monthly_revenue * 12,
        total_orders: stats.total_orders,
        active_customers: stats.active_customers,
        sales_today: stats.orders_today,
        active_now: stats.pending_orders,
        pending_orders: stats.pending_orders,
    };

    const recentActivity = mapOrdersToActivity(recentOrders);

    const chartData = monthlyTrend.map((item) => ({
        name: `${monthNames[item.month]}`,
        revenue: Number(item.total),
        orders: item.count,
    }));

    return (
        <DashboardLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
                {/* Welcome Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <GreetingIcon className="h-5 w-5 text-amber-500" />
                            <h2 className="text-2xl font-bold tracking-tight">{greeting.text}</h2>
                        </div>
                        <p className="text-muted-foreground">
                            Here's an overview of your business today.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/orders">
                                <DuotoneIcon src="/icons/bag-4.528016.svg" className="mr-2 h-4 w-4" />
                                View Orders
                            </Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/services/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Service
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* KPI Stats Grid */}
                <DashboardStats stats={dashboardStats} monthlyTrend={monthlyTrend} />

                {/* Charts Row: Revenue + Orders by Status */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Revenue Chart — takes 2/3 */}
                    <Card className="lg:col-span-2 border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-base">Revenue Overview</CardTitle>
                                <CardDescription>Monthly revenue and order trends</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select value={chartType} onValueChange={(v: string) => setChartType(v as 'area' | 'bar')}>
                                    <SelectTrigger className="h-8 w-[100px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="area">Area</SelectItem>
                                        <SelectItem value="bar">Bar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    {chartType === 'area' ? (
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="rgb(59 130 246)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="rgb(59 130 246)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                className="text-xs"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                            />
                                            <YAxis
                                                className="text-xs"
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => `${value}`}
                                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--card))',
                                                    borderColor: 'hsl(var(--border))',
                                                    borderRadius: '8px',
                                                }}
                                                formatter={(value: any, name?: string) => [
                                                    name === 'revenue' ? formatCurrency(value) : value,
                                                    name === 'revenue' ? 'Revenue' : 'Orders'
                                                ]}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="hsl(var(--primary))"
                                                fillOpacity={1}
                                                fill="url(#colorRevenue)"
                                                strokeWidth={2}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="orders"
                                                stroke="rgb(59 130 246)"
                                                fillOpacity={1}
                                                fill="url(#colorOrders)"
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    ) : (
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                className="text-xs"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                            />
                                            <YAxis
                                                className="text-xs"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--card))',
                                                    borderColor: 'hsl(var(--border))',
                                                    borderRadius: '8px',
                                                }}
                                                formatter={(value: any, name?: string) => [
                                                    name === 'revenue' ? formatCurrency(value) : value,
                                                    name === 'revenue' ? 'Revenue' : 'Orders'
                                                ]}
                                            />
                                            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="orders" fill="rgb(59 130 246)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                            {/* Chart legend */}
                            <div className="flex items-center justify-center gap-6 mt-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                                    <span className="text-xs text-muted-foreground">Revenue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                                    <span className="text-xs text-muted-foreground">Orders</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Orders by Status Donut — takes 1/3 */}
                    <OrdersByStatusChart ordersByStatus={ordersByStatus} />
                </div>

                {/* Bottom Row: Top Services + Recent Activity + Recent Orders */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Top Services */}
                    <TopServicesCard services={topServices} />

                    {/* Recent Activity */}
                    <Card className="border-border/50">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Recent Activity</CardTitle>
                                    <CardDescription>Latest actions in your store</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" className="text-xs" asChild>
                                    <Link href="/orders">
                                        View all
                                        <ArrowRight className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <RecentActivity activities={recentActivity} />
                        </CardContent>
                    </Card>

                    {/* Recent Orders Quick List */}
                    <Card className="border-border/50">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Recent Orders</CardTitle>
                                    <CardDescription>Latest incoming orders</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" className="text-xs" asChild>
                                    <Link href="/orders">
                                        View all
                                        <ArrowRight className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentOrders.slice(0, 7).map((order) => (
                                    <Link
                                        key={order.id}
                                        href="/orders"
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                                            <DuotoneIcon src="/icons/bag-4.528016.svg" className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-tight">Order #{order.id}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {order.customer?.name || order.customer?.full_name || 'Guest'}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <StatusBadge status={order.status} type="order" />
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {formatCurrency(order.price)}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                                {recentOrders.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
