<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Api\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Event;

class OrderController extends ApiController
{
    /**
     * Get user's orders
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $query = Order::with(['customer', 'service', 'service.category'])
            ->where('customer_id', $user->id);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $allowedSorts = ['created_at', 'updated_at', 'price', 'status'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder === 'asc' ? 'asc' : 'desc');
        }

        $perPage = min($request->get('per_page', 15), 50);
        $orders = $query->paginate($perPage);

        return $this->paginatedResponse(
            OrderResource::collection($orders)
        );
    }

    /**
     * Create a new order
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();
        
        $service = Service::findOrFail($validated['service_id']);

        if (!$service->is_active) {
            return $this->errorResponse(
                'This service is currently unavailable.',
                Response::HTTP_BAD_REQUEST
            );
        }

        $order = Order::create([
            'customer_id' => $user->id,
            'service_id' => $service->id,
            'status' => 'pending',
            'price' => $service->price,
            'payment_method' => $validated['payment_method'],
            'notes' => $validated['notes'] ?? null,
        ]);

        $order->load(['customer', 'service', 'service.category']);

        Event::dispatch('order.created', $order);

        return $this->createdResponse(
            new OrderResource($order),
            'Order created successfully.'
        );
    }

    /**
     * Get single order details
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();

        // Ensure user owns this order
        if ($order->customer_id !== $user->id) {
            return $this->forbiddenResponse('You are not authorized to access this order.');
        }

        $order->load(['customer', 'service', 'service.category', 'service.images']);

        return $this->resourceResponse(
            new OrderResource($order)
        );
    }

    /**
     * Cancel an order
     */
    public function cancel(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();

        // Ensure user owns this order
        if ($order->customer_id !== $user->id) {
            return $this->forbiddenResponse('You are not authorized to cancel this order.');
        }

        // Can only cancel pending orders
        $cancellableStatuses = ['pending', 'payment_confirmation', 'review'];
        if (!in_array($order->status, $cancellableStatuses)) {
            return $this->errorResponse(
                'This order cannot be cancelled. Current status: ' . $order->status,
                Response::HTTP_BAD_REQUEST
            );
        }

        $order->update([
            'status' => 'canceled',
            'notes' => $request->get('reason', 'Customer requested cancellation'),
        ]);

        Event::dispatch('order.cancelled', $order->fresh());

        return $this->successResponse(
            new OrderResource($order->fresh()),
            'Order cancelled successfully.'
        );
    }

    /**
     * Get order tracking/status updates
     */
    public function track(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();

        if ($order->customer_id !== $user->id) {
            return $this->forbiddenResponse('You are not authorized to access this order.');
        }

        return $this->successResponse([
            'status' => $order->status,
            'status_label' => $order->status_label ?? $order->status,
            'created_at' => $order->created_at?->toISOString(),
            'updated_at' => $order->updated_at?->toISOString(),
        ]);
    }
}
