import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Printer, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceItem { id: number; name: string; qty: number; price: number; total: number; }
interface Invoice {
    id: number; increment_id: string; state: 'pending' | 'paid' | 'cancelled' | 'refunded';
    order_id: number; billing_address_name: string; billing_address_email: string;
    billing_address_phone: string; billing_address: string; sub_total: number;
    tax_amount: number; discount_amount: number; grand_total: number; items: InvoiceItem[];
    created_at: string; admin_comment: string | null;
    customer?: { first_name: string; last_name: string; email: string; phone: string };
    first_name: string; last_name: string; email: string; phone: string;
}
interface Props { invoice: Invoice; states: Record<string, string>; }

const stateVariant: Record<string, 'warning' | 'success' | 'destructive' | 'info'> = {
    pending: 'warning', paid: 'success', cancelled: 'destructive', refunded: 'info',
};
const stateLabel: Record<string, string> = { pending: 'Pending', paid: 'Paid', cancelled: 'Cancelled', refunded: 'Refunded' };

export default function Show({ invoice, states }: Props) {
    const [state, setState] = useState(invoice.state);
    const [comment, setComment] = useState(invoice.admin_comment || '');

    const handleSubmit = () => {
        router.put(`/sales/invoices/${invoice.id}`, { state, admin_comment: comment }, { preserveScroll: true });
    };

    const cName = invoice.customer ? `${invoice.customer.first_name} ${invoice.customer.last_name}` : `${invoice.first_name} ${invoice.last_name}`;
    const cEmail = invoice.customer?.email || invoice.email;
    const cPhone = invoice.customer?.phone || invoice.phone;

    return (
        <DashboardLayout title={`Invoice ${invoice.increment_id}`}>
            <Head title={`Invoice ${invoice.increment_id}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild><Link href="/sales/invoices"><ArrowLeft className="h-4 w-4" /></Link></Button>
                        <div>
                            <h1 className="text-2xl font-bold">Invoice {invoice.increment_id}</h1>
                            <Badge variant={stateVariant[invoice.state]} className="mt-1">{stateLabel[invoice.state]}</Badge>
                        </div>
                    </div>
                    <Button variant="outline" asChild><Link href={`/sales/invoices/${invoice.id}/print`} target="_blank"><Printer className="h-4 w-4 mr-2" /> Print</Link></Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
                            <Table>
                                <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-center">Qty</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {invoice.items.map(item => (
                                        <TableRow key={item.id}><TableCell className="font-medium">{item.name}</TableCell><TableCell className="text-center">{item.qty}</TableCell><TableCell className="text-right">{formatCurrency(item.price)}</TableCell><TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell></TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <CardContent className="pt-4 space-y-2">
                                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(invoice.sub_total)}</span></div>
                                {Number(invoice.tax_amount) > 0 && <div className="flex justify-between text-sm"><span>Tax</span><span>{formatCurrency(invoice.tax_amount)}</span></div>}
                                {Number(invoice.discount_amount) > 0 && <div className="flex justify-between text-sm"><span>Discount</span><span>-{formatCurrency(invoice.discount_amount)}</span></div>}
                                <Separator />
                                <div className="flex justify-between font-bold text-lg"><span>Grand Total</span><span>{formatCurrency(invoice.grand_total)}</span></div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card><CardHeader><CardTitle className="text-base">Customer</CardTitle></CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p className="font-medium">{cName}</p><p className="text-muted-foreground">{cEmail}</p><p className="text-muted-foreground">{cPhone}</p>
                                {invoice.billing_address && <p className="text-muted-foreground">{invoice.billing_address}</p>}
                            </CardContent>
                        </Card>
                        <Card><CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Order</span><Link href="/orders" className="text-primary hover:underline">#{invoice.order_id}</Link></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{formatDate(invoice.created_at)}</span></div>
                            </CardContent>
                        </Card>
                        <Card><CardHeader><CardTitle className="text-base">Update Status</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2"><Label>State</Label>
                                    <Select value={state} onValueChange={(v) => setState(v as any)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{Object.entries(stateLabel).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2"><Label>Admin Comment</Label><Textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} /></div>
                                <Button onClick={handleSubmit} className="w-full"><Save className="h-4 w-4 mr-2" /> Update</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
