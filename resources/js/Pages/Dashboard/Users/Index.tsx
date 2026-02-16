import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent,
    DropdownMenuSubTrigger, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageHeader } from '@/components/shared/PageHeader';
import { DuotoneIcon } from '@/components/DuotoneIcon';

interface User { id: number; name: string; email: string; phone: string | null; role: 'user' | 'admin' | 'agent'; created_at: string; }
interface Props { users: { data: User[]; current_page: number; last_page: number; per_page: number; total: number }; filters?: { role?: string; search?: string }; }

const roleConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' }> = {
    admin: { label: 'Admin', variant: 'default' }, agent: { label: 'Agent', variant: 'info' }, user: { label: 'User', variant: 'warning' },
};

export default function UsersIndex({ users, filters = {} }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const { data, setData, post, put, processing, errors, reset } = useForm({ name: '', email: '', phone: '', role: 'user', password: '' });

    const openCreate = () => { setEditingUser(null); reset(); setDialogOpen(true); };
    const openEdit = (u: User) => { setEditingUser(u); setData({ name: u.name, email: u.email, phone: u.phone || '', role: u.role, password: '' }); setDialogOpen(true); };

    const handleSubmit = () => {
        if (editingUser) { put(`/users/${editingUser.id}`, { onSuccess: () => setDialogOpen(false) }); }
        else { post('/users', { onSuccess: () => setDialogOpen(false) }); }
    };

    const handleDelete = (id: number) => { if (confirm('Delete this user?')) router.delete(`/users/${id}`); };
    const handleSearch = () => router.get('/users', { ...filters, search: searchValue }, { preserveState: true });
    const handleFilter = (key: string, value: string | undefined) => router.get('/users', { ...filters, [key]: value }, { preserveState: true });
    const handleRoleChange = (userId: number, newRole: string) => {
        router.put(`/users/${userId}`, { role: newRole } as any, { preserveState: true });
    };

    return (
        <DashboardLayout title="Users">
            <Head title="Users" />
            <div className="space-y-6">
                <PageHeader
                    title="Users"
                    description={`${users.total} users`}
                    icon={() => <DuotoneIcon src="/icons/user-circle.527946.svg" className="h-5 w-5" />}
                    actions={
                        <Button onClick={openCreate}>
                            <DuotoneIcon src="/icons/user-plus.527957.svg" className="h-4 w-4 mr-2" /> Add User
                        </Button>
                    }
                />
                <Card><CardContent className="p-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative w-72">
                            <DuotoneIcon src="/icons/magnifer.528378.svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-9" placeholder="Search users..." value={searchValue} onChange={e => setSearchValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                        </div>
                        <Select value={filters.role || ''} onValueChange={v => handleFilter('role', v || undefined)}><SelectTrigger className="w-[130px]"><SelectValue placeholder="Role" /></SelectTrigger>
                            <SelectContent>{Object.entries(roleConfig).map(([k, c]) => <SelectItem key={k} value={k}>{c.label}</SelectItem>)}</SelectContent></Select>
                    </div>
                </CardContent></Card>

                <Card>
                    <Table>
                        <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Role</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {users.data.map(u => (
                                <TableRow key={u.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-primary text-primary-foreground">{u.name.charAt(0)}</AvatarFallback></Avatar><span className="font-medium">{u.name}</span></div></TableCell>
                                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                    <TableCell className="text-muted-foreground">{u.phone || '—'}</TableCell>
                                    <TableCell><Badge variant={roleConfig[u.role]?.variant || 'default'}>{roleConfig[u.role]?.label || u.role}</Badge></TableCell>
                                    <TableCell className="text-muted-foreground">{formatDate(u.created_at)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <DuotoneIcon src="/icons/menu-dots.527810.svg" className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52">
                                                <DropdownMenuLabel>User Actions</DropdownMenuLabel>

                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(u.email)}>
                                                    <DuotoneIcon src="/icons/copy.527658.svg" className="mr-2 h-4 w-4 opacity-70" /> Copy Email
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem onClick={() => openEdit(u)}>
                                                    <DuotoneIcon src="/icons/pen.528450.svg" className="mr-2 h-4 w-4 opacity-70" /> Edit User
                                                </DropdownMenuItem>

                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>
                                                        <DuotoneIcon src="/icons/shield-user.527885.svg" className="mr-2 h-4 w-4 opacity-70" /> Change Role
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        {Object.entries(roleConfig).map(([roleKey, roleInfo]) => (
                                                            <DropdownMenuItem
                                                                key={roleKey}
                                                                onClick={() => handleRoleChange(u.id, roleKey)}
                                                                className={u.role === roleKey ? 'bg-accent font-medium' : ''}
                                                                disabled={u.role === roleKey}
                                                            >
                                                                {u.role === roleKey && (
                                                                    <DuotoneIcon src="/icons/check-circle.527633.svg" className="mr-2 h-4 w-4 opacity-70" />
                                                                )}
                                                                {roleInfo.label}
                                                                {u.role === roleKey && <span className="ml-auto text-xs text-muted-foreground">Current</span>}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                    onClick={() => handleDelete(u.id)}
                                                >
                                                    <DuotoneIcon src="/icons/trash-bin-trash.527928.svg" className="mr-2 h-4 w-4 opacity-70" /> Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.data.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No users found</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                    {users.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-sm text-muted-foreground">Showing {(users.current_page - 1) * users.per_page + 1}-{Math.min(users.current_page * users.per_page, users.total)} of {users.total}</p>
                            <div className="flex gap-1">
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={users.current_page <= 1} onClick={() => router.get('/users', { ...filters, page: users.current_page - 1 }, { preserveState: true })}><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" disabled={users.current_page >= users.last_page} onClick={() => router.get('/users', { ...filters, page: users.current_page + 1 }, { preserveState: true })}><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    )}
                </Card>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader><DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle><DialogDescription>Manage admin user accounts.</DialogDescription></DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2"><Label>Name *</Label><Input value={data.name} onChange={e => setData('name', e.target.value)} />{errors.name && <p className="text-xs text-destructive">{errors.name}</p>}</div>
                            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} />{errors.email && <p className="text-xs text-destructive">{errors.email}</p>}</div>
                            <div className="space-y-2"><Label>Phone</Label><Input value={data.phone} onChange={e => setData('phone', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Role *</Label>
                                <Select value={data.role} onValueChange={v => setData('role', v)}><SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{Object.entries(roleConfig).map(([k, c]) => <SelectItem key={k} value={k}>{c.label}</SelectItem>)}</SelectContent></Select>
                            </div>
                            <div className="space-y-2"><Label>{editingUser ? 'New Password (leave blank to keep)' : 'Password *'}</Label><Input type="password" value={data.password} onChange={e => setData('password', e.target.value)} />{errors.password && <p className="text-xs text-destructive">{errors.password}</p>}</div>
                        </div>
                        <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSubmit} disabled={processing}>{processing ? 'Saving...' : 'Save'}</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
