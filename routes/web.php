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
    AdminSettingController,
    AdminCategoryController
};
use App\Http\Controllers\{CartController, OrderController, ProductController};

// Public Routes
Route::get('/', function () {
    return redirect()->route('products.index');
})->name('home');

Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::post('/buyer/orders/create', [OrderController::class, 'create'])->name('buyer.orders.create');
Route::prefix('cart')->name('cart.')->group(function () {
    Route::post('/', [CartController::class, 'add'])->name('add'); // <-- cart.add

    // routes/web.php
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::put('/cart/{id}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/{id}', [CartController::class, 'destroy'])->name('cart.destroy');
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/buyer/orders/create', [OrderController::class, 'create'])->name('buyer.orders.create');
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{id}', [ProductController::class, 'show'])->name('products.show');
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/buyer/orders/create', [OrderController::class, 'create'])->name('buyer.orders.create');
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{id}', [ProductController::class, 'show'])->name('products.show');


});



// Newsletter subscription (jika ada form di homepage)
Route::post('/newsletter', function (Illuminate\Http\Request $request) {
    $request->validate(['email' => 'required|email']);
    // Handle newsletter subscription
    return redirect()->route('home')->with('success', 'Thank you for subscribing!');
})->name('newsletter.subscribe');

// Auth Routes
Route::middleware('auth')->group(function () {
    // Dashboard (user dashboard, bukan admin)
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Cart
    Route::prefix('cart')->name('cart.')->group(function () {
        Route::get('/', [CartController::class, 'index'])->name('index');
        Route::post('/', [CartController::class, 'add'])->name('add');
        Route::put('/{id}', [CartController::class, 'update'])->name('update');
        Route::delete('/{id}', [CartController::class, 'remove'])->name('remove');
        Route::delete('/', [CartController::class, 'clear'])->name('clear');
    });

    // Orders (User)
    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::post('/', [OrderController::class, 'store'])->name('store');
        Route::get('/{order}', [OrderController::class, 'show'])->name('show');
        Route::patch('/{order}/cancel', [OrderController::class, 'cancel'])->name('cancel');
    });
});

// Admin Routes
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // Dashboard
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('/statistics', [AdminDashboardController::class, 'statistics'])->name('statistics');

        // Products
        Route::prefix('products')->name('products.')->group(function () {
            Route::get('/', [AdminProductController::class, 'index'])->name('index');
            Route::get('/create', [AdminProductController::class, 'create'])->name('create');
            Route::post('/', [AdminProductController::class, 'store'])->name('store');
            Route::get('/low-stock', [AdminProductController::class, 'lowStock'])->name('low-stock');
            Route::get('/out-of-stock', [AdminProductController::class, 'outOfStock'])->name('out-of-stock');
            Route::get('/export', [AdminProductController::class, 'export'])->name('export');
            Route::post('/bulk-action', [AdminProductController::class, 'bulkAction'])->name('bulk-action');
            Route::get('/{product}', [AdminProductController::class, 'show'])->name('show');
            Route::get('/{product}/edit', [AdminProductController::class, 'edit'])->name('edit');
            Route::put('/{product}', [AdminProductController::class, 'update'])->name('update');
            Route::delete('/{product}', [AdminProductController::class, 'destroy'])->name('destroy');
            Route::patch('/{product}/stock', [AdminProductController::class, 'updateStock'])->name('update-stock');
            Route::patch('/{product}/toggle-status', [AdminProductController::class, 'toggleStatus'])->name('toggle-status');
        });

        // Orders
        Route::prefix('orders')->name('orders.')->group(function () {
            Route::get('/', [AdminOrderController::class, 'index'])->name('index');
            Route::get('/create', [AdminOrderController::class, 'create'])->name('create');
            Route::post('/', [AdminOrderController::class, 'store'])->name('store');
            Route::get('/pending', [AdminOrderController::class, 'pending'])->name('pending');
            Route::get('/processing', [AdminOrderController::class, 'processing'])->name('processing');
            Route::get('/shipped', [AdminOrderController::class, 'shipped'])->name('shipped');
            Route::get('/completed', [AdminOrderController::class, 'completed'])->name('completed');
            Route::get('/cancelled', [AdminOrderController::class, 'cancelled'])->name('cancelled');
            Route::get('/export', [AdminOrderController::class, 'export'])->name('export');
            Route::get('/statistics', [AdminOrderController::class, 'statistics'])->name('statistics');
            Route::post('/bulk-action', [AdminOrderController::class, 'bulkAction'])->name('bulk-action');
            Route::get('/{order}', [AdminOrderController::class, 'show'])->name('show');
            Route::get('/{order}/edit', [AdminOrderController::class, 'edit'])->name('edit');
            Route::put('/{order}', [AdminOrderController::class, 'update'])->name('update');
            Route::delete('/{order}', [AdminOrderController::class, 'destroy'])->name('destroy');
            Route::patch('/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('update-status');
        });

        // Users Management
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [AdminUserController::class, 'index'])->name('index');
            Route::get('/create', [AdminUserController::class, 'create'])->name('create');
            Route::post('/', [AdminUserController::class, 'store'])->name('store');
            Route::get('/active', [AdminUserController::class, 'active'])->name('active');
            Route::get('/inactive', [AdminUserController::class, 'inactive'])->name('inactive');
            Route::get('/new', [AdminUserController::class, 'new'])->name('new');
            Route::get('/buyers', [AdminUserController::class, 'buyers'])->name('buyers');
            Route::get('/admins', [AdminUserController::class, 'admins'])->name('admins');
            Route::get('/export', [AdminUserController::class, 'export'])->name('export');
            Route::post('/bulk-action', [AdminUserController::class, 'bulkAction'])->name('bulk-action');
            Route::get('/{user}', [AdminUserController::class, 'show'])->name('show');
            Route::get('/{user}/edit', [AdminUserController::class, 'edit'])->name('edit');
            Route::put('/{user}', [AdminUserController::class, 'update'])->name('update');
            Route::delete('/{user}', [AdminUserController::class, 'destroy'])->name('destroy');
            Route::patch('/{user}/toggle-status', [AdminUserController::class, 'toggleStatus'])->name('toggle-status');
        });

        // Reports
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [AdminReportController::class, 'index'])->name('index');
            Route::get('/sales', [AdminReportController::class, 'sales'])->name('sales');
            Route::get('/sales/export', [AdminReportController::class, 'exportSales'])->name('sales.export');
            Route::get('/products', [AdminReportController::class, 'products'])->name('products'); // INI YANG DIPAKAI VIEW LAPORAN PRODUK
            Route::get('/products/export', [AdminReportController::class, 'exportProducts'])->name('products.export');
            Route::get('/customers', [AdminReportController::class, 'customers'])->name('customers');
            Route::get('/customers/export', [AdminReportController::class, 'exportCustomers'])->name('customers.export');
            Route::get('/financial', [AdminReportController::class, 'financial'])->name('financial');
            Route::get('/financial/export', [AdminReportController::class, 'exportFinancial'])->name('financial.export');
            Route::get('/inventory', [AdminReportController::class, 'inventory'])->name('inventory');
            Route::get('/inventory/export', [AdminReportController::class, 'exportInventory'])->name('inventory.export');
        });

        // Settings
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [AdminSettingController::class, 'index'])->name('index');
            Route::get('/general', [AdminSettingController::class, 'general'])->name('general');
            Route::put('/general', [AdminSettingController::class, 'updateGeneral'])->name('general.update');
            Route::get('/store', [AdminSettingController::class, 'store'])->name('store');
            Route::put('/store', [AdminSettingController::class, 'updateStore'])->name('store.update');
            Route::get('/payment', [AdminSettingController::class, 'payment'])->name('payment');
            Route::put('/payment', [AdminSettingController::class, 'updatePayment'])->name('payment.update');
            Route::get('/shipping', [AdminSettingController::class, 'shipping'])->name('shipping');
            Route::put('/shipping', [AdminSettingController::class, 'updateShipping'])->name('shipping.update');
            Route::get('/email', [AdminSettingController::class, 'email'])->name('email');
            Route::put('/email', [AdminSettingController::class, 'updateEmail'])->name('email.update');
            Route::get('/notifications', [AdminSettingController::class, 'notifications'])->name('notifications');
            Route::put('/notifications', [AdminSettingController::class, 'updateNotifications'])->name('notifications.update');
        });

        // Categories
        Route::prefix('categories')->name('categories.')->group(function () {
            Route::get('/', [AdminCategoryController::class, 'index'])->name('index');
            Route::get('/create', [AdminCategoryController::class, 'create'])->name('create');
            Route::post('/', [AdminCategoryController::class, 'store'])->name('store');
            Route::get('/{category}/edit', [AdminCategoryController::class, 'edit'])->name('edit');
            Route::put('/{category}', [AdminCategoryController::class, 'update'])->name('update');
            Route::delete('/{category}', [AdminCategoryController::class, 'destroy'])->name('destroy');
        });

        // Additional Admin Routes
        Route::prefix('system')->name('system.')->group(function () {
            Route::get('/info', [AdminDashboardController::class, 'systemInfo'])->name('info');
            Route::post('/cache/clear', [AdminDashboardController::class, 'clearCache'])->name('cache.clear');
            Route::post('/cache/optimize', [AdminDashboardController::class, 'optimizeCache'])->name('cache.optimize');
            Route::get('/backup', [AdminDashboardController::class, 'backup'])->name('backup');
            Route::post('/backup/create', [AdminDashboardController::class, 'createBackup'])->name('backup.create');
            Route::get('/logs', [AdminDashboardController::class, 'logs'])->name('logs');
            Route::delete('/logs/clear', [AdminDashboardController::class, 'clearLogs'])->name('logs.clear');
        });
    });

// Buyer Routes
Route::middleware(['auth', 'role:buyer'])
    ->prefix('buyer')
    ->name('buyer.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Buyer/Dashboard');
        })->name('dashboard');
    });

// API Routes (untuk AJAX requests)
Route::middleware(['auth', 'role:admin'])
    ->prefix('api/admin')
    ->name('api.admin.')
    ->group(function () {
        Route::get('/quick-stats', [AdminDashboardController::class, 'quickStats'])->name('quick-stats');
        Route::get('/products/search', [AdminProductController::class, 'search'])->name('products.search');
        Route::get('/users/search', [AdminUserController::class, 'search'])->name('users.search');
        Route::get('/orders/search', [AdminOrderController::class, 'search'])->name('orders.search');
        Route::get('/notifications', [AdminDashboardController::class, 'notifications'])->name('notifications');
        Route::patch('/notifications/{id}/read', [AdminDashboardController::class, 'markNotificationRead'])->name('notifications.read');
    });

// Test Routes (hanya untuk development)
if (app()->environment('local')) {
    Route::get('/test', function () {
        return Inertia::render('Test');
    })->name('test');

    Route::get('/test-email', function () {
        return 'Email test route';
    })->name('test.email');
}

require __DIR__ . '/auth.php';
