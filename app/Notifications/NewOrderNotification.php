<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Order;
use App\Models\Setting;

class NewOrderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;

    /**
     * Create a new notification instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $storeName = Setting::get('store_name', 'Wujha');
        
        return (new MailMessage)
                    ->subject("New Order #{$this->order->id} - {$storeName}")
                    ->greeting("Hello Admin,")
                    ->line("You have received a new order.")
                    ->line("Order ID: #{$this->order->id}")
                    ->line("Customer: {$this->order->customer?->name}")
                    ->line("Amount: {$this->order->price} " . Setting::get('store_currency', 'SDG'))
                    ->action('View Order', url("/dashboard/orders/{$this->order->id}"));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'customer_name' => $this->order->customer?->name,
            'amount' => $this->order->price,
            'message' => "New order #{$this->order->id} received.",
        ];
    }
}
