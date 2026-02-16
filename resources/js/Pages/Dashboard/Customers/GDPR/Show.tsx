import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Shield, AlertTriangle, User } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface Props {
    request: {
        id: number; email: string; type: string; status: string; message: string; created_at: string;
        customer: { id: number; full_name: string; email: string };
    };
}

const typeConfig: Record<string, { label: string; variant: 'destructive' | 'info' | 'warning' }> = {
    delete: { label: 'Delete', variant: 'destructive' }, export: { label: 'Export', variant: 'info' }, update: { label: 'Update', variant: 'warning' },
};

export default function Show({ request }: Props) {
    const { data, setData, put, processing } = useForm({ status: request.status });
    const onSubmit = () => put(`/gdpr/${request.id}`);

    return (
        <DashboardLayout title="GDPR Request Details">
            <Head title="GDPR Request Details" />
            <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between">
                    <div><p className="text-sm text-muted-foreground"><Link href="/gdpr" className="hover:underline">GDPR Requests</Link> / Details</p><h1 className="text-2xl font-bold mt-1">Request #{request.id}</h1></div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild><Link href="/gdpr"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link></Button>
                        <Button onClick={onSubmit} disabled={processing}><Save className="h-4 w-4 mr-2" /> {processing ? 'Updating...' : 'Update Status'}</Button>
                    </div>
                </div>

                {request.type === 'delete' && (
                    <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Deletion Request</AlertTitle><AlertDescription>This customer has requested data deletion. Process the request locally before marking it as completed.</AlertDescription></Alert>
                )}

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Request Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label className="text-muted-foreground">Type</Label><div className="mt-1"><Badge variant={typeConfig[request.type]?.variant || 'default'}>{typeConfig[request.type]?.label || request.type}</Badge></div></div>
                            <div><Label className="text-muted-foreground">Date</Label><p className="mt-1 text-sm">{formatDateTime(request.created_at)}</p></div>
                        </div>
                        <Separator />
                        <div><Label className="text-muted-foreground">Customer</Label><div className="mt-1 flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><Link href={`/customers/${request.customer.id}`} className="text-primary hover:underline font-medium">{request.customer.full_name}</Link><span className="text-muted-foreground">({request.email})</span></div></div>
                        <Separator />
                        <div><Label className="text-muted-foreground">Message</Label><p className="mt-1 text-sm">{request.message || <span className="text-muted-foreground italic">No message provided</span>}</p></div>
                        <Separator />
                        <div className="space-y-2"><Label>Current Status</Label>
                            <Select value={data.status} onValueChange={v => setData('status', v)}>
                                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="declined">Declined</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
