<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        // DIPERBAIKI: Query hanya menggunakan kolom yang ada di tabel
        $popularProducts = Product::select([
                'id', 'name', 'price', 'image', 'category_id'
                // Hapus 'unit' dan 'emoji' karena tidak ada di tabel
            ])
            ->withCount(['orderItems as sold_count' => function($query) {
                $query->whereHas('order', function($orderQuery) {
                    $orderQuery->where('status', 'delivered');
                });
            }])
            ->with('category:id,name')
            ->where('is_active', true)
            ->orderBy('sold_count', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => (float) $product->price,
                    'unit' => 'pcs', // Default value
                    'image' => $product->image,
                    'emoji' => '🛒', // Default emoji
                    'sold_count' => (int) $product->sold_count,
                    'category' => $product->category->name ?? 'Umum',
                ];
            });

        // Cart items dengan kolom yang ada
        $cartItems = Cart::where('user_id', $user->id)
            ->with(['product' => function($query) {
                $query->select('id', 'name', 'price', 'image', 'category_id')
                      ->with('category:id,name');
            }])
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($cartItem) {
                return [
                    'id' => $cartItem->id,
                    'quantity' => (int) $cartItem->quantity,
                    'created_at' => $cartItem->created_at->toISOString(),
                    'product' => [
                        'id' => $cartItem->product->id,
                        'name' => $cartItem->product->name,
                        'price' => (float) $cartItem->product->price,
                        'unit' => 'pcs', // Default value
                        'image' => $cartItem->product->image,
                        'emoji' => '🛒', // Default emoji
                        'category' => $cartItem->product->category->name ?? 'Umum',
                    ],
                ];
            });

        // Recent orders
        $recentOrders = Order::where('user_id', $user->id)
            ->with(['orderItems.product' => function($query) {
                $query->select('id', 'name', 'category_id')
                      ->with('category:id,name');
            }])
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number ?? 'ORD-' . $order->id,
                    'created_at' => $order->created_at->toISOString(),
                    'status' => $order->status,
                    'total_amount' => (float) $order->total_amount,
                    'shipping_address' => $order->shipping_address ?? '',
                    'items_count' => $order->orderItems->count(),
                    'items' => $order->orderItems->map(function ($orderItem) {
                        return [
                            'quantity' => (int) $orderItem->quantity,
                            'price' => (float) $orderItem->price,
                            'product' => [
                                'id' => $orderItem->product->id,
                                'name' => $orderItem->product->name,
                                'price' => (float) $orderItem->price,
                                'emoji' => '🛒', // Default emoji
                                'category' => $orderItem->product->category->name ?? 'Umum',
                            ],
                        ];
                    })->toArray(),
                ];
            });

        // Calculate statistics
        $totalProducts = Product::where('is_active', true)->count();

        $cartItemsCount = Cart::where('user_id', $user->id)->sum('quantity');

        $cartTotalValue = Cart::where('user_id', $user->id)
            ->with('product')
            ->get()
            ->sum(function ($cartItem) {
                return $cartItem->quantity * $cartItem->product->price;
            });

        $totalOrders = Order::where('user_id', $user->id)->count();

        $totalSpent = Order::where('user_id', $user->id)
            ->where('status', 'delivered')
            ->sum('total_amount');

        $pendingOrders = Order::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'processing', 'packed', 'shipped'])
            ->count();

        $stats = [
            'totalProducts' => $totalProducts,
            'cartItemsCount' => $cartItemsCount,
            'cartTotalValue' => (float) $cartTotalValue,
            'totalOrders' => $totalOrders,
            'totalSpent' => (float) $totalSpent,
            'pendingOrders' => $pendingOrders,
        ];

        return Inertia::render('Buyer/Dashboard', [
            'popularProducts' => $popularProducts,
            'cartItems' => $cartItems,
            'recentOrders' => $recentOrders,
            'stats' => $stats,
        ]);
    }
}
