import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { Image as ImageIcon, Plus, Edit, Trash2, MoreHorizontal, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/shared/PageHeader';
import axios from 'axios';

interface Banner { id: number; title: string; image_url: string; link_url: string | null; action: string | null; is_active: boolean; sort_order: number; }
interface Props { banners: Banner[]; }

export default function Index({ banners }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [title, setTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [action, setAction] = useState('');
    const [sortOrder, setSortOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    const openCreate = () => { setEditingBanner(null); setTitle(''); setLinkUrl(''); setAction(''); setSortOrder(0); setIsActive(true); setImageFile(null); setImageUrl(''); setDialogOpen(true); };
    const openEdit = (b: Banner) => { setEditingBanner(b); setTitle(b.title); setLinkUrl(b.link_url || ''); setAction(b.action || ''); setSortOrder(b.sort_order); setIsActive(b.is_active); setImageUrl(b.image_url); setImageFile(null); setDialogOpen(true); };

    const handleSubmit = async () => {
        setUploading(true);
        let uploadedUrl = imageUrl;
        if (imageFile) {
            const fd = new FormData(); fd.append('image', imageFile);
            const res = await axios.post('/upload-image', fd);
            uploadedUrl = res.data.url;
        }
        const payload = { title, image_url: uploadedUrl, link_url: linkUrl || null, action: action || null, is_active: isActive, sort_order: sortOrder };
        if (editingBanner) {
            router.put(`/banners/${editingBanner.id}`, payload, { onFinish: () => { setUploading(false); setDialogOpen(false); } });
        } else {
            router.post('/banners', payload, { onFinish: () => { setUploading(false); setDialogOpen(false); } });
        }
    };

    const handleDelete = (id: number) => { if (confirm('Delete this banner?')) router.delete(`/banners/${id}`); };

    return (
        <DashboardLayout title="Banners">
            <Head title="Banners" />
            <div className="space-y-6">
                <PageHeader title="Banners" description={`${banners.length} banners`} icon={ImageIcon} actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Banner</Button>} />
                <Card>
                    <Table>
                        <TableHeader><TableRow><TableHead className="w-20">Image</TableHead><TableHead>Title</TableHead><TableHead>Action</TableHead><TableHead className="text-center">Order</TableHead><TableHead className="text-center">Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {banners.map(b => (
                                <TableRow key={b.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>{b.image_url ? <img src={b.image_url} alt={b.title} className="w-16 h-10 object-cover rounded" /> : <div className="w-16 h-10 bg-muted rounded flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>}</TableCell>
                                    <TableCell className="font-medium">{b.title}</TableCell>
                                    <TableCell>{b.action ? <Badge variant="outline">{b.action}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                                    <TableCell className="text-center">{b.sort_order}</TableCell>
                                    <TableCell className="text-center"><Badge variant={b.is_active ? 'success' : 'secondary'}>{b.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(b)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(b.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {banners.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No banners yet</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </Card>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader><DialogTitle>{editingBanner ? 'Edit Banner' : 'Create Banner'}</DialogTitle><DialogDescription>Configure the banner details below.</DialogDescription></DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2"><Label>Title *</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
                            <div className="space-y-2"><Label>Image</Label><Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />{imageUrl && !imageFile && <img src={imageUrl} alt="" className="h-20 rounded mt-2" />}</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Link URL</Label><Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." /></div>
                                <div className="space-y-2"><Label>Action</Label><Input value={action} onChange={e => setAction(e.target.value)} placeholder="e.g. navigate" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} /></div>
                                <div className="flex items-center gap-3 pt-6"><Switch checked={isActive} onCheckedChange={setIsActive} /><Label>Active</Label></div>
                            </div>
                        </div>
                        <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSubmit} disabled={uploading}>{uploading ? 'Saving...' : 'Save'}</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
