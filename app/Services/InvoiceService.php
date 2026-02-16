<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InvoiceService
{
    /**
     * Create a new invoice from an order.
     *
     * @throws \Exception
     */
    public function createFromOrder(Order $order, array $data): Invoice
    {
        return DB::transaction(function () use ($order, $data) {
            // Calculate totals
            $subTotal = 0;
            $taxAmount = 0;
            $discountAmount = 0;

            foreach ($data['items'] as $item) {
                $subTotal += ($item['qty'] * $item['price']);
                $taxAmount += $item['tax_amount'] ?? 0;
                $discountAmount += $item['discount_amount'] ?? 0;
            }

            $grandTotal = $subTotal + $taxAmount - $discountAmount;

            // Create invoice
            $invoice = Invoice::create([
                'increment_id' => Invoice::generateIncrementId(),
                'state' => 'pending',
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'billing_address_name' => $data['billing_address_name'] ?? $order->customer?->full_name,
                'billing_address_email' => $data['billing_address_email'] ?? $order->customer?->email,
                'billing_address_phone' => $data['billing_address_phone'] ?? $order->customer?->phone,
                'billing_address' => $data['billing_address'] ?? null,
                'sub_total' => $subTotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'grand_total' => $grandTotal,
                'payment_method' => $order->payment_method,
            ]);

            // Create invoice items
            foreach ($data['items'] as $item) {
                $itemTotal = ($item['qty'] * $item['price']) + ($item['tax_amount'] ?? 0) - ($item['discount_amount'] ?? 0);

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'service_id' => $item['service_id'] ?? $order->service_id,
                    'name' => $item['name'],
                    'sku' => $item['sku'] ?? null,
                    'description' => $item['description'] ?? null,
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'tax_amount' => $item['tax_amount'] ?? 0,
                    'discount_amount' => $item['discount_amount'] ?? 0,
                    'total' => $itemTotal,
                    'additional' => $item['additional'] ?? null,
                ]);
            }

            return $invoice;
        });
    }

    /**
     * Update the status of an invoice.
     */
    public function updateStatus(Invoice $invoice, array $data): bool
    {
        return $invoice->update($data);
    }

    /**
     * Delete an invoice.
     *
     * @throws \Exception
     */
    public function delete(Invoice $invoice): bool
    {
        if ($invoice->state !== 'pending') {
            throw new \Exception('Only pending invoices can be deleted.');
        }

        return $invoice->delete();
    }
}
