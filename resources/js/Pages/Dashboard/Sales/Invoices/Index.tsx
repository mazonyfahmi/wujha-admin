import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FileText, Plus, Search, Eye, Trash2, MoreHorizontal, ChevronLeft, ChevronRight, Printer, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';
import { InvoiceStats } from './components/InvoiceStats';

interface Invoice {
    id: number; increment_id: string; state: 'pending' | 'paid' | 'cancelled' | 'refunded';
    order_id: number; billing_address_name: string; grand_total: number; created_at: string;
    customer?: { first_name: string; last_name: string }; first_name: string; last_name: string;
}
interface Props {
    invoices: { data: Invoice[]; current_page: number; last_page: number; per_page: number; total: number; };
    filters: { state?: string; from_date?: string; to_date?: string; search?: string; };
    states: Record<string, string>;
}

const stateConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'destructive' | 'info'; icon: any }> = {
    pending: { label: 'Pending', variant: 'warning', icon: Clock },
    paid: { label: 'Paid', variant: 'success', icon: CheckCircle },
    cancelled: { label: 'Cancelled', variant: 'destructive', icon: XCircle },
    refunded: { label: 'Refunded', variant: 'info', icon: DollarSign },
};

export default function Index({ invoices, filters, states }: Props) {
    const [searchValue, setSearchValue] = useState(filters.search || '');

    const handleSearch = () => router.get('/sales/invoices', { ...filters, search: searchValue }, { preserveState: true });
    const handleFilter = (key: string, value: string | undefined) => router.get('/sales/invoices', { ...filters, [key]: value }, { preserveState: true });
    const handleDelete = (id: number) => { if (confirm('Delete this invoice?')) router.delete(`/sales/invoices/${id}`); };

    const customerName = (inv: Invoice) => inv.customer ? `${inv.customer.first_name} ${inv.customer.last_name}` : `${inv.first_name} ${inv.last_name}`;

    return (
        <DashboardLayout title="Invoices">
            <Head title="Invoices" />
            <div className="space-y-6">
                <PageHeader title="Invoices" description={`${invoices.total} total invoices`} icon={FileText} actions={
                    <Button asChild><Link href="/sales/invoices/create"><Plus className="h-4 w-4 mr-2" /> Create Invoice</Link></Button>
                } />

                // ... (in component)
                <InvoiceStats
                    total={invoices.total}
                    paid={invoices.data.filter(i => i.state === 'paid').length}
                    pending={invoices.data.filter(i => i.state === 'pending').length}
                    totalAmount={invoices.data.reduce((s, i) => s + i.grand_total, 0)}
                />

                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" placeholder="Search invoices..." value={searchValue}
                                    onChange={e => setSearchValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                            </div>
                            <Select value={filters.state || ''} onValueChange={v => handleFilter('state', v || undefined)}>
                                <SelectTrigger className="w-[140px]"><SelectValue placeholder="State" /></SelectTrigger>
                                <SelectContent>{Object.entries(stateConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                            </Select>
                            <Input type="date" className="w-[160px]" value={filters.from_date || ''} onChange={e => handleFilter('from_date', e.target.value || undefined)} />
                            <Input type="date" className="w-[160px]" value={filters.to_date || ''} onChange={e => handleFilter('to_date', e.target.value || undefined)} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.data.map(inv => {
                                const sc = stateConfig[inv.state] || stateConfig.pending;
                                return (
                                    <TableRow key={inv.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell><Link href={`/sales/invoices/${inv.id}`} className="font-medium text-primary hover:underline">{inv.increment_id || `INV-${inv.id}`}</Link></TableCell>
                                        <TableCell><Link href="/orders" className="text-primary hover:underline">#{inv.order_id}</Link></TableCell>
                                        <TableCell>{customerName(inv)}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(inv.grand_total)}</TableCell>
                                        <TableCell><Badge variant={sc.variant}>{sc.label}</Badge></TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(inv.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild><Link href={`/sales/invoices/${inv.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link></DropdownMenuItem>
                                                    <DropdownMenuItem asChild><Link href={`/sales/invoices/${inv.id}/print`} target="_blank"><Printer className="mr-2 h-4 w-4" /> Print</Link></DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(inv.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {invoices.data.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No invoices found</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                    {invoices.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-sm text-muted-foreground">
                                Showing {(invoices.current_page - 1) * invoices.per_page + 1}-{Math.min(invoices.current_page * invoices.per_page, invoices.total)} of {invoices.total}
                            </p>
                            <div className="flex gap-1">
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={invoices.current_page <= 1}
                                    onClick={() => router.get('/sales/invoices', { ...filters, page: invoices.current_page - 1 }, { preserveState: true })}><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={invoices.current_page >= invoices.last_page}
                                    onClick={() => router.get('/sales/invoices', { ...filters, page: invoices.current_page + 1 }, { preserveState: true })}><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}
