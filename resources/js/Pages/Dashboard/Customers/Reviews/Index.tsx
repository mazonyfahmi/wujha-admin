import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Star, Edit, Trash2, CheckCircle, XCircle, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/shared/PageHeader';

interface ServiceReview {
    id: number; title: string; rating: number; comment: string;
    status: 'pending' | 'approved' | 'disapproved'; created_at: string;
    service: { id: number; name: string }; customer: { id: number; full_name: string };
}
interface Props { reviews: { data: ServiceReview[]; current_page: number; total: number; per_page: number; last_page: number }; filters: { status?: string }; }

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'destructive' }> = {
    pending: { label: 'Pending', variant: 'warning' }, approved: { label: 'Approved', variant: 'success' }, disapproved: { label: 'Rejected', variant: 'destructive' },
};

export default function Index({ reviews, filters }: Props) {
    const handleStatusUpdate = (id: number, status: string) => router.put(`/reviews/${id}`, { status }, { preserveScroll: true });
    const handleDelete = (id: number) => { if (confirm('Delete this review?')) router.delete(`/reviews/${id}`); };

    const renderStars = (rating: number) => (
        <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />)}</div>
    );

    return (
        <DashboardLayout title="Reviews">
            <Head title="Reviews" />
            <div className="space-y-6">
                <PageHeader title="Reviews" description={`${reviews.total} reviews`} icon={Star} />
                <Card><CardContent className="p-4">
                    <Select value={filters.status || ''} onValueChange={v => router.get('/reviews', v ? { status: v } : {}, { preserveState: true })}>
                        <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                        <SelectContent>{Object.entries(statusConfig).map(([k, c]) => <SelectItem key={k} value={k}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                </CardContent></Card>

                <Card>
                    <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Review</TableHead><TableHead>Comment</TableHead><TableHead>Customer</TableHead><TableHead>Service</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {reviews.data.map(r => (
                                <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>#{r.id}</TableCell>
                                    <TableCell><div><p className="font-medium text-sm">{r.title}</p>{renderStars(r.rating)}</div></TableCell>
                                    <TableCell className="max-w-[200px] truncate text-muted-foreground">{r.comment}</TableCell>
                                    <TableCell>{r.customer?.full_name || 'Guest'}</TableCell>
                                    <TableCell>{r.service?.name}</TableCell>
                                    <TableCell><Badge variant={statusConfig[r.status]?.variant || 'default'}>{statusConfig[r.status]?.label || r.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {r.status === 'pending' && <>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, 'approved')}><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, 'disapproved')}><XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                </>}
                                                <DropdownMenuItem asChild><Link href={`/reviews/${r.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit</Link></DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(r.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {reviews.data.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No reviews found</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                    {(reviews.last_page || 1) > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-sm text-muted-foreground">Showing {(reviews.current_page - 1) * reviews.per_page + 1}-{Math.min(reviews.current_page * reviews.per_page, reviews.total)} of {reviews.total}</p>
                            <div className="flex gap-1">
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={reviews.current_page <= 1} onClick={() => router.get('/reviews', { ...filters, page: reviews.current_page - 1 }, { preserveState: true })}><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={reviews.current_page >= (reviews.last_page || 1)} onClick={() => router.get('/reviews', { ...filters, page: reviews.current_page + 1 }, { preserveState: true })}><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}
