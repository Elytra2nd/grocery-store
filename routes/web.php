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
use App\Http\Controllers\ProductController;

// Public Routes
Route::get('/', [ProductController::class, 'index'])->name('home');
Route::get('/products/{product}', [ProductController::class, 'show'])
    ->name('products.show');

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

    // Cart - Menggunakan struktur yang lebih lengkap
    Route::prefix('cart')->name('cart.')->group(function () {
        Route::get('/', [CartController::class, 'index'])->name('index');
        Route::post('/', [CartController::class, 'add'])->name('add');
        Route::put('/{id}', [CartController::class, 'update'])->name('update');
        Route::delete('/{id}', [CartController::class, 'remove'])->name('remove');
        Route::delete('/', [CartController::class, 'clear'])->name('clear');
    });

    // Orders (User) - Menggunakan struktur yang lebih lengkap
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

        // Products - Menggunakan struktur yang lebih lengkap
        Route::prefix('products')->name('products.')->group(function () {
            Route::get('/', [AdminProductController::class, 'index'])->name('index');
            Route::get('/create', [AdminProductController::class, 'create'])->name('create');
            Route::post('/', [AdminProductController::class, 'store'])->name('store');

            // Specific routes harus di atas dynamic routes
            Route::get('/low-stock', [AdminProductController::class, 'lowStock'])->name('low-stock');
            Route::get('/out-of-stock', [AdminProductController::class, 'outOfStock'])->name('out-of-stock');
            Route::get('/export', [AdminProductController::class, 'export'])->name('export');
            Route::post('/bulk-action', [AdminProductController::class, 'bulkAction'])->name('bulk-action');

            // Dynamic routes di bawah
            Route::get('/{product}', [AdminProductController::class, 'show'])->name('show');
            Route::get('/{product}/edit', [AdminProductController::class, 'edit'])->name('edit');
            Route::put('/{product}', [AdminProductController::class, 'update'])->name('update');
            Route::delete('/{product}', [AdminProductController::class, 'destroy'])->name('destroy');
            Route::patch('/{product}/stock', [AdminProductController::class, 'updateStock'])->name('update-stock');
            Route::patch('/{product}/toggle-status', [AdminProductController::class, 'toggleStatus'])->name('toggle-status');
        });

        // Orders - Struktur lengkap dengan semua status
        Route::prefix('orders')->name('orders.')->group(function () {
            Route::get('/', [AdminOrderController::class, 'index'])->name('index');
            Route::get('/create', [AdminOrderController::class, 'create'])->name('create');
            Route::post('/', [AdminOrderController::class, 'store'])->name('store');

            // Status routes - specific routes di atas dynamic routes
            Route::get('/pending', [AdminOrderController::class, 'pending'])->name('pending');
            Route::get('/processing', [AdminOrderController::class, 'processing'])->name('processing');
            Route::get('/shipped', [AdminOrderController::class, 'shipped'])->name('shipped');
            Route::get('/completed', [AdminOrderController::class, 'completed'])->name('completed');
            Route::get('/cancelled', [AdminOrderController::class, 'cancelled'])->name('cancelled');

            // Other specific routes
            Route::get('/export', [AdminOrderController::class, 'export'])->name('export');
            Route::get('/statistics', [AdminOrderController::class, 'statistics'])->name('statistics');
            Route::post('/bulk-action', [AdminOrderController::class, 'bulkAction'])->name('bulk-action');

            // Dynamic routes di bawah
            Route::get('/{order}', [AdminOrderController::class, 'show'])->name('show');
            Route::get('/{order}/edit', [AdminOrderController::class, 'edit'])->name('edit');
            Route::put('/{order}', [AdminOrderController::class, 'update'])->name('update');
            Route::delete('/{order}', [AdminOrderController::class, 'destroy'])->name('destroy');
            Route::patch('/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('update-status');
        });

        // Users Management
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [AdminUserController::class, 'index'])->name('index');
            Route::get('/new', [AdminUserController::class, 'new'])->name('new');
            Route::post('/', [AdminUserController::class, 'store'])->name('store');

            // Specific routes di atas dynamic routes
            Route::get('/active', [AdminUserController::class, 'active'])->name('active');

            // Dynamic routes di bawah
            Route::get('/{user}/edit', [AdminUserController::class, 'edit'])->name('edit');
            Route::put('/{user}', [AdminUserController::class, 'update'])->name('update');
            Route::delete('/{user}', [AdminUserController::class, 'destroy'])->name('destroy');
        });
    });
