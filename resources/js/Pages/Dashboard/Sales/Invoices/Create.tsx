import { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

interface InvoiceItem { key: string; name: string; qty: number; price: number; tax_amount: number; discount_amount: number; service_id?: number; }
interface Order {
    id: number; customer: { full_name?: string; name?: string; email?: string; phone?: string; address?: string } | null;
    service: { id: number; name: string; price: number };
}
interface Props { order?: Order; }

export default function Create({ order }: Props) {
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (order?.service) {
            setItems([{ key: '1', name: order.service.name, qty: 1, price: order.service.price, tax_amount: 0, discount_amount: 0, service_id: order.service.id }]);
        }
    }, [order]);

    const addItem = () => setItems(prev => [...prev, { key: String(Date.now()), name: '', qty: 1, price: 0, tax_amount: 0, discount_amount: 0 }]);
    const removeItem = (key: string) => setItems(prev => prev.filter(i => i.key !== key));
    const updateItem = (key: string, field: keyof InvoiceItem, value: any) => setItems(prev => prev.map(i => i.key === key ? { ...i, [field]: value } : i));

    const subTotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    const taxTotal = items.reduce((s, i) => s + i.tax_amount, 0);
    const discountTotal = items.reduce((s, i) => s + i.discount_amount, 0);
    const grandTotal = subTotal + taxTotal - discountTotal;

    const handleSubmit = () => {
        setSubmitting(true);
        router.post('/sales/invoices', {
            order_id: order?.id,
            items: items.map(({ key, ...rest }) => rest),
        }, { onFinish: () => setSubmitting(false) });
    };

    const custName = order?.customer?.full_name || order?.customer?.name || '';

    return (
        <DashboardLayout title="Create Invoice">
            <Head title="Create Invoice" />
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild><Link href="/sales/invoices"><ArrowLeft className="h-4 w-4" /></Link></Button>
                        <h1 className="text-2xl font-bold">Create Invoice</h1>
                    </div>
                    <Button onClick={handleSubmit} disabled={submitting}><Save className="h-4 w-4 mr-2" /> {submitting ? 'Saving...' : 'Save Invoice'}</Button>
                </div>

                {order && (
                    <Card><CardHeader><CardTitle className="text-base">Order Information</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><p className="text-muted-foreground">Order</p><p className="font-medium">#{order.id}</p></div>
                            <div><p className="text-muted-foreground">Customer</p><p className="font-medium">{custName}</p></div>
                            <div><p className="text-muted-foreground">Email</p><p>{order.customer?.email}</p></div>
                            <div><p className="text-muted-foreground">Phone</p><p>{order.customer?.phone}</p></div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Invoice Items</CardTitle>
                        <Button size="sm" variant="outline" onClick={addItem}><Plus className="h-4 w-4 mr-2" /> Add Item</Button>
                    </CardHeader>
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Item Name</TableHead><TableHead className="w-20">Qty</TableHead>
                            <TableHead className="w-32">Price</TableHead><TableHead className="w-28">Tax</TableHead>
                            <TableHead className="w-28">Discount</TableHead><TableHead className="text-right w-32">Total</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {items.map(item => (
                                <TableRow key={item.key}>
                                    <TableCell><Input value={item.name} onChange={e => updateItem(item.key, 'name', e.target.value)} placeholder="Item name" /></TableCell>
                                    <TableCell><Input type="number" min={1} value={item.qty} onChange={e => updateItem(item.key, 'qty', Number(e.target.value))} /></TableCell>
                                    <TableCell><Input type="number" min={0} value={item.price} onChange={e => updateItem(item.key, 'price', Number(e.target.value))} /></TableCell>
                                    <TableCell><Input type="number" min={0} value={item.tax_amount} onChange={e => updateItem(item.key, 'tax_amount', Number(e.target.value))} /></TableCell>
                                    <TableCell><Input type="number" min={0} value={item.discount_amount} onChange={e => updateItem(item.key, 'discount_amount', Number(e.target.value))} /></TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(item.qty * item.price)}</TableCell>
                                    <TableCell><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.key)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No items. Click "Add Item" to begin.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                    <CardContent className="pt-4">
                        <div className="flex justify-end"><div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(subTotal)}</span></div>
                            <div className="flex justify-between text-sm"><span>Tax</span><span>{formatCurrency(taxTotal)}</span></div>
                            <div className="flex justify-between text-sm"><span>Discount</span><span>-{formatCurrency(discountTotal)}</span></div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Grand Total</span><span>{formatCurrency(grandTotal)}</span></div>
                        </div></div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
