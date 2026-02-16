<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\Setting;

class SessionTimeout
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $timeout = (int) Setting::get('session_timeout', 120);

        if ($timeout === 0) {
            return $next($request);
        }

        if (Auth::check()) {
            $lastActivity = session('last_activity');
            if ($lastActivity && (time() - $lastActivity > $timeout * 60)) {
                Auth::logout();
                session()->flush();
                return redirect()->route('login')->with('status', 'Your session has expired due to inactivity.');
            }
            session(['last_activity' => time()]);
        }

        return $next($request);
    }
}
