import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Users2, Plus, Edit, Trash2, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/shared/PageHeader';

interface CustomerGroup { id: number; code: string; name: string; is_user_defined: boolean; created_at: string; }
interface Props { groups: { data: CustomerGroup[]; current_page: number; total: number; per_page: number; last_page: number }; }

export default function Index({ groups }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ code: '', name: '' });

    const handleCreate = () => { post('/customer-groups', { onSuccess: () => { setCreateOpen(false); reset(); } }); };
    const handleDelete = (id: number) => { if (confirm('Delete this group?')) router.delete(`/customer-groups/${id}`); };

    return (
        <DashboardLayout title="Customer Groups">
            <Head title="Customer Groups" />
            <div className="space-y-6">
                <PageHeader title="Customer Groups" description="Manage customer classifications" icon={Users2} actions={<Button onClick={() => { clearErrors(); reset(); setCreateOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Create Group</Button>} />
                <Card>
                    <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {groups.data.map(g => (
                                <TableRow key={g.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>#{g.id}</TableCell>
                                    <TableCell><Badge variant="outline">{g.code}</Badge></TableCell>
                                    <TableCell className="font-medium">{g.name}</TableCell>
                                    <TableCell><Badge variant={g.is_user_defined ? 'info' : 'secondary'}>{g.is_user_defined ? 'Custom' : 'System'}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild><Link href={`/customer-groups/${g.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Edit</Link></DropdownMenuItem>
                                                {g.is_user_defined && <><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive" onClick={() => handleDelete(g.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></>}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {groups.data.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No groups found</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                    {(groups.last_page || 1) > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-sm text-muted-foreground">Showing {(groups.current_page - 1) * groups.per_page + 1}-{Math.min(groups.current_page * groups.per_page, groups.total)} of {groups.total}</p>
                            <div className="flex gap-1">
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={groups.current_page <= 1} onClick={() => router.get('/customer-groups', { page: groups.current_page - 1 }, { preserveState: true })}><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={groups.current_page >= (groups.last_page || 1)} onClick={() => router.get('/customer-groups', { page: groups.current_page + 1 }, { preserveState: true })}><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    )}
                </Card>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader><DialogTitle>Create Customer Group</DialogTitle><DialogDescription>Add a new customer classification group.</DialogDescription></DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2"><Label>Code *</Label><Input value={data.code} onChange={e => setData('code', e.target.value)} placeholder="e.g. vip" />{errors.code && <p className="text-xs text-destructive">{errors.code}</p>}</div>
                            <div className="space-y-2"><Label>Name *</Label><Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="e.g. VIP Customers" />{errors.name && <p className="text-xs text-destructive">{errors.name}</p>}</div>
                        </div>
                        <DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={processing}>{processing ? 'Creating...' : 'Create'}</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
