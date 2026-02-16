<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();

        return Inertia::render('Dashboard/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            // General
            'store_name'          => 'nullable|string|max:255',
            'store_tagline'       => 'nullable|string|max:255',
            'contact_email'       => 'nullable|email|max:255',
            'contact_phone'       => 'nullable|string|max:50',
            'store_address'       => 'nullable|string|max:500',
            'store_currency'      => 'nullable|string|max:10',
            'store_timezone'      => 'nullable|string|max:100',

            // Payments — bank account
            'bank_name'           => 'nullable|string|max:255',
            'bank_account_name'   => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:100',
            'bank_branch_name'    => 'nullable|string|max:255',
            'bank_iban'           => 'nullable|string|max:100',
            'payment_bank_transfer'   => 'nullable|in:0,1',
            'payment_cash_on_delivery' => 'nullable|in:0,1',
            'payment_mobile_wallet'    => 'nullable|in:0,1',

            // Notifications
            'notify_new_order'     => 'nullable|in:0,1',
            'notify_order_status'  => 'nullable|in:0,1',
            'notify_new_customer'  => 'nullable|in:0,1',
            'notify_low_stock'     => 'nullable|in:0,1',
            'notify_new_review'    => 'nullable|in:0,1',
            'notify_refund_request' => 'nullable|in:0,1',
            'notification_email'   => 'nullable|email|max:255',

            // Localization
            'default_language'     => 'nullable|string|max:10',
            'date_format'          => 'nullable|string|max:20',
            'number_format'        => 'nullable|string|max:20',

            // Security
            'min_password_length'  => 'nullable|in:6,8,10,12',
            'require_uppercase'    => 'nullable|in:0,1',
            'require_numbers'      => 'nullable|in:0,1',
            'session_timeout'      => 'nullable|in:0,30,60,120,480',
            'enable_2fa'           => 'nullable|in:0,1',

            // Maintenance
            'maintenance_mode'     => 'nullable|in:0,1',
            'maintenance_message'  => 'nullable|string|max:1000',
            
            // Logo
            'dashboard_logo'       => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        // Handle File Upload
        if ($request->hasFile('dashboard_logo')) {
            $file = $request->file('dashboard_logo');
            $path = $file->store('settings', 'public'); // stores in storage/app/public/settings
            $validated['dashboard_logo'] = '/storage/' . $path; // accessible via public/storage/settings
        } else {
             // If no file uploaded, remove key so it doesn't overwrite with null
             // UNLESS we want to support clearing the logo? For now, let's just keep existing if not provided.
             unset($validated['dashboard_logo']);
        }

        foreach ($validated as $key => $value) {
            Setting::set($key, $value ?? '');
        }

        return redirect()->back()->with('success', 'Settings saved successfully.');
    }
}
