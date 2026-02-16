<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRefundRequest;
use App\Http\Requests\UpdateRefundRequest;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Refund;
use App\Models\RefundItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RefundController extends Controller
{
    /**
     * Display a listing of the refunds.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Refund::class);

        $filters = $request->only(['search', 'state', 'refund_type', 'from_date', 'to_date']);
        $query = Refund::with(['order.service', 'customer', 'items', 'processedByUser'])->filter($filters);

        $refunds = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Dashboard/Sales/Refunds/Index', [
            'refunds' => $refunds,
            'filters' => $request->only(['state', 'refund_type', 'from_date', 'to_date', 'search']),
            'states' => Refund::getStates(),
            'types' => Refund::getTypes(),
        ]);
    }

    /**
     * Show the form for creating a new refund.
     */
    public function create(Request $request)
    {
        $this->authorize('create', Refund::class);

        $orderId = $request->query('order_id');
        $invoiceId = $request->query('invoice_id');
        
        $order = null;
        $invoice = null;

        if ($invoiceId) {
            $invoice = Invoice::with(['order.service', 'order.customer', 'items'])->findOrFail($invoiceId);
            $order = $invoice->order;
        } elseif ($orderId) {
            $order = Order::with(['service', 'customer'])->findOrFail($orderId);
            $invoice = Invoice::where('order_id', $orderId)->with('items')->first();
        }

        return Inertia::render('Dashboard/Sales/Refunds/Create', [
            'order' => $order,
            'invoice' => $invoice,
            'types' => Refund::getTypes(),
            'methods' => Refund::getMethods(),
        ]);
    }

    /**
     * Store a newly created refund.
     */
    public function store(StoreRefundRequest $request)
    {
        $this->authorize('create', Refund::class);

        $validated = $request->validated();

        $order = Order::findOrFail($validated['order_id']);

        DB::beginTransaction();
        try {
            // Calculate totals
            $subTotal = 0;
            $taxAmount = 0;

            foreach ($validated['items'] as $item) {
                $subTotal += ($item['qty'] * $item['price']);
                $taxAmount += $item['tax_amount'] ?? 0;
            }

            $adjustmentRefund = $validated['adjustment_refund'] ?? 0;
            $adjustmentFee = $validated['adjustment_fee'] ?? 0;
            $grandTotal = $subTotal + $taxAmount + $adjustmentRefund - $adjustmentFee;

            // Create refund
            $refund = Refund::create([
                'increment_id' => Refund::generateIncrementId(),
                'state' => 'pending',
                'order_id' => $order->id,
                'invoice_id' => $validated['invoice_id'] ?? null,
                'customer_id' => $order->customer_id,
                'refund_type' => $validated['refund_type'],
                'reason' => $validated['reason'] ?? null,
                'refund_method' => $validated['refund_method'] ?? null,
                'sub_total' => $subTotal,
                'tax_amount' => $taxAmount,
                'adjustment_refund' => $adjustmentRefund,
                'adjustment_fee' => $adjustmentFee,
                'grand_total' => $grandTotal,
            ]);

            // Create refund items
            foreach ($validated['items'] as $item) {
                $itemTotal = ($item['qty'] * $item['price']) + ($item['tax_amount'] ?? 0);

                RefundItem::create([
                    'refund_id' => $refund->id,
                    'invoice_item_id' => $item['invoice_item_id'] ?? null,
                    'service_id' => $item['service_id'] ?? $order->service_id,
                    'name' => $item['name'],
                    'sku' => $item['sku'] ?? null,
                    'description' => $item['description'] ?? null,
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'tax_amount' => $item['tax_amount'] ?? 0,
                    'total' => $itemTotal,
                ]);
            }

            DB::commit();

            return redirect()->route('refunds.show', $refund)
                ->with('success', 'Refund request created successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Refund creation failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return back()->withErrors(['error' => 'An error occurred while creating the refund. Please try again.']);
        }
    }

    /**
     * Display the specified refund.
     */
    public function show(Refund $refund)
    {
        $this->authorize('view', $refund);

        $refund->load(['order.service', 'order.customer', 'invoice', 'customer', 'items.service', 'processedByUser']);

        return Inertia::render('Dashboard/Sales/Refunds/Show', [
            'refund' => $refund,
            'states' => Refund::getStates(),
            'types' => Refund::getTypes(),
            'methods' => Refund::getMethods(),
        ]);
    }

    /**
     * Update the refund state.
     */
    public function update(Request $request, Refund $refund)
    {
        $this->authorize('update', $refund);

        $validated = $request->validate([
            'state' => 'required|in:pending,approved,rejected,processed',
            'admin_notes' => 'nullable|string',
            'transaction_id' => 'nullable|string|max:255',
        ]);

        $updateData = $validated;

        // If processed, record who and when
        if ($validated['state'] === 'processed' && $refund->state !== 'processed') {
            $updateData['processed_at'] = now();
            $updateData['processed_by'] = Auth::id();
        }

        $refund->update($updateData);

        return back()->with('success', 'Refund status updated successfully.');
    }

    /**
     * Remove the specified refund.
     */
    public function destroy(Refund $refund)
    {
        $this->authorize('delete', $refund);

        // Only allow deletion of pending refunds
        if ($refund->state !== 'pending') {
            return back()->withErrors(['error' => 'Only pending refund requests can be deleted.']);
        }

        $refund->delete();

        return redirect()->route('refunds.index')
            ->with('success', 'Refund request deleted successfully.');
    }
}
