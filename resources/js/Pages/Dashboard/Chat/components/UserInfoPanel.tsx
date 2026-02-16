import { Mail, Phone, ShoppingBag, Calendar, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UserInfo {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    created_at?: string;
    orders_count?: number;
    orders_total?: number;
    last_order_at?: string;
}

function getInitials(name: string): string {
    return name.split(' ').map((n) => n.charAt(0)).join('').toUpperCase().slice(0, 2);
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SDG', minimumFractionDigits: 0 }).format(amount);
}

function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

interface UserInfoPanelProps {
    user: UserInfo;
    onClose: () => void;
}

export function UserInfoPanel({ user, onClose }: UserInfoPanelProps) {
    return (
        <div className="w-72 border-l flex flex-col bg-card overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                <h3 className="text-sm font-semibold">User Details</h3>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Profile */}
            <div className="flex flex-col items-center py-6 px-4">
                <Avatar className="h-16 w-16 mb-3">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
                <h4 className="font-semibold text-sm">{user.name}</h4>
                <Badge variant="secondary" className="mt-1.5 text-[10px]">
                    {user.role || 'User'}
                </Badge>
            </div>

            <Separator />

            {/* Contact Info */}
            <div className="px-4 py-4 space-y-3">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</h5>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Mail className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground">Email</p>
                        <p className="text-xs font-medium truncate">{user.email}</p>
                    </div>
                </div>
                {user.phone && (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Phone className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground">Phone</p>
                            <p className="text-xs font-medium">{user.phone}</p>
                        </div>
                    </div>
                )}
                {user.created_at && (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                            <Calendar className="h-3.5 w-3.5 text-purple-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground">Joined</p>
                            <p className="text-xs font-medium">
                                {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <Separator />

            {/* Order Stats */}
            <div className="px-4 py-4 space-y-3">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Orders</h5>
                <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-lg font-bold text-foreground">{user.orders_count ?? 0}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Total Orders</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-lg font-bold text-foreground">
                            {user.orders_total ? formatCurrency(user.orders_total) : '0'}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Revenue</p>
                    </div>
                </div>
                {user.last_order_at && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>Last order: {timeAgo(user.last_order_at)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
