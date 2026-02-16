<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia;
use App\Models\Setting;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Allow dashboard/admin access
        if ($request->is('dashboard*') || $request->is('admin*') || $request->is('login') || $request->is('logout')) {
            return $next($request);
        }

        // Check if maintenance mode is enabled
        if (Setting::get('maintenance_mode') === '1') {
            return Inertia::render('Maintenance', [
                'message' => Setting::get('maintenance_message', 'We are currently performing scheduled maintenance. Please try again later.')
            ])->toResponse($request)->setStatusCode(503);
        }

        return $next($request);
    }
}
