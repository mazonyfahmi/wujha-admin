import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { FolderTree, Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/shared/PageHeader';
import axios from 'axios';

interface Category { id: number; name: string; icon: string | null; color: string | null; is_active: boolean; sort_order: number; services_count: number; }
interface Props { categories: Category[]; }

export default function Index({ categories }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#5C3881');
    const [sortOrder, setSortOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [iconUrl, setIconUrl] = useState('');
    const [saving, setSaving] = useState(false);

    const openCreate = () => { setEditing(null); setName(''); setColor('#5C3881'); setSortOrder(0); setIsActive(true); setIconFile(null); setIconUrl(''); setDialogOpen(true); };
    const openEdit = (c: Category) => { setEditing(c); setName(c.name); setColor(c.color || '#5C3881'); setSortOrder(c.sort_order); setIsActive(c.is_active); setIconUrl(c.icon || ''); setIconFile(null); setDialogOpen(true); };

    const handleSubmit = async () => {
        setSaving(true);
        let uploadedIcon = iconUrl;
        if (iconFile) { const fd = new FormData(); fd.append('image', iconFile); const res = await axios.post('/upload-image', fd); uploadedIcon = res.data.url; }
        const payload = { name, icon: uploadedIcon || null, color, is_active: isActive, sort_order: sortOrder };
        if (editing) { router.put(`/categories/${editing.id}`, payload, { onFinish: () => { setSaving(false); setDialogOpen(false); } }); }
        else { router.post('/categories', payload, { onFinish: () => { setSaving(false); setDialogOpen(false); } }); }
    };

    const handleDelete = (id: number) => { if (confirm('Delete this category?')) router.delete(`/categories/${id}`); };

    return (
        <DashboardLayout title="Categories">
            <Head title="Categories" />
            <div className="space-y-6">
                <PageHeader title="Categories" description={`${categories.length} categories`} icon={FolderTree} actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Category</Button>} />
                <Card>
                    <Table>
                        <TableHeader><TableRow><TableHead className="w-12">Icon</TableHead><TableHead>Name</TableHead><TableHead>Color</TableHead><TableHead className="text-center">Services</TableHead><TableHead className="text-center">Order</TableHead><TableHead className="text-center">Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {categories.map(c => (
                                <TableRow key={c.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>{c.icon ? <img src={c.icon} alt="" className="w-8 h-8 rounded" /> : <div className="w-8 h-8 bg-muted rounded flex items-center justify-center"><FolderTree className="h-4 w-4 text-muted-foreground" /></div>}</TableCell>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell>{c.color ? <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full border" style={{ backgroundColor: c.color }} /><span className="text-xs text-muted-foreground">{c.color}</span></div> : '—'}</TableCell>
                                    <TableCell className="text-center"><Badge variant="outline">{c.services_count}</Badge></TableCell>
                                    <TableCell className="text-center">{c.sort_order}</TableCell>
                                    <TableCell className="text-center"><Badge variant={c.is_active ? 'success' : 'secondary'}>{c.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(c)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {categories.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No categories yet</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </Card>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'Create Category'}</DialogTitle><DialogDescription>Configure the category details.</DialogDescription></DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2"><Label>Name *</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                            <div className="space-y-2"><Label>Icon Image</Label><Input type="file" accept="image/*" onChange={e => setIconFile(e.target.files?.[0] || null)} />{iconUrl && !iconFile && <img src={iconUrl} alt="" className="h-10 mt-2" />}</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Color</Label><Input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10" /></div>
                                <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} /></div>
                            </div>
                            <div className="flex items-center gap-3"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Active</Label></div>
                        </div>
                        <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
