import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { RotateCcw, Plus, Search, Eye, Trash2, MoreHorizontal, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, DollarSign, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';

interface Refund {
    id: number; increment_id: string; state: 'pending' | 'approved' | 'rejected' | 'processed';
    refund_type: string; order_id: number; invoice_id: number; grand_total: number; created_at: string;
    customer?: { first_name: string; last_name: string }; first_name: string; last_name: string;
}
interface Props {
    refunds: { data: Refund[]; current_page: number; last_page: number; per_page: number; total: number; };
    filters: { state?: string; refund_type?: string; from_date?: string; to_date?: string; search?: string; };
    states: Record<string, string>; types: Record<string, string>;
}

const stateConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'destructive' | 'info' }> = {
    pending: { label: 'Pending', variant: 'warning' },
    approved: { label: 'Approved', variant: 'info' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    processed: { label: 'Processed', variant: 'success' },
};

export default function Index({ refunds, filters, states, types }: Props) {
    const [searchValue, setSearchValue] = useState(filters.search || '');

    const handleSearch = () => router.get('/sales/refunds', { ...filters, search: searchValue }, { preserveState: true });
    const handleFilter = (key: string, value: string | undefined) => router.get('/sales/refunds', { ...filters, [key]: value }, { preserveState: true });
    const handleDelete = (id: number) => { if (confirm('Delete this refund?')) router.delete(`/sales/refunds/${id}`); };

    const customerName = (r: Refund) => r.customer ? `${r.customer.first_name} ${r.customer.last_name}` : `${r.first_name} ${r.last_name}`;

    return (
        <DashboardLayout title="Refunds">
            <Head title="Refunds" />
            <div className="space-y-6">
                <PageHeader title="Refunds" description={`${refunds.total} total refunds`} icon={RotateCcw} actions={
                    <Button asChild><Link href="/sales/refunds/create"><Plus className="h-4 w-4 mr-2" /> Create Refund</Link></Button>
                } />

                {/* Refund Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="shadow-sm border-border/50">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Total Refunds</p>
                                <span className="text-2xl font-bold">{refunds.total}</span>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                                <RotateCcw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-border/50">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                                <span className="text-2xl font-bold">{refunds.data.filter(r => r.state === 'approved').length}</span>
                            </div>
                            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-border/50">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <span className="text-2xl font-bold">{refunds.data.filter(r => r.state === 'pending').length}</span>
                            </div>
                            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/20">
                                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-border/50">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Total Refunded</p>
                                <span className="text-2xl font-bold">{formatCurrency(refunds.data.reduce((s, r) => s + r.grand_total, 0))}</span>
                            </div>
                            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                                <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-9" placeholder="Search refunds..." value={searchValue}
                                    onChange={e => setSearchValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                            </div>
                            <Select value={filters.state || ''} onValueChange={v => handleFilter('state', v || undefined)}>
                                <SelectTrigger className="w-[130px]"><SelectValue placeholder="State" /></SelectTrigger>
                                <SelectContent>{Object.entries(stateConfig).map(([k, c]) => <SelectItem key={k} value={k}>{c.label}</SelectItem>)}</SelectContent>
                            </Select>
                            <Select value={filters.refund_type || ''} onValueChange={v => handleFilter('refund_type', v || undefined)}>
                                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Type" /></SelectTrigger>
                                <SelectContent>{Object.entries(types).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
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
                                <TableHead>Refund #</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {refunds.data.map(r => {
                                const sc = stateConfig[r.state] || stateConfig.pending;
                                return (
                                    <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell><Link href={`/sales/refunds/${r.id}`} className="font-medium text-primary hover:underline">{r.increment_id || `REF-${r.id}`}</Link></TableCell>
                                        <TableCell><Link href="/orders" className="text-primary hover:underline">#{r.order_id}</Link></TableCell>
                                        <TableCell>{customerName(r)}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(r.grand_total)}</TableCell>
                                        <TableCell><Badge variant="outline">{types[r.refund_type] || r.refund_type}</Badge></TableCell>
                                        <TableCell><Badge variant={sc.variant}>{sc.label}</Badge></TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(r.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild><Link href={`/sales/refunds/${r.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link></DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(r.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {refunds.data.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No refunds found</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                    {refunds.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-sm text-muted-foreground">
                                Showing {(refunds.current_page - 1) * refunds.per_page + 1}-{Math.min(refunds.current_page * refunds.per_page, refunds.total)} of {refunds.total}
                            </p>
                            <div className="flex gap-1">
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={refunds.current_page <= 1}
                                    onClick={() => router.get('/sales/refunds', { ...filters, page: refunds.current_page - 1 }, { preserveState: true })}><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={refunds.current_page >= refunds.last_page}
                                    onClick={() => router.get('/sales/refunds', { ...filters, page: refunds.current_page + 1 }, { preserveState: true })}><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}
