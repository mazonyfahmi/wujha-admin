<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Models\Service;
use App\Models\Customer;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', Order::class);

        $filters = $request->only(['search', 'status', 'payment_method', 'from_date', 'to_date']);
        $query = Order::with(['customer', 'service'])->filter($filters);

        $orders = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        // Calculate stats
        $stats = [
            'total' => Order::count(),
            'active' => Order::whereIn('status', OrderStatus::activeValues())->count(),
            'completed' => Order::where('status', OrderStatus::ISSUED)->count(),
            'canceled' => Order::whereIn('status', [OrderStatus::REJECTED->value, OrderStatus::CANCELED->value])->count(),
        ];

        $services = Service::where('is_active', true)->select('id', 'name', 'price')->get();
        $customers = Customer::where('status', true)->where('is_suspended', false)
            ->orderBy('first_name')
            ->select('id', 'first_name', 'last_name')
            ->get()
            ->map(fn ($customer) => [
                'id' => $customer->id,
                'name' => $customer->first_name . ' ' . $customer->last_name,
            ]);
        $statuses = Order::getStatuses();

        return Inertia::render('Dashboard/Orders/Index', [
            'orders' => $orders,
            'stats' => $stats,
            'services' => $services,
            'customers' => $customers,
            'statuses' => $statuses,
            'filters' => $request->only(['search', 'status', 'payment_method', 'from_date', 'to_date']),
        ]);
    }

    public function store(StoreOrderRequest $request)
    {
        $this->authorize('create', Order::class);

        $validated = $request->validated();
        $validated['user_id'] = auth()->id();

        $this->orderService->create($validated);

        return redirect()->back()->with('success', 'Order created successfully.');
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order)
    {
        $this->authorize('updateStatus', $order);

        $this->orderService->updateStatus($order, $request->validated()['status']);

        return redirect()->back()->with('success', 'Order status updated successfully.');
    }

    public function destroy(Order $order)
    {
        $this->authorize('delete', $order);

        $this->orderService->delete($order);

        return redirect()->back()->with('success', 'Order deleted successfully.');
    }
}
