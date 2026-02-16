import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Users, Plus, Search, Eye, Edit, Trash2, Ban, CheckCircle,
    MoreHorizontal, ChevronLeft, ChevronRight, Shield, ShieldOff, X, Download,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PageHeader } from '@/components/shared/PageHeader';
import { CustomerStats } from './components/CustomerStats';
import { CustomerDetailSheet } from './components/CustomerDetailSheet';

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string | null;
    gender: 'male' | 'female' | 'other' | null;
    status: boolean;
    is_suspended: boolean;
    is_verified: boolean;
    orders_count: number;
    created_at: string;
    avatar: string | null;
}

interface CustomerGroup {
    id: number;
    name: string;
}

interface Props {
    customers: {
        data: Customer[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    groups: CustomerGroup[];
    filters: {
        search?: string;
        status?: string;
        is_suspended?: string;
        gender?: string;
    };
}

export default function Index({ customers, groups, filters }: Props) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Compute stats from data
    const activeCount = customers.data.filter(c => c.status).length;
    const suspendedCount = customers.data.filter(c => c.is_suspended).length;

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: undefined as string | undefined,
        date_of_birth: '',
        customer_group_id: undefined as string | undefined,
        password: '',
        status: true,
        is_suspended: false,
        subscribed_to_news_letter: false,
    });

    const handleSearch = () => {
        router.get('/customers', { ...filters, search: searchValue }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string | undefined) => {
        router.get('/customers', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            router.delete(`/customers/${id}`);
        }
    };

    const handleToggleSuspension = (id: number) => {
        router.patch(`/customers/${id}/toggle-suspension`, {});
    };

    const handleBulkDelete = () => {
        if (confirm(`Delete ${selectedIds.length} selected customers?`)) {
            router.post('/customers/bulk-delete', { ids: selectedIds }, {
                onSuccess: () => setSelectedIds([]),
            });
        }
    };

    const handleBulkStatusUpdate = (status: boolean) => {
        router.post('/customers/bulk-status', { ids: selectedIds, status }, {
            onSuccess: () => setSelectedIds([]),
        });
    };

    const handleCreate = () => {
        post('/customers', {
            onSuccess: () => { setIsCreateOpen(false); reset(); },
        });
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === customers.data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(customers.data.map((c) => c.id));
        }
    };

    const genderLabels: Record<string, string> = { male: 'Male', female: 'Female', other: 'Other' };

    return (
        <DashboardLayout title="Customers">
            <Head title="Customers" />
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Customer Stats */}
                    <CustomerStats
                        total={customers.total}
                        active={activeCount}
                        inactive={customers.data.length - activeCount}
                        suspended={suspendedCount}
                    />
                    <PageHeader
                        title="Customers"
                        description={`${customers.total} total customers`}
                        icon={Users}
                        actions={
                            <Dialog open={isCreateOpen} onOpenChange={(open) => { if (open) clearErrors(); setIsCreateOpen(open); }}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="h-4 w-4 mr-2" /> Add Customer</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Add Customer</DialogTitle>
                                        <DialogDescription>Create a new customer account.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>First Name *</Label>
                                            <Input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                                            {errors.first_name && <p className="text-xs text-destructive">{errors.first_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Last Name *</Label>
                                            <Input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
                                            {errors.last_name && <p className="text-xs text-destructive">{errors.last_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email *</Label>
                                            <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Gender</Label>
                                            <Select value={data.gender} onValueChange={(v) => setData('gender', v)}>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date of Birth</Label>
                                            <Input type="date" value={data.date_of_birth} onChange={(e) => setData('date_of_birth', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Group</Label>
                                            <Select value={data.customer_group_id} onValueChange={(v) => setData('customer_group_id', v)}>
                                                <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                                                <SelectContent>
                                                    {groups.map((g) => (
                                                        <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Password</Label>
                                            <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Leave blank to auto-generate" />
                                            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 mt-4">
                                        <label className="flex items-center gap-2 text-sm">
                                            <Checkbox checked={data.status} onCheckedChange={(c) => setData('status', !!c)} /> Active
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <Checkbox checked={data.is_suspended} onCheckedChange={(c) => setData('is_suspended', !!c)} /> Suspended
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <Checkbox checked={data.subscribed_to_news_letter} onCheckedChange={(c) => setData('subscribed_to_news_letter', !!c)} /> Newsletter
                                        </label>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                        <Button onClick={handleCreate} disabled={processing}>Save Customer</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        }
                    />

                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-wrap gap-3 items-center">
                                <div className="relative w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        placeholder="Search by name, email, or phone..."
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                                <Select value={filters.status || ''} onValueChange={(v) => handleFilter('status', v || undefined)}>
                                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filters.is_suspended || ''} onValueChange={(v) => handleFilter('is_suspended', v || undefined)}>
                                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Suspension" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Suspended</SelectItem>
                                        <SelectItem value="no">Not Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filters.gender || ''} onValueChange={(v) => handleFilter('gender', v || undefined)}>
                                    <SelectTrigger className="w-[120px]"><SelectValue placeholder="Gender" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>

                            </div>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedIds.length === customers.data.length && customers.data.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead className="text-center">Orders</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.data.map((customer) => (
                                    <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedCustomer(customer)}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(customer.id)}
                                                onCheckedChange={() => toggleSelect(customer.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    {customer.avatar && <AvatarImage src={customer.avatar} />}
                                                    <AvatarFallback className={cn(customer.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700')}>
                                                        {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-medium">{customer.full_name}</span>
                                                        {customer.is_verified && (
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>Email Verified</TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{customer.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{customer.phone || <span className="text-muted-foreground">—</span>}</TableCell>
                                        <TableCell>{customer.gender ? genderLabels[customer.gender] : <span className="text-muted-foreground">—</span>}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={customer.orders_count > 0 ? 'info' : 'outline'}>{customer.orders_count}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <Badge variant={customer.status ? 'success' : 'destructive'}>
                                                    {customer.status ? 'Active' : 'Inactive'}
                                                </Badge>
                                                {customer.is_suspended && (
                                                    <Badge variant="warning">Suspended</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/customers/${customer.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/customers/${customer.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleSuspension(customer.id)}>
                                                        {customer.is_suspended
                                                            ? <><Shield className="mr-2 h-4 w-4" /> Unsuspend</>
                                                            : <><ShieldOff className="mr-2 h-4 w-4" /> Suspend</>
                                                        }
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(customer.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {customers.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                            No customers found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {customers.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-sm text-muted-foreground">
                                    Showing {(customers.current_page - 1) * customers.per_page + 1}-
                                    {Math.min(customers.current_page * customers.per_page, customers.total)} of {customers.total}
                                </p>
                                <div className="flex gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={customers.current_page <= 1}
                                        onClick={() => router.get('/customers', { ...filters, page: customers.current_page - 1 }, { preserveState: true })}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={customers.current_page >= customers.last_page}
                                        onClick={() => router.get('/customers', { ...filters, page: customers.current_page + 1 }, { preserveState: true })}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Customer Detail Sheet */}
                <CustomerDetailSheet
                    customer={selectedCustomer}
                    isOpen={!!selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    onToggleSuspension={handleToggleSuspension}
                />

                {/* Floating Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
                        <div className="flex items-center gap-3 rounded-xl border bg-card/95 backdrop-blur-sm shadow-2xl px-5 py-3">
                            <span className="text-sm font-medium tabular-nums">
                                {selectedIds.length} customer{selectedIds.length > 1 ? 's' : ''} selected
                            </span>
                            <div className="h-5 w-px bg-border" />
                            <Button size="sm" variant="outline" className="h-8" onClick={() => handleBulkStatusUpdate(true)}>
                                <CheckCircle className="mr-2 h-3.5 w-3.5" /> Activate
                            </Button>
                            <Button size="sm" variant="outline" className="h-8" onClick={() => handleBulkStatusUpdate(false)}>
                                <Ban className="mr-2 h-3.5 w-3.5" /> Deactivate
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8" onClick={handleBulkDelete}>
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8" onClick={() => setSelectedIds([])}>
                                <X className="mr-2 h-3.5 w-3.5" /> Clear
                            </Button>
                        </div>
                    </div>
                )}
            </TooltipProvider>
        </DashboardLayout>
    );
}
