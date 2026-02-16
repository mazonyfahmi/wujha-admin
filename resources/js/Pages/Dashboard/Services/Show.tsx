import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Star, CheckCircle, XCircle, Image as ImageIcon, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';

interface Category { id: number; name: string; }
interface ServiceImage { id: number; image_url: string; caption: string | null; sort_order: number; }
interface Service {
    id: number; name: string; description: string; short_description: string | null;
    requirements: string | null; terms: string | null; steps: string[] | null;
    price: number; duration: string; image_url: string | null;
    is_active: boolean; is_popular: boolean; category_id: number; category: Category; images: ServiceImage[];
}
interface Props { service: Service; categories: Category[]; }

export default function Show({ service, categories }: Props) {
    const [deleteImageId, setDeleteImageId] = useState<number | null>(null);

    const handleRemoveImage = (imageId: number) => {
        router.delete(`/services/${service.id}/images/${imageId}`, { preserveScroll: true });
        setDeleteImageId(null);
    };

    const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await axios.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) {
                router.post(`/services/${service.id}/images`, { image_url: res.data.url }, { preserveScroll: true });
            }
        } catch (err) { console.error(err); }
    };

    return (
        <DashboardLayout title={service.name}>
            <Head title={service.name} />
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild><Link href="/services"><ArrowLeft className="h-4 w-4" /></Link></Button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                {service.name}
                                {service.is_popular && <Star className="h-5 w-5 text-amber-500 fill-amber-500" />}
                            </h1>
                            <Badge variant={service.is_active ? 'success' : 'destructive'} className="mt-1">
                                {service.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>
                    <Button asChild><Link href={`/services/${service.id}/edit`}><Edit className="h-4 w-4 mr-2" /> Edit</Link></Button>
                </div>

                <Tabs defaultValue="details">
                    <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="gallery">Gallery ({service.images?.length || 0})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="mt-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-6">
                                {service.image_url && (
                                    <img src={service.image_url} alt={service.name} className="w-full max-h-80 rounded-xl object-cover" />
                                )}
                                <Card>
                                    <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
                                    <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{service.description}</p></CardContent>
                                </Card>
                                {service.requirements && (
                                    <Card><CardHeader><CardTitle className="text-base">Requirements</CardTitle></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{service.requirements}</p></CardContent>
                                    </Card>
                                )}
                                {service.terms && (
                                    <Card><CardHeader><CardTitle className="text-base">Terms & Conditions</CardTitle></CardHeader>
                                        <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{service.terms}</p></CardContent>
                                    </Card>
                                )}
                                {service.steps && service.steps.length > 0 && (
                                    <Card><CardHeader><CardTitle className="text-base">Service Steps</CardTitle></CardHeader>
                                        <CardContent>
                                            <ol className="list-decimal list-inside space-y-2 text-sm">
                                                {service.steps.map((step, i) => <li key={i} className="text-muted-foreground">{step}</li>)}
                                            </ol>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                            <div className="space-y-6">
                                <Card><CardHeader><CardTitle className="text-base">Service Info</CardTitle></CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Price</span><span className="font-medium">{formatCurrency(service.price)}</span></div>
                                        <Separator />
                                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Duration</span><span>{service.duration}</span></div>
                                        <Separator />
                                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Category</span><Badge variant="outline">{service.category?.name}</Badge></div>
                                        <Separator />
                                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span>
                                            <Badge variant={service.is_active ? 'success' : 'destructive'}>{service.is_active ? 'Active' : 'Inactive'}</Badge>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Popular</span>
                                            {service.is_popular ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="gallery" className="mt-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Gallery Images</CardTitle>
                                <Label htmlFor="gallery-upload" className="cursor-pointer">
                                    <Button size="sm" asChild><span><Plus className="h-4 w-4 mr-2" /> Add Image</span></Button>
                                    <Input id="gallery-upload" type="file" accept="image/*" className="sr-only" onChange={handleAddImage} />
                                </Label>
                            </CardHeader>
                            <CardContent>
                                {service.images?.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {service.images.map((img) => (
                                            <div key={img.id} className="relative group rounded-lg overflow-hidden aspect-square">
                                                <img src={img.image_url} alt={img.caption || ''} className="w-full h-full object-cover" />
                                                <button onClick={() => setDeleteImageId(img.id)}
                                                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-12">No gallery images yet. Upload some!</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            <Dialog open={deleteImageId !== null} onOpenChange={open => !open && setDeleteImageId(null)}>
                <DialogContent><DialogHeader><DialogTitle>Remove Image</DialogTitle><DialogDescription>Are you sure?</DialogDescription></DialogHeader>
                    <DialogFooter><Button variant="outline" onClick={() => setDeleteImageId(null)}>Cancel</Button><Button variant="destructive" onClick={() => deleteImageId && handleRemoveImage(deleteImageId)}>Remove</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
