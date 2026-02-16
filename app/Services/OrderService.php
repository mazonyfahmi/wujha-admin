<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Order;

class OrderService
{
    /**
     * Create a new order.
     */
    public function create(array $data): Order
    {
        // Set default status if not provided
        $data['status'] = $data['status'] ?? 'pending';
        
        return Order::create($data);
    }

    /**
     * Update the status of an order and send notification.
     */
    public function updateStatus(Order $order, string $status): bool
    {
        $oldStatus = $order->status instanceof \BackedEnum ? $order->status->value : (string) $order->status;
        
        $updated = $order->update(['status' => $status]);

        if ($updated) {
            $this->sendStatusNotification($order, $oldStatus, $status);
        }

        return $updated;
    }

    /**
     * Delete an order.
     */
    public function delete(Order $order): bool
    {
        return $order->delete();
    }

    /**
     * Send status update notification to the customer.
     */
    protected function sendStatusNotification(Order $order, string $oldStatus, string $newStatus): void
    {
        Notification::create([
            'customer_id' => $order->customer_id,
            'title' => 'Order Status Update',
            'body' => 'Your order status has been changed to: ' . (Order::getStatuses()[$newStatus] ?? $newStatus),
            'type' => 'order_status',
            'data' => json_encode([
                'order_id' => $order->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ]),
        ]);
    }
}
