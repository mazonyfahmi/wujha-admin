import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Star, User } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface Props {
    review: {
        id: number; title: string; rating: number; comment: string; status: string; created_at: string;
        service: { id: number; name: string }; customer: { id: number; full_name: string; email: string };
    };
}

export default function Edit({ review }: Props) {
    const { data, setData, put, processing, errors } = useForm({ status: review.status, comment: review.comment || '' });
    const onSubmit = () => put(`/reviews/${review.id}`);

    const renderStars = (rating: number) => (
        <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />)}</div>
    );

    return (
        <DashboardLayout title="Edit Review">
            <Head title="Edit Review" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div><p className="text-sm text-muted-foreground"><Link href="/reviews" className="hover:underline">Reviews</Link> / Edit</p><h1 className="text-2xl font-bold mt-1">Review #{review.id}</h1></div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild><Link href="/reviews"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link></Button>
                        <Button onClick={onSubmit} disabled={processing}><Save className="h-4 w-4 mr-2" /> {processing ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Review Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label className="text-muted-foreground">Service</Label><p className="mt-1"><Link href={`/services/${review.service.id}`} className="text-primary hover:underline font-medium">{review.service.name}</Link></p></div>
                                    <div><Label className="text-muted-foreground">Date</Label><p className="mt-1 text-sm">{formatDateTime(review.created_at)}</p></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label className="text-muted-foreground">Rating</Label><div className="mt-1">{renderStars(review.rating)}</div></div>
                                    <div><Label className="text-muted-foreground">Title</Label><p className="mt-1 text-sm font-medium">{review.title}</p></div>
                                </div>
                                <Separator />
                                <div className="space-y-2"><Label>Status *</Label>
                                    <Select value={data.status} onValueChange={v => setData('status', v)}>
                                        <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="disapproved">Rejected</SelectItem></SelectContent>
                                    </Select>{errors.status && <p className="text-xs text-destructive">{errors.status}</p>}
                                </div>
                                <div className="space-y-2"><Label>Comment</Label><Textarea rows={4} value={data.comment} onChange={e => setData('comment', e.target.value)} />{errors.comment && <p className="text-xs text-destructive">{errors.comment}</p>}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col items-center text-center">
                                <Avatar className="h-16 w-16"><AvatarFallback className="bg-primary text-primary-foreground text-lg">{review.customer.full_name.charAt(0)}</AvatarFallback></Avatar>
                                <h3 className="font-semibold mt-3">{review.customer.full_name}</h3>
                                <p className="text-sm text-muted-foreground">{review.customer.email}</p>
                            </div>
                            <Separator />
                            <Button variant="outline" className="w-full" asChild><Link href={`/customers/${review.customer.id}`}><User className="h-4 w-4 mr-2" /> View Profile</Link></Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
