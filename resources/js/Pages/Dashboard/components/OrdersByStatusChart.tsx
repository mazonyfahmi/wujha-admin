import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface OrdersByStatusChartProps {
    ordersByStatus: Record<string, number>;
}

const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    pending_payment: '#f97316',
    processing: '#3b82f6',
    payment_review: '#8b5cf6',
    sent_to_agent: '#06b6d4',
    in_progress: '#2563eb',
    issued: '#10b981',
    completed: '#059669',
    canceled: '#ef4444',
    closed: '#6b7280',
    holded: '#a855f7',
    fraud: '#dc2626',
};

const statusLabels: Record<string, string> = {
    pending: 'Pending',
    pending_payment: 'Pending Payment',
    processing: 'Processing',
    payment_review: 'Payment Review',
    sent_to_agent: 'Sent to Agent',
    in_progress: 'In Progress',
    issued: 'Issued',
    completed: 'Completed',
    canceled: 'Canceled',
    closed: 'Closed',
    holded: 'On Hold',
    fraud: 'Fraud',
};

const CustomTooltipContent = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="rounded-lg bg-card border border-border shadow-lg px-3 py-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                    <span className="text-sm font-medium">{data.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {data.value} orders ({data.percentage}%)
                </p>
            </div>
        );
    }
    return null;
};

export function OrdersByStatusChart({ ordersByStatus }: OrdersByStatusChartProps) {
    const total = Object.values(ordersByStatus).reduce((sum, count) => sum + count, 0);

    const data = Object.entries(ordersByStatus)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
            name: status,
            label: statusLabels[status] || status,
            value: count,
            color: statusColors[status] || '#6b7280',
            percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0',
        }))
        .sort((a, b) => b.value - a.value);

    return (
        <Card className="border-border/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Orders by Status</CardTitle>
                <CardDescription>{total} total orders</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center">
                    <div className="h-[200px] w-[200px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltipContent />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold">{total}</span>
                            <span className="text-xs text-muted-foreground">Total</span>
                        </div>
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-4 w-full max-w-[280px]">
                        {data.slice(0, 6).map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-muted-foreground truncate">{item.label}</span>
                                <span className="text-xs font-medium ml-auto">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
