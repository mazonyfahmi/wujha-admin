<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Models\Invoice;
use App\Models\Order;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    protected $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    /**
     * Display a listing of the invoices.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Invoice::class);

        $filters = $request->only(['search', 'state', 'from_date', 'to_date']);
        $query = Invoice::with(['order', 'customer', 'items'])->filter($filters);

        $invoices = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Dashboard/Sales/Invoices/Index', [
            'invoices' => $invoices,
            'filters' => $request->only(['state', 'from_date', 'to_date', 'search']),
            'states' => Invoice::getStates(),
        ]);
    }

    /**
     * Show the form for creating a new invoice from an order.
     */
    public function create(Request $request)
    {
        $this->authorize('create', Invoice::class);

        $orderId = $request->query('order_id');
        $order = null;

        if ($orderId) {
            $order = Order::with(['service', 'customer'])->findOrFail($orderId);
        }

        return Inertia::render('Dashboard/Sales/Invoices/Create', [
            'order' => $order,
        ]);
    }

    /**
     * Store a newly created invoice.
     */
    public function store(StoreInvoiceRequest $request)
    {
        $this->authorize('create', Invoice::class);

        $validated = $request->validated();

        $order = Order::with(['service', 'customer'])->findOrFail($validated['order_id']);

        // Check if invoice already exists for this order
        $existingInvoice = Invoice::where('order_id', $order->id)->first();
        if ($existingInvoice) {
            return back()->withErrors(['order_id' => 'Invoice already exists for this order.']);
        }

        try {
            $invoice = $this->invoiceService->createFromOrder($order, $validated);

            return redirect()->route('invoices.show', $invoice)
                ->with('success', 'Invoice created successfully.');

        } catch (\Exception $e) {
            \Log::error('Invoice creation failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return back()->withErrors(['error' => 'An error occurred while creating the invoice. Please try again.']);
        }
    }

    /**
     * Display the specified invoice.
     */
    public function show(Invoice $invoice)
    {
        $this->authorize('view', $invoice);

        $invoice->load(['order.service', 'order.customer', 'customer', 'items.service']);

        return Inertia::render('Dashboard/Sales/Invoices/Show', [
            'invoice' => $invoice,
            'states' => Invoice::getStates(),
        ]);
    }

    /**
     * Update the invoice state.
     */
    public function update(UpdateInvoiceRequest $request, Invoice $invoice)
    {
        $this->authorize('update', $invoice);

        $this->invoiceService->updateStatus($invoice, $request->validated());

        return back()->with('success', 'Invoice status updated successfully.');
    }

    /**
     * Remove the specified invoice.
     */
    public function destroy(Invoice $invoice)
    {
        $this->authorize('delete', $invoice);

        try {
            $this->invoiceService->delete($invoice);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        return redirect()->route('invoices.index')
            ->with('success', 'Invoice deleted successfully.');
    }

    /**
     * Generate PDF for the invoice.
     */
    public function print(Invoice $invoice)
    {
        $invoice->load(['order.service', 'order.customer', 'customer', 'items.service']);

        return Inertia::render('Dashboard/Sales/Invoices/Print', [
            'invoice' => $invoice,
        ]);
    }
}
