import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Shield, Eye, Trash2, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/shared/PageHeader';

interface GDPRRequest {
    id: number; email: string; type: 'delete' | 'export' | 'update';
    status: 'pending' | 'completed' | 'declined'; message: string; created_at: string;
    customer: { id: number; full_name: string };
}
interface Props {
    requests: { data: GDPRRequest[]; current_page: number; total: number; per_page: number; last_page: number };
    filters: { status?: string; type?: string };
}

const typeConfig: Record<string, { label: string; variant: 'destructive' | 'info' | 'warning' }> = {
    delete: { label: 'Delete', variant: 'destructive' }, export: { label: 'Export', variant: 'info' }, update: { label: 'Update', variant: 'warning' },
};
const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'destructive' }> = {
    pending: { label: 'Pending', variant: 'warning' }, completed: { label: 'Completed', variant: 'success' }, declined: { label: 'Declined', variant: 'destructive' },
};

export default function Index({ requests, filters }: Props) {
    const handleFilter = (key: string, value: string | undefined) => router.get('/gdpr', { ...filters, [key]: value }, { preserveState: true });
    const handleDelete = (id: number) => { if (confirm('Delete this request?')) router.delete(`/gdpr/${id}`); };

    return (
        <DashboardLayout title="GDPR Requests">
            <Head title="GDPR Requests" />
            <div className="space-y-6">
                <PageHeader title="GDPR Requests" description="Manage data access and deletion requests" icon={Shield} />
                <Card><CardContent className="p-4">
                    <div className="flex flex-wrap gap-3">
                        <Select value={filters.status || ''} onValueChange={v => handleFilter('status', v || undefined)}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>{Object.entries(statusConfig).map(([k, c]) => <SelectItem key={k} value={k}>{c.label}</SelectItem>)}</SelectContent></Select>
                        <Select value={filters.type || ''} onValueChange={v => handleFilter('type', v || undefined)}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
                            <SelectContent>{Object.entries(typeConfig).map(([k, c]) => <SelectItem key={k} value={k}>{c.label}</SelectItem>)}</SelectContent></Select>
                    </div>
                </CardContent></Card>

                <Card>
                    <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Type</TableHead><TableHead>Customer</TableHead><TableHead>Message</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {requests.data.map(r => (
                                <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium">#{r.id}</TableCell>
                                    <TableCell><Badge variant={typeConfig[r.type]?.variant || 'default'}>{typeConfig[r.type]?.label || r.type}</Badge></TableCell>
                                    <TableCell><div><p className="font-medium">{r.customer?.full_name}</p><p className="text-xs text-muted-foreground">{r.email}</p></div></TableCell>
                                    <TableCell className="max-w-[200px] truncate text-muted-foreground">{r.message}</TableCell>
                                    <TableCell><Badge variant={statusConfig[r.status]?.variant || 'default'}>{statusConfig[r.status]?.label || r.status}</Badge></TableCell>
                                    <TableCell className="text-muted-foreground">{formatDate(r.created_at)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild><Link href={`/gdpr/${r.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link></DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(r.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {requests.data.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No GDPR requests</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                    {(requests.last_page || 1) > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-sm text-muted-foreground">Showing {(requests.current_page - 1) * requests.per_page + 1}-{Math.min(requests.current_page * requests.per_page, requests.total)} of {requests.total}</p>
                            <div className="flex gap-1">
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={requests.current_page <= 1} onClick={() => router.get('/gdpr', { ...filters, page: requests.current_page - 1 }, { preserveState: true })}><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={requests.current_page >= (requests.last_page || 1)} onClick={() => router.get('/gdpr', { ...filters, page: requests.current_page + 1 }, { preserveState: true })}><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}
