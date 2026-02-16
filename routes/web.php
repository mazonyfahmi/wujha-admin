<?php

use App\Http\Controllers\ApiTokenController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerGroupController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FileUploadController;
use App\Http\Controllers\GDPRController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RefundController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Redirect root to dashboard
Route::get('/', function () {
    return redirect()->route('dashboard');
});

// Dashboard routes (protected - admin only)
Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Services
    Route::post('/services/bulk-delete', [ServiceController::class, 'bulkDelete'])->name('services.bulk-delete');
    Route::post('/services/bulk-toggle-status', [ServiceController::class, 'bulkToggleStatus'])->name('services.bulk-toggle-status');
    Route::resource('services', ServiceController::class);
    Route::post('/services/{service}/toggle-status', [ServiceController::class, 'toggleStatus'])->name('services.toggle-status');
    Route::post('/services/{service}/images', [ServiceController::class, 'addImage'])->name('services.images.add');
    Route::delete('/services/{service}/images/{image}', [ServiceController::class, 'removeImage'])->name('services.images.remove');
    Route::patch('/services/{service}/images/reorder', [ServiceController::class, 'reorderImages'])->name('services.images.reorder');
    
    // Service Slots
    Route::get('/services/{service}/slots', [ServiceController::class, 'getSlots'])->name('services.slots');
    Route::post('/services/{service}/slots/generate', [ServiceController::class, 'generateSlots'])->name('services.slots.generate');
    Route::get('/service-types', [ServiceController::class, 'getTypes'])->name('services.types');

    // Orders
    Route::resource('orders', OrderController::class)->except(['create', 'show', 'edit', 'update']);
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');

    // Categories
    Route::resource('categories', CategoryController::class)->except(['create', 'show', 'edit']);

    // Customers
    Route::post('/customers/bulk-delete', [CustomerController::class, 'bulkDelete'])->name('customers.bulk-delete');
    Route::post('/customers/bulk-status', [CustomerController::class, 'bulkUpdateStatus'])->name('customers.bulk-status');
    Route::patch('/customers/{customer}/toggle-suspension', [CustomerController::class, 'toggleSuspension'])->name('customers.toggle-suspension');
    Route::resource('customers', CustomerController::class);

    // Customer Groups
    Route::resource('customer-groups', CustomerGroupController::class);

    // Reviews
    Route::resource('reviews', ReviewController::class);
    Route::post('reviews/mass-destroy', [ReviewController::class, 'massDestroy'])->name('reviews.mass_destroy');
    Route::post('reviews/mass-update', [ReviewController::class, 'massUpdate'])->name('reviews.mass_update');

    // GDPR
    Route::resource('gdpr', GDPRController::class)->only(['index', 'show', 'update', 'destroy']);

    // Invoices
    Route::get('invoices/{invoice}/print', [InvoiceController::class, 'print'])->name('invoices.print');
    Route::resource('invoices', InvoiceController::class);

    // Refunds
    Route::resource('refunds', RefundController::class);

    // Users (Admin Users)
    Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);

    // Banners
    Route::resource('banners', BannerController::class)->except(['create', 'show', 'edit']);

    // Chat
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/users', [ChatController::class, 'users'])->name('chat.users');
    Route::get('/chat/{user}/messages', [ChatController::class, 'messages'])->name('chat.messages');
    Route::get('/chat/{user}/poll', [ChatController::class, 'poll'])->name('chat.poll');
    Route::post('/chat/{user}/send', [ChatController::class, 'send'])->name('chat.send');

    // Settings
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');

    // API Tokens
    Route::get('/api-tokens', [ApiTokenController::class, 'index'])->name('api-tokens.index');
    Route::post('/api-tokens', [ApiTokenController::class, 'store'])->name('api-tokens.store');
    Route::delete('/api-tokens/{apiToken}', [ApiTokenController::class, 'destroy'])->name('api-tokens.destroy');

    // File Upload
    Route::post('/upload', [FileUploadController::class, 'upload'])->name('upload');
    Route::delete('/upload', [FileUploadController::class, 'delete'])->name('upload.delete');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
