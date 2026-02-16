import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';

interface RefundItem { id: number; name: string; qty: number; price: number; total: number; }
interface Refund {
    id: number; increment_id: string; state: 'pending' | 'approved' | 'rejected' | 'processed';
    refund_type: string; refund_method: string | null; reason: string;
    order_id: number; invoice_id: number; sub_total: number; tax_amount: number;
    discount_amount: number; grand_total: number; items: RefundItem[]; created_at: string;
    admin_comment: string | null; order?: { id: number; increment_id: string };
    invoice?: { id: number; increment_id: string };
    customer?: { first_name: string; last_name: string; email: string };
    first_name: string; last_name: string; email: string;
    processed_by_user?: { name: string }; processed_at?: string;
}
interface Props { refund: Refund; states: Record<string, string>; types: Record<string, string>; methods: Record<string, string>; }

const stateVariant: Record<string, 'warning' | 'success' | 'destructive' | 'info'> = {
    pending: 'warning', approved: 'info', rejected: 'destructive', processed: 'success',
};
const stateLabel: Record<string, string> = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', processed: 'Processed' };

export default function Show({ refund, states, types, methods }: Props) {
    const [state, setState] = useState(refund.state);
    const [adminComment, setAdminComment] = useState(refund.admin_comment || '');
    const [refundMethod, setRefundMethod] = useState(refund.refund_method || '');

    const handleSubmit = () => {
        router.put(`/sales/refunds/${refund.id}`, { state, admin_comment: adminComment, refund_method: refundMethod }, { preserveScroll: true });
    };

    const cName = refund.customer ? `${refund.customer.first_name} ${refund.customer.last_name}` : `${refund.first_name} ${refund.last_name}`;

    return (
        <DashboardLayout title={`Refund ${refund.increment_id}`}>
            <Head title={`Refund ${refund.increment_id}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild><Link href="/sales/refunds"><ArrowLeft className="h-4 w-4" /></Link></Button>
                        <div><h1 className="text-2xl font-bold">Refund {refund.increment_id}</h1><Badge variant={stateVariant[refund.state]} className="mt-1">{stateLabel[refund.state]}</Badge></div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {refund.reason && (
                            <Card><CardHeader><CardTitle className="text-base">Reason</CardTitle></CardHeader>
                                <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{refund.reason}</p></CardContent>
                            </Card>
                        )}
                        <Card><CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
                            <Table>
                                <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-center">Qty</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                                <TableBody>{refund.items.map(item => (<TableRow key={item.id}><TableCell>{item.name}</TableCell><TableCell className="text-center">{item.qty}</TableCell><TableCell className="text-right">{formatCurrency(item.price)}</TableCell><TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell></TableRow>))}</TableBody>
                            </Table>
                            <CardContent className="pt-4 space-y-2">
                                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(refund.sub_total)}</span></div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg"><span>Grand Total</span><span>{formatCurrency(refund.grand_total)}</span></div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card><CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-medium">{cName}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><Badge variant="outline">{types[refund.refund_type] || refund.refund_type}</Badge></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Order</span><Link href="/orders" className="text-primary hover:underline">#{refund.order_id}</Link></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Invoice</span><Link href={`/sales/invoices/${refund.invoice_id}`} className="text-primary hover:underline">#{refund.invoice_id}</Link></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{formatDate(refund.created_at)}</span></div>
                                {refund.processed_by_user && <div className="flex justify-between"><span className="text-muted-foreground">Processed By</span><span>{refund.processed_by_user.name}</span></div>}
                                {refund.processed_at && <div className="flex justify-between"><span className="text-muted-foreground">Processed At</span><span>{formatDate(refund.processed_at)}</span></div>}
                            </CardContent>
                        </Card>
                        <Card><CardHeader><CardTitle className="text-base">Update Status</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2"><Label>State</Label>
                                    <Select value={state} onValueChange={(v) => setState(v as any)}><SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{Object.entries(stateLabel).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
                                </div>
                                <div className="space-y-2"><Label>Refund Method</Label>
                                    <Select value={refundMethod} onValueChange={setRefundMethod}><SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                                        <SelectContent>{Object.entries(methods).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
                                </div>
                                <div className="space-y-2"><Label>Admin Comment</Label><Textarea value={adminComment} onChange={e => setAdminComment(e.target.value)} rows={3} /></div>
                                <Button onClick={handleSubmit} className="w-full"><Save className="h-4 w-4 mr-2" /> Update</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
