<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\Admin\AdminProductController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Tambahkan di routes/web.php

// API routes untuk search
Route::get('/api/products/search', [ProductController::class, 'search']);
Route::get('/api/products/categories', [ProductController::class, 'categories']);

// Admin product routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('products', AdminProductController::class);
    Route::post('products/bulk-action', [AdminProductController::class, 'bulkAction'])->name('products.bulk-action');
    Route::patch('products/{product}/stock', [AdminProductController::class, 'updateStock'])->name('products.update-stock');
});


require __DIR__.'/auth.php';

use App\Http\Controllers\CartController;

Route::middleware('auth')->group(function () {
    Route::post('/cart', [CartController::class, 'add']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'delete']);
});

use App\Http\Controllers\OrderController;

Route::middleware('auth')->group(function () {
    Route::post('/orders', [OrderController::class, 'create']);
    Route::get('/orders/{id}', [OrderController::class, 'view']);
    Route::get('/orders', [OrderController::class, 'history']);
});
