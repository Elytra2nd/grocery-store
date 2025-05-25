<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\{
    AdminDashboardController,
    AdminProductController,
    AdminOrderController,
    AdminUserController,
    AdminReportController,
    AdminSettingController
};
use App\Http\Controllers\{CartController, OrderController};

// Public Routes
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Auth Routes
Route::middleware('auth')->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Cart
    Route::post('/cart', [CartController::class, 'add']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'delete']);
    
    // Orders
    Route::post('/orders', [OrderController::class, 'create']);
    Route::get('/orders/{id}', [OrderController::class, 'view']);
    Route::get('/orders', [OrderController::class, 'history']);
});

// Admin Routes
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // Dashboard
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        
        // Products
        Route::resource('products', AdminProductController::class);
        Route::patch('products/{product}/stock', [AdminProductController::class, 'updateStock'])->name('products.update-stock');
        Route::post('products/bulk-action', [AdminProductController::class, 'bulkAction'])->name('products.bulk-action');
        Route::get('products/low-stock', [AdminProductController::class, 'lowStock'])->name('products.low-stock');
        
        // Orders
        Route::get('orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::get('orders/pending', [AdminOrderController::class, 'pending'])->name('orders.pending');
        Route::get('orders/processing', [AdminOrderController::class, 'processing'])->name('orders.processing');
        Route::get('orders/shipped', [AdminOrderController::class, 'shipped'])->name('orders.shipped');
        Route::get('orders/completed', [AdminOrderController::class, 'completed'])->name('orders.completed');
        
        // Users
        Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
        Route::get('users/active', [AdminUserController::class, 'active'])->name('users.active');
        Route::get('users/new', [AdminUserController::class, 'new'])->name('users.new');
        
        // Reports
        Route::get('reports', [AdminReportController::class, 'index'])->name('reports.index');
        Route::get('reports/sales', [AdminReportController::class, 'sales'])->name('reports.sales');
        Route::get('reports/products', [AdminReportController::class, 'products'])->name('reports.products');
        Route::get('reports/customers', [AdminReportController::class, 'customers'])->name('reports.customers');
        Route::get('reports/financial', [AdminReportController::class, 'financial'])->name('reports.financial');
        
        // Settings
        Route::get('settings', [AdminSettingController::class, 'index'])->name('settings.index');
        Route::get('settings/general', [AdminSettingController::class, 'general'])->name('settings.general');
        Route::get('settings/store', [AdminSettingController::class, 'store'])->name('settings.store'); // 💡 Ubah ke 'shop' jika bukan untuk POST
        Route::get('settings/payment', [AdminSettingController::class, 'payment'])->name('settings.payment');
        Route::get('settings/shipping', [AdminSettingController::class, 'shipping'])->name('settings.shipping');
        
        // Categories
        Route::get('categories', [AdminProductController::class, 'categories'])->name('categories.index');
    });

require __DIR__.'/auth.php';
