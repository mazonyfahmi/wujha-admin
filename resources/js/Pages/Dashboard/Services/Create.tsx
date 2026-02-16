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
interface Props { categories: Category[]; serviceTypes: ServiceType[]; }

export default function Create({ categories, serviceTypes }: Props) {
    const [imageType, setImageType] = useState<'url' | 'upload'>('upload');
    const [submitting, setSubmitting] = useState(false);
    const [selectedType, setSelectedType] = useState('on_demand');
    const [imagePreview, setImagePreview] = useState('');
    const [formData, setFormData] = useState({
        name: '', short_description: '', description: '', price: '', deposit_amount: '',
        duration: '', min_duration: '', max_duration: '', type: 'on_demand',
        category_id: '', image_url: '', requirements: '', terms: '', steps_text: '',
        is_active: true, is_popular: false, requires_approval: false,
    });

    const updateField = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await axios.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) {
                updateField('image_url', res.data.url);
                setImagePreview(res.data.url);
            }
        } catch (err) { console.error(err); }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const { steps_text, ...data } = formData as any;
        if (steps_text) data.steps = steps_text.split('\n').filter((s: string) => s.trim());
        router.post('/services', data, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <DashboardLayout title="Create Service">
            <Head title="Create Service" />
            <TooltipProvider>
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between mb-6 pb-4 border-b">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" asChild><Link href="/services"><ArrowLeft className="h-4 w-4" /></Link></Button>
                            <h1 className="text-2xl font-bold">Create New Service</h1>
                        </div>
                        <Button type="submit" disabled={submitting}>
                            <Save className="h-4 w-4 mr-2" /> {submitting ? 'Saving...' : 'Save Service'}
                        </Button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Info className="h-4 w-4" /> General Information</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2"><Label>Service Name *</Label><Input value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="Enter service name" /></div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1">Short Description
                                            <Tooltip><TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger><TooltipContent>Brief summary shown in listings</TooltipContent></Tooltip>
                                        </Label>
                                        <Textarea rows={2} value={formData.short_description} onChange={e => updateField('short_description', e.target.value)} placeholder="Brief summary (max 500 chars)" maxLength={500} />
                                    </div>
                                    <div className="space-y-2"><Label>Full Description *</Label><Textarea rows={6} value={formData.description} onChange={e => updateField('description', e.target.value)} placeholder="Detailed service description" /></div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle className="text-base">Pricing & Duration</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Price (SDG) *</Label><Input type="number" min="0" value={formData.price} onChange={e => updateField('price', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Deposit Amount</Label><Input type="number" min="0" value={formData.deposit_amount} onChange={e => updateField('deposit_amount', e.target.value)} /></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                        <div className="space-y-2"><Label>Duration *</Label><Input value={formData.duration} onChange={e => updateField('duration', e.target.value)} placeholder="e.g. 1 hour, 3 days" /></div>
                                        <div className="space-y-2"><Label>Min Duration (min)</Label><Input type="number" min="1" value={formData.min_duration} onChange={e => updateField('min_duration', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Max Duration (min)</Label><Input type="number" min="1" value={formData.max_duration} onChange={e => updateField('max_duration', e.target.value)} /></div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Media</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Button type="button" variant={imageType === 'upload' ? 'default' : 'outline'} size="sm" onClick={() => setImageType('upload')}>Upload Image</Button>
                                        <Button type="button" variant={imageType === 'url' ? 'default' : 'outline'} size="sm" onClick={() => setImageType('url')}>External URL</Button>
                                    </div>
                                    {imageType === 'upload' ? (
                                        <div>
                                            <Input type="file" accept="image/*" onChange={handleUpload} />
                                            {imagePreview && <img src={imagePreview} alt="" className="mt-3 h-32 rounded-lg object-cover" />}
                                        </div>
                                    ) : (
                                        <Input value={formData.image_url} onChange={e => updateField('image_url', e.target.value)} placeholder="https://example.com/image.jpg" />
                                    )}
                                    <p className="text-xs text-muted-foreground">You can add more images from the service detail page after creation.</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle className="text-base">Content</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2"><Label>Requirements</Label><Textarea rows={3} value={formData.requirements} onChange={e => updateField('requirements', e.target.value)} placeholder="What the customer needs to provide" /></div>
                                    <div className="space-y-2"><Label>Terms & Conditions</Label><Textarea rows={3} value={formData.terms} onChange={e => updateField('terms', e.target.value)} /></div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1">Service Steps
                                            <Tooltip><TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger><TooltipContent>Enter each step on a new line</TooltipContent></Tooltip>
                                        </Label>
                                        <Textarea rows={4} value={formData.steps_text} onChange={e => updateField('steps_text', e.target.value)} placeholder={"Step 1: Submit request\nStep 2: Wait for approval\nStep 3: Complete payment\nStep 4: Receive service"} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle className="text-base">Service Type</CardTitle></CardHeader>
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

                            <Card>
                                <CardHeader><CardTitle className="text-base">Category</CardTitle></CardHeader>
                                <CardContent>
                                    <Select value={formData.category_id} onValueChange={v => updateField('category_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                        <SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle className="text-base">Settings</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <label className="flex items-center justify-between">
                                        <div><p className="text-sm font-medium">Active</p><p className="text-xs text-muted-foreground">Inactive services are hidden from customers</p></div>
                                        <Checkbox checked={formData.is_active} onCheckedChange={c => updateField('is_active', !!c)} />
                                    </label>
                                    <Separator />
                                    <label className="flex items-center justify-between">
                                        <div><p className="text-sm font-medium">Popular</p><p className="text-xs text-muted-foreground">Popular services appear on the homepage</p></div>
                                        <Checkbox checked={formData.is_popular} onCheckedChange={c => updateField('is_popular', !!c)} />
                                    </label>
                                    <Separator />
                                    <label className="flex items-center justify-between">
                                        <div><p className="text-sm font-medium">Requires Approval</p><p className="text-xs text-muted-foreground">Orders need admin approval before processing</p></div>
                                        <Checkbox checked={formData.requires_approval} onCheckedChange={c => updateField('requires_approval', !!c)} />
                                    </label>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </TooltipProvider>
        </DashboardLayout>
    );
}
