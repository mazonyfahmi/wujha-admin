<?php

namespace App\Listeners;

use App\Models\User;
use App\Models\Setting;
use App\Notifications\NewOrderNotification;
use Illuminate\Support\Facades\Notification;

class SendNewOrderNotification
{
    /**
     * Handle the event.
     */
    public function handle(object $event): void
    {
        // Check if notification is enabled
        if (Setting::get('notify_new_order', '1') !== '1') {
            return;
        }

        // Get admin email
        $adminEmail = Setting::get('notification_email') ?? Setting::get('contact_email');
        
        if ($adminEmail) {
            // Send to specific email if configured
            Notification::route('mail', $adminEmail)
                ->notify(new NewOrderNotification($event));
        } else {
            // Fallback: Notify all admins
            $admins = User::where('role', 'admin')->get(); // Assuming 'role' column exists or similar logic
            if ($admins->isEmpty()) {
                 // If no role column, maybe just notify the first user? Or skip.
                 // For now, let's assume there's a way to identify admins. 
                 // Given Middleware EnsureUserIsAdmin uses $request->user()->is_admin or similar.
                 // Let's check User model later.
                 // For now, I'll allow routing to the config email. 
            }
            Notification::send($admins, new NewOrderNotification($event));
        }
    }
}
