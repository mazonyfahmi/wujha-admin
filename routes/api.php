<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ServiceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Following Bagisto patterns
| for Headless API architecture.
|
*/

Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Public Routes (No Authentication Required)
    |--------------------------------------------------------------------------
    */
    Route::middleware('throttle:public')->group(function () {
        
        // Categories
        Route::controller(CategoryController::class)->prefix('categories')->group(function () {
            Route::get('/', 'index')->name('api.categories.index');
            Route::get('/tree', 'tree')->name('api.categories.tree');
            Route::get('/{category}', 'show')->name('api.categories.show');
        });

        // Services
        Route::controller(ServiceController::class)->prefix('services')->group(function () {
            Route::get('/', 'index')->name('api.services.index');
            Route::get('/popular', 'popular')->name('api.services.popular');
            Route::get('/featured', 'featured')->name('api.services.featured');
            Route::get('/{service}', 'show')->name('api.services.show');
            Route::get('/{service}/related', 'related')->name('api.services.related');
        });

        // Services by Category
        Route::get('/categories/{category}/services', [ServiceController::class, 'byCategory'])
            ->name('api.categories.services');

        // Banners
        Route::controller(BannerController::class)->prefix('banners')->group(function () {
            Route::get('/', 'index')->name('api.banners.index');
            Route::get('/{banner}', 'show')->name('api.banners.show');
        });

        // Media (Proxy for CORS)
        Route::get('/media/{filename}', [App\Http\Controllers\Api\MediaController::class, 'show'])->name('api.media.show');
    });

    /*
    |--------------------------------------------------------------------------
    | Authentication Routes (Strict Rate Limiting)
    |--------------------------------------------------------------------------
    */
    Route::middleware('throttle:auth')->group(function () {
        Route::controller(AuthController::class)->prefix('auth')->group(function () {
            Route::post('/login', 'login')->name('api.auth.login');
            Route::post('/register', 'register')->name('api.auth.register');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Protected Routes (Authentication Required)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

        // Auth / Profile
        Route::controller(AuthController::class)->prefix('auth')->group(function () {
            Route::get('/user', 'user')->name('api.auth.user');
            Route::post('/logout', 'logout')->name('api.auth.logout');
            Route::put('/profile', 'updateProfile')->name('api.auth.profile.update');
            Route::post('/refresh-token', 'refreshToken')->name('api.auth.refresh');
        });

        // Orders
        Route::middleware('throttle:orders')->group(function () {
            Route::controller(OrderController::class)->prefix('orders')->group(function () {
                Route::get('/', 'index')->name('api.orders.index');
                Route::post('/', 'store')->name('api.orders.store');
                Route::get('/{order}', 'show')->name('api.orders.show');
                Route::get('/{order}/track', 'track')->name('api.orders.track');
                Route::post('/{order}/cancel', 'cancel')->name('api.orders.cancel');
            });
        });
    });
});
