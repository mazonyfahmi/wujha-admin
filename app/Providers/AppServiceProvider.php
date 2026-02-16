<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Set Locale
        if (!app()->runningInConsole()) {
            try {
                \Illuminate\Support\Facades\App::setLocale(\App\Models\Setting::get('default_language', 'ar'));
            } catch (\Exception $e) {
                // Fallback to default if DB not ready
                \Illuminate\Support\Facades\App::setLocale('ar');
            }
        }

        // Password Defaults
        \Illuminate\Validation\Rules\Password::defaults(function () {
            $minLength = 8;
            $requireUppercase = true;
            $requireNumbers = true;

            if (!app()->runningInConsole()) {
                try {
                    $minLength = (int) \App\Models\Setting::get('min_password_length', 8);
                    $requireUppercase = \App\Models\Setting::get('require_uppercase', '1') === '1';
                    $requireNumbers = \App\Models\Setting::get('require_numbers', '1') === '1';
                } catch (\Exception $e) {
                    // Fallback to safe defaults
                }
            }

            $rule = \Illuminate\Validation\Rules\Password::min($minLength);
            
            if ($requireUppercase) {
                $rule->mixedCase();
            }
            
            if ($requireNumbers) {
                $rule->numbers();
            }
            
            return $rule;
        });

        // Event Listeners
        \Illuminate\Support\Facades\Event::listen('order.created', \App\Listeners\SendNewOrderNotification::class);
        \Illuminate\Support\Facades\Event::listen(\Illuminate\Auth\Events\Registered::class, \App\Listeners\SendNewCustomerNotification::class);

        // API Rate Limiting
        $this->configureRateLimiting();
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        // Default API rate limit
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by(
                $request->user()?->id ?: $request->ip()
            );
        });

        // Strict rate limit for authentication endpoints
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by(
                $request->ip()
            )->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many requests. Please try again later.',
                ], 429);
            });
        });

        // Rate limit for order creation
        RateLimiter::for('orders', function (Request $request) {
            return Limit::perMinute(30)->by(
                $request->user()?->id ?: $request->ip()
            );
        });

        // Public endpoints (higher limit)
        RateLimiter::for('public', function (Request $request) {
            return Limit::perMinute(120)->by(
                $request->ip()
            );
        });
    }
}

