<?php

namespace App\Listeners;

use App\Models\User;
use App\Models\Setting;
use App\Notifications\NewCustomerNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Notification;

class SendNewCustomerNotification
{
    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        // Check if notification is enabled
        if (Setting::get('notify_new_customer', '1') !== '1') {
            return;
        }

        $user = $event->user;

        // Get admin email
        $adminEmail = Setting::get('notification_email') ?? Setting::get('contact_email');
        
        if ($adminEmail) {
             Notification::route('mail', $adminEmail)
                ->notify(new NewCustomerNotification($user));
        } else {
            // Fallback: Notify all admins
            // $admins = User::where('role', 'admin')->get();
            // Notification::send($admins, new NewCustomerNotification($user));
        }
    }
}
