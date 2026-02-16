import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import dayjs from 'dayjs';

interface InvoiceItem { id: number; name: string; qty: number; price: number; total: number; }
interface Invoice {
    id: number; increment_id: string; created_at: string;
    billing_address_name: string; billing_address_email: string;
    billing_address_phone: string; billing_address: string;
    sub_total: number; tax_amount: number; discount_amount: number; grand_total: number;
    items: InvoiceItem[];
}
interface Props { invoice: Invoice; }

export default function Print({ invoice }: Props) {
    useEffect(() => { window.print(); }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto bg-white">
            <Head title={`Invoice ${invoice.increment_id}`} />
            <div className="flex justify-between items-start mb-8 border-b pb-4">
                <div><h1 className="text-3xl font-bold text-gray-800">Invoice</h1><p className="text-gray-600">#{invoice.increment_id}</p></div>
                <div className="text-right"><h2 className="text-xl font-bold">Wujha</h2><p className="text-gray-600">Services Platform</p></div>
            </div>
            <div className="flex justify-between mb-8">
                <div><h3 className="text-gray-500 font-bold uppercase text-xs mb-2">Billed To</h3><p className="font-bold">{invoice.billing_address_name}</p><p>{invoice.billing_address_email}</p><p>{invoice.billing_address_phone}</p><p>{invoice.billing_address}</p></div>
                <div className="text-right"><h3 className="text-gray-500 font-bold uppercase text-xs mb-2">Details</h3><p><span className="text-gray-500">Date:</span> {dayjs(invoice.created_at).format('DD/MM/YYYY')}</p></div>
            </div>
            <table className="w-full mb-8">
                <thead><tr className="border-b-2 border-gray-200"><th className="text-left py-2">Service</th><th className="text-center py-2">Qty</th><th className="text-right py-2">Price</th><th className="text-right py-2">Total</th></tr></thead>
                <tbody>{invoice.items.map(item => (
                    <tr key={item.id} className="border-b border-gray-100"><td className="py-2">{item.name}</td><td className="text-center py-2">{item.qty}</td><td className="text-right py-2">{Number(item.price).toFixed(2)}</td><td className="text-right py-2 font-medium">{Number(item.total).toFixed(2)}</td></tr>
                ))}</tbody>
            </table>
            <div className="flex justify-end">
                <div className="w-64">
                    <div className="flex justify-between py-1"><span className="text-gray-600">Subtotal:</span><span>{Number(invoice.sub_total).toFixed(2)} SDG</span></div>
                    {Number(invoice.tax_amount) > 0 && <div className="flex justify-between py-1"><span className="text-gray-600">Tax:</span><span>{Number(invoice.tax_amount).toFixed(2)} SDG</span></div>}
                    {Number(invoice.discount_amount) > 0 && <div className="flex justify-between py-1"><span className="text-gray-600">Discount:</span><span>-{Number(invoice.discount_amount).toFixed(2)} SDG</span></div>}
                    <div className="flex justify-between py-2 border-t border-gray-200 mt-2 font-bold text-lg"><span>Grand Total:</span><span>{Number(invoice.grand_total).toFixed(2)} SDG</span></div>
                </div>
            </div>
            <div className="mt-16 text-center text-gray-500 text-sm border-t pt-4"><p>Thank you for your business!</p></div>
            <style>{`@media print { @page { margin: 0; } body { margin: 1.6cm; } }`}</style>
        </div>
    );
}
