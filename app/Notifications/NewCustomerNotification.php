<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;
use App\Models\Setting;

class NewCustomerNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $customer;

    /**
     * Create a new notification instance.
     */
    public function __construct(User $customer)
    {
        $this->customer = $customer;
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
                    ->subject("New Customer Registration - {$storeName}")
                    ->greeting("Hello Admin,")
                    ->line("A new customer has registered.")
                    ->line("Name: {$this->customer->name}")
                    ->line("Email: {$this->customer->email}")
                    ->action('View Customer', url("/dashboard/customers/{$this->customer->id}"));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'customer_id' => $this->customer->id,
            'customer_name' => $this->customer->name,
            'message' => "New customer registered: {$this->customer->name}",
        ];
    }
}
