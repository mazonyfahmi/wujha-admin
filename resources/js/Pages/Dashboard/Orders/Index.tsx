import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { DuotoneIcon } from '@/components/DuotoneIcon';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { OrderTableView } from './components/OrderTableView';
import { OrderKanbanView } from './components/OrderKanbanView';
import { OrderDetailsSheet } from './components/OrderDetailsSheet';
import { Order, Service, Customer } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { OrderStats } from './components/OrderStats';

interface PaginatedLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedResponse<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: PaginatedLink[];
    };
}

interface Props {
    orders: PaginatedResponse<Order>;
    stats: {
        total: number;
        active: number;
        completed: number;
        canceled: number;
    };
    statuses: Record<string, string>;
    services?: Service[];
    customers?: Customer[];
}

const statusFlow: Record<string, string> = {
    pending: 'payment_confirmation',
    payment_confirmation: 'review',
    review: 'sent_to_agent',
    sent_to_agent: 'in_progress',
    in_progress: 'issued',
};

const statusColors: Record<string, string> = {
    pending: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
    payment_confirmation: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
    review: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
    sent_to_agent: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
    in_progress: 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800',
    issued: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800',
    rejected: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
};

const paymentMethods: Record<string, string> = {
    bank_transfer: 'Bank Transfer',
    mada: 'Mada',
    apple_pay: 'Apple Pay',
    cash: 'Cash',
};

export default function Index({ orders, stats, statuses, services = [], customers = [] }: Props) {
    const orderList = orders.data ?? [];
    const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
    const [formData, setFormData] = useState({
        service_id: '', customer_id: '', price: '', payment_method: 'bank_transfer', notes: '',
    });

    const handleStatusChange = (orderId: number, newStatus: string) => {
        router.patch(`/orders/${orderId}/status`, { status: newStatus }, {
            preserveScroll: true,
            onSuccess: () => {
                // Update selected order if it's open
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                }
            }
        });
    };

    const handleDelete = (orderId: number) => {
        router.delete(`/orders/${orderId}`, { preserveScroll: true });
        setDeleteOrder(null);
        setSelectedOrder(null);
    };

    const handleNextStatus = (order: Order) => {
        const nextStatus = statusFlow[order.status];
        if (nextStatus) handleStatusChange(order.id, nextStatus);
    };

    const handleAddOrder = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/orders', formData, {
            onSuccess: () => {
                setIsAddOpen(false);
                setFormData({ service_id: '', customer_id: '', price: '', payment_method: 'bank_transfer', notes: '' });
            },
        });
    };

    return (
        <DashboardLayout title="Orders">
            <Head title="Orders" />

            <div className="space-y-6 h-full flex flex-col">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <PageHeader
                            title="Orders"
                            description="Manage and track order fulfillment"
                            icon={(props) => <DuotoneIcon src="/icons/bag-4.528016.svg" {...props} />}
                        />

                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-muted rounded-lg p-1 mr-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={viewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground'}
                                    onClick={() => setViewMode('list')}
                                >
                                    <DuotoneIcon src="/icons/checklist.528147.svg" className="h-4 w-4 mr-2" /> List
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={viewMode === 'board' ? 'bg-background shadow-sm' : 'text-muted-foreground'}
                                    onClick={() => setViewMode('board')}
                                >
                                    <DuotoneIcon src="/icons/widget-2-svgrepo-com.svg" className="h-4 w-4 mr-2" /> Board
                                </Button>
                            </div>

                            <Button variant="outline" size="sm" onClick={() => router.reload()}>
                                <DuotoneIcon src="/icons/refresh-circle.528510.svg" className="h-4 w-4 mr-2" /> Refresh
                            </Button>

                            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm"><DuotoneIcon src="/icons/add-square.527587.svg" className="h-4 w-4 mr-2" /> New Order</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>New Order</DialogTitle>
                                        <DialogDescription>Create a new order manually.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleAddOrder} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Service</Label>
                                            <Select value={formData.service_id} onValueChange={(v) => setFormData({ ...formData, service_id: v })}>
                                                <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                                                <SelectContent>
                                                    {services.map((s) => (
                                                        <SelectItem key={s.id} value={String(s.id)}>
                                                            {s.name} — {formatCurrency(s.price)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Customer</Label>
                                            <Select value={formData.customer_id} onValueChange={(v) => setFormData({ ...formData, customer_id: v })}>
                                                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                                                <SelectContent>
                                                    {customers.map((c) => (
                                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Price (SDG)</Label>
                                            <Input type="number" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Payment Method</Label>
                                            <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(paymentMethods).map(([val, label]) => (
                                                        <SelectItem key={val} value={val}>{label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Notes</Label>
                                            <Textarea rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" className="w-full">Create Order</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <OrderStats stats={stats} />
                </div>

                {viewMode === 'list' ? (
                    <div className="bg-card rounded-xl border shadow-sm p-1">
                        <OrderTableView
                            orders={orderList}
                            statusFlow={statusFlow}
                            onStatusChange={handleStatusChange}
                            onDelete={setDeleteOrder}
                            onSelectOrder={setSelectedOrder}
                        />
                    </div>
                ) : (
                    <OrderKanbanView
                        orders={orderList}
                        statusFlow={statusFlow}
                        statusColors={statusColors}
                        onStatusChange={handleStatusChange}
                        onDelete={setDeleteOrder}
                        onSelectOrder={setSelectedOrder}
                    />
                )}
            </div>

            <OrderDetailsSheet
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onStatusChange={handleStatusChange}
                paymentMethods={paymentMethods}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteOrder} onOpenChange={(open) => !open && setDeleteOrder(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this order? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOrder(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => deleteOrder && handleDelete(deleteOrder.id)}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
