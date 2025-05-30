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

class BuyerDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Produk terlaris berdasarkan jumlah terjual
        $popularProducts = Product::withCount('orderItems') // assuming relation
            ->orderByDesc('order_items_count')
            ->take(3)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'unit' => $product->unit,
                    'image' => $product->image,
                    'emoji' => $product->emoji,
                    'category' => $product->category,
                    'sold_count' => $product->order_items_count,
                ];
            });

        // Item keranjang milik user
        $cartItems = Cart::with('product')
            ->where('user_id', $user->id)
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'created_at' => $item->created_at,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'price' => $item->product->price,
                        'unit' => $item->product->unit,
                        'image' => $item->product->image,
                        'emoji' => $item->product->emoji,
                        'category' => $item->product->category,
                    ]
                ];
            });

        // Pesanan terakhir
        $recentOrders = Order::with(['items.product'])
            ->where('user_id', $user->id)
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'created_at' => $order->created_at,
                    'status' => $order->status,
                    'total_amount' => $order->total_amount,
                    'shipping_address' => $order->shipping_address,
                    'items_count' => $order->items->count(),
                    'items' => $order->items->map(function ($item) {
                        return [
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                            'product' => [
                                'id' => $item->product->id,
                                'name' => $item->product->name,
                                'price' => $item->product->price,
                                'emoji' => $item->product->emoji,
                                'category' => $item->product->category,
                            ]
                        ];
                    }),
                ];
            });

        // Statistik dashboard
        $stats = [
            'totalProducts' => Product::count(),
            'cartItemsCount' => $cartItems->sum('quantity'),
            'cartTotalValue' => $cartItems->sum(fn($item) => $item['product']['price'] * $item['quantity']),
            'totalOrders' => Order::where('user_id', $user->id)->count(),
            'totalSpent' => Order::where('user_id', $user->id)->sum('total_amount'),
            'pendingOrders' => Order::where('user_id', $user->id)->where('status', 'pending')->count(),
        ];

        return Inertia::render('Buyer/Dashboard', [
            'popularProducts' => $popularProducts,
            'cartItems' => $cartItems,
            'recentOrders' => $recentOrders,
            'stats' => $stats,
        ]);
    }
}
