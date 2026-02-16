import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, Image as ImageIcon, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface Category { id: number; name: string; }
interface ServiceType { value: string; label: string; label_en: string; requires_scheduling: boolean; icon: string; }
interface Service {
    id: number; name: string; description: string; short_description: string | null; requirements: string | null;
    terms: string | null; steps: string[] | null; price: number; deposit_amount?: number;
    duration: string; min_duration?: number; max_duration?: number; image_url: string | null;
    is_active: boolean; is_popular: boolean; requires_approval?: boolean; type: string;
    category_id: number; category: Category;
}
interface Props { service: Service; categories: Category[]; serviceTypes: ServiceType[]; }

export default function Edit({ service, categories, serviceTypes }: Props) {
    const [imageType, setImageType] = useState<'url' | 'upload'>(service.image_url ? 'url' : 'upload');
    const [submitting, setSubmitting] = useState(false);
    const [selectedType, setSelectedType] = useState(service.type);
    const [imagePreview, setImagePreview] = useState(service.image_url || '');
    const [formData, setFormData] = useState({
        name: service.name, short_description: service.short_description || '', description: service.description,
        price: String(service.price), deposit_amount: service.deposit_amount ? String(service.deposit_amount) : '',
        duration: service.duration, min_duration: service.min_duration ? String(service.min_duration) : '',
        max_duration: service.max_duration ? String(service.max_duration) : '', type: service.type,
        category_id: String(service.category_id), image_url: service.image_url || '',
        requirements: service.requirements || '', terms: service.terms || '',
        steps_text: service.steps?.join('\n') || '',
        is_active: service.is_active, is_popular: service.is_popular, requires_approval: service.requires_approval || false,
    });

    const updateField = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await axios.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) { updateField('image_url', res.data.url); setImagePreview(res.data.url); }
        } catch (err) { console.error(err); }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const { steps_text, ...data } = formData as any;
        if (steps_text) data.steps = steps_text.split('\n').filter((s: string) => s.trim());
        router.put(`/services/${service.id}`, data, { onFinish: () => setSubmitting(false) });
    };

    return (
        <DashboardLayout title="Edit Service">
            <Head title={`Edit: ${service.name}`} />
            <TooltipProvider>
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between mb-6 pb-4 border-b">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" asChild><Link href="/services"><ArrowLeft className="h-4 w-4" /></Link></Button>
                            <h1 className="text-2xl font-bold">Edit Service</h1>
                        </div>
                        <Button type="submit" disabled={submitting}><Save className="h-4 w-4 mr-2" /> {submitting ? 'Saving...' : 'Save Changes'}</Button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <Card><CardHeader><CardTitle className="text-base">General Information</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2"><Label>Service Name *</Label><Input value={formData.name} onChange={e => updateField('name', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Short Description</Label><Textarea rows={2} value={formData.short_description} onChange={e => updateField('short_description', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Full Description *</Label><Textarea rows={6} value={formData.description} onChange={e => updateField('description', e.target.value)} /></div>
                                </CardContent>
                            </Card>
                            <Card><CardHeader><CardTitle className="text-base">Pricing & Duration</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Price (SDG) *</Label><Input type="number" min="0" value={formData.price} onChange={e => updateField('price', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Deposit Amount</Label><Input type="number" min="0" value={formData.deposit_amount} onChange={e => updateField('deposit_amount', e.target.value)} /></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                        <div className="space-y-2"><Label>Duration *</Label><Input value={formData.duration} onChange={e => updateField('duration', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Min (min)</Label><Input type="number" value={formData.min_duration} onChange={e => updateField('min_duration', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Max (min)</Label><Input type="number" value={formData.max_duration} onChange={e => updateField('max_duration', e.target.value)} /></div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card><CardHeader><CardTitle className="text-base">Media</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Button type="button" variant={imageType === 'upload' ? 'default' : 'outline'} size="sm" onClick={() => setImageType('upload')}>Upload</Button>
                                        <Button type="button" variant={imageType === 'url' ? 'default' : 'outline'} size="sm" onClick={() => setImageType('url')}>URL</Button>
                                    </div>
                                    {imageType === 'upload' ? (
                                        <div><Input type="file" accept="image/*" onChange={handleUpload} />{imagePreview && <img src={imagePreview} alt="" className="mt-3 h-32 rounded-lg object-cover" />}</div>
                                    ) : (
                                        <Input value={formData.image_url} onChange={e => updateField('image_url', e.target.value)} placeholder="https://..." />
                                    )}
                                </CardContent>
                            </Card>
                            <Card><CardHeader><CardTitle className="text-base">Content</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2"><Label>Requirements</Label><Textarea rows={3} value={formData.requirements} onChange={e => updateField('requirements', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Terms & Conditions</Label><Textarea rows={3} value={formData.terms} onChange={e => updateField('terms', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Service Steps (one per line)</Label><Textarea rows={4} value={formData.steps_text} onChange={e => updateField('steps_text', e.target.value)} /></div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-6">
                            <Card><CardHeader><CardTitle className="text-base">Service Type</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    {serviceTypes.map(type => (
                                        <button type="button" key={type.value} onClick={() => { setSelectedType(type.value); updateField('type', type.value); }}
                                            className={cn('w-full text-left p-3 rounded-lg border-2 transition-colors', selectedType === type.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30')}>
                                            <p className="font-medium text-sm">{type.label_en || type.label}</p>
                                            {type.requires_scheduling && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="h-3 w-3" /> Requires scheduling</p>}
                                        </button>
                                    ))}
                                </CardContent>
                            </Card>
                            <Card><CardHeader><CardTitle className="text-base">Category</CardTitle></CardHeader>
                                <CardContent>
                                    <Select value={formData.category_id} onValueChange={v => updateField('category_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                            <Card><CardHeader><CardTitle className="text-base">Settings</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <label className="flex items-center justify-between"><div><p className="text-sm font-medium">Active</p><p className="text-xs text-muted-foreground">Hidden from customers when inactive</p></div><Checkbox checked={formData.is_active} onCheckedChange={c => updateField('is_active', !!c)} /></label>
                                    <Separator />
                                    <label className="flex items-center justify-between"><div><p className="text-sm font-medium">Popular</p><p className="text-xs text-muted-foreground">Shown on the homepage</p></div><Checkbox checked={formData.is_popular} onCheckedChange={c => updateField('is_popular', !!c)} /></label>
                                    <Separator />
                                    <label className="flex items-center justify-between"><div><p className="text-sm font-medium">Requires Approval</p><p className="text-xs text-muted-foreground">Admin approval needed</p></div><Checkbox checked={formData.requires_approval} onCheckedChange={c => updateField('requires_approval', !!c)} /></label>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </TooltipProvider>
        </DashboardLayout>
    );
}
