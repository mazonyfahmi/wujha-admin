<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'settings' => function () {
                return [
                    'store_name' => \App\Models\Setting::get('store_name', 'Wujha'),
                    'store_currency' => \App\Models\Setting::get('store_currency', 'SDG'),
                    'store_timezone' => \App\Models\Setting::get('store_timezone', 'Africa/Khartoum'),
                    'maintenance_mode' => \App\Models\Setting::get('maintenance_mode', '0'),
                    'default_language' => \App\Models\Setting::get('default_language', 'ar'),
                    'dashboard_logo' => \App\Models\Setting::get('dashboard_logo'),
                ];
            },
        ];
    }
}
