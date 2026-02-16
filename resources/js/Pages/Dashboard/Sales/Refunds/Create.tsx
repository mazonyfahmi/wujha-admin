import { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

interface InvoiceItem { id: number; name: string; qty: number; price: number; total: number; }
interface Invoice { id: number; increment_id: string; grand_total: number; items: InvoiceItem[]; }
interface Order { id: number; invoices: Invoice[]; }
interface RefundItem { invoice_item_id: number; name: string; qty: number; price: number; }
interface Props { order?: Order; invoice?: Invoice; }

export default function Create({ order, invoice }: Props) {
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoice?.id ? String(invoice.id) : '');
    const [items, setItems] = useState<RefundItem[]>([]);
    const [reason, setReason] = useState('');
    const [refundType, setRefundType] = useState('full');
    const [submitting, setSubmitting] = useState(false);

    const currentInvoice = invoice || order?.invoices?.find(i => String(i.id) === selectedInvoiceId);

    useEffect(() => {
        if (currentInvoice) {
            setItems(currentInvoice.items.map(i => ({ invoice_item_id: i.id, name: i.name, qty: i.qty, price: i.price })));
        }
    }, [selectedInvoiceId, currentInvoice?.id]);

    const updateItemQty = (id: number, qty: number) => {
        setItems(prev => prev.map(i => i.invoice_item_id === id ? { ...i, qty: Math.max(0, qty) } : i));
    };

    const grandTotal = items.reduce((s, i) => s + i.qty * i.price, 0);

    const handleSubmit = () => {
        setSubmitting(true);
        router.post('/sales/refunds', {
            order_id: order?.id,
            invoice_id: currentInvoice?.id,
            reason, refund_type: refundType,
            items: items.filter(i => i.qty > 0) as any,
        }, { onFinish: () => setSubmitting(false) });
    };

    return (
        <DashboardLayout title="Create Refund">
            <Head title="Create Refund" />
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild><Link href="/sales/refunds"><ArrowLeft className="h-4 w-4" /></Link></Button>
                        <h1 className="text-2xl font-bold">Create Refund</h1>
                    </div>
                    <Button onClick={handleSubmit} disabled={submitting}><Save className="h-4 w-4 mr-2" /> {submitting ? 'Processing...' : 'Submit Refund'}</Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {order && order.invoices?.length > 1 && !invoice && (
                            <Card><CardHeader><CardTitle className="text-base">Select Invoice</CardTitle></CardHeader>
                                <CardContent>
                                    <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                                        <SelectTrigger><SelectValue placeholder="Select invoice" /></SelectTrigger>
                                        <SelectContent>{order.invoices.map(inv => <SelectItem key={inv.id} value={String(inv.id)}>{inv.increment_id} — {formatCurrency(inv.grand_total)}</SelectItem>)}</SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        )}

                        <Card><CardHeader><CardTitle className="text-base">Refund Items</CardTitle></CardHeader>
                            <Table>
                                <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="w-24">Qty</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {items.map(item => (
                                        <TableRow key={item.invoice_item_id}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell><Input type="number" min={0} value={item.qty} onChange={e => updateItemQty(item.invoice_item_id, Number(e.target.value))} className="w-20" /></TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(item.qty * item.price)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {items.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Select an invoice to populate items</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                            <CardContent className="pt-4">
                                <div className="flex justify-end"><div className="flex justify-between w-64 font-bold text-lg border-t pt-2"><span>Grand Total</span><span>{formatCurrency(grandTotal)}</span></div></div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card><CardHeader><CardTitle className="text-base">Refund Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2"><Label>Refund Type</Label>
                                    <Select value={refundType} onValueChange={setRefundType}><SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="full">Full Refund</SelectItem><SelectItem value="partial">Partial Refund</SelectItem></SelectContent></Select>
                                </div>
                                <div className="space-y-2"><Label>Reason *</Label><Textarea value={reason} onChange={e => setReason(e.target.value)} rows={4} placeholder="Reason for refund" /></div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
