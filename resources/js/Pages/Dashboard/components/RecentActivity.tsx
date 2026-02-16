import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, UserPlus, CreditCard, Star, ArrowRightLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DuotoneIcon } from '@/components/DuotoneIcon';

export interface ActivityItem {
    id: number;
    type: 'order' | 'customer' | 'payment' | 'review' | 'status_change';
    user: {
        name: string;
        avatar?: string;
    };
    action: string;
    target: string;
    amount?: string;
    time: string;
    relativeTime?: string;
}

interface RecentActivityProps {
    activities: ActivityItem[];
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    order: {
        icon: (props) => <DuotoneIcon src="/icons/bag-4.528016.svg" {...props} />,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    customer: {
        icon: (props) => <DuotoneIcon src="/icons/user-plus.527957.svg" {...props} />,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10'
    },
    payment: {
        icon: (props) => <DuotoneIcon src="/icons/card-recive.528095.svg" {...props} />,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10'
    },
    review: {
        icon: (props) => <DuotoneIcon src="/icons/star.527909.svg" {...props} />,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10'
    },
    status_change: {
        icon: (props) => <DuotoneIcon src="/icons/round-transfer-horizontal.528556.svg" {...props} />,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10'
    },
};

function getRelativeTime(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
        return dateStr;
    }
}

export function RecentActivity({ activities }: RecentActivityProps) {
    if (activities.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p className="text-sm">No recent activity</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[400px]">
            <div className="space-y-1 pr-4">
                {activities.map((activity, index) => {
                    const config = typeConfig[activity.type] || typeConfig.order;
                    const Icon = config.icon;

                    return (
                        <div
                            key={activity.id}
                            className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-muted/50 transition-colors cursor-default group"
                        >
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                                <Icon className={`h-4 w-4 ${config.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm leading-tight">
                                    <span className="font-medium">{activity.user.name}</span>{' '}
                                    <span className="text-muted-foreground">{activity.action}</span>{' '}
                                    <span className="font-medium">{activity.target}</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {activity.relativeTime || getRelativeTime(activity.time)}
                                </p>
                            </div>
                            {activity.amount && (
                                <Badge
                                    variant="outline"
                                    className={`shrink-0 font-mono text-xs ${activity.amount.startsWith('+') ? 'text-emerald-500 border-emerald-500/30' : 'text-muted-foreground'
                                        }`}
                                >
                                    {activity.amount}
                                </Badge>
                            )}
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
