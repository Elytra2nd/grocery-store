<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        // DIPERBAIKI: Query dengan path gambar yang benar
        $popularProducts = Product::select([
                'id', 'name', 'price', 'image', 'category_id'
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
                    'unit' => 'pcs',
                    // DIPERBAIKI: Format path gambar yang benar dengan null check
                    'image' => $product->image ? $this->getImageUrl($product->image) : null,
                    'emoji' => '🛒',
                    'sold_count' => (int) $product->sold_count,
                    'category' => $product->category->name ?? 'Umum',
                ];
            });

        // DIPERBAIKI: Cart items dengan path gambar yang benar
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
                        'unit' => 'pcs',
                        // DIPERBAIKI: Format path gambar yang benar
                        'image' => $cartItem->product->image ? $this->getImageUrl($cartItem->product->image) : null,
                        'emoji' => '🛒',
                        'category' => $cartItem->product->category->name ?? 'Umum',
                    ],
                ];
            });

        // DIPERBAIKI: Recent orders dengan error handling yang lebih baik
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
                    'order_number' => $order->order_number ?? 'ORD-' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                    'created_at' => $order->created_at->toISOString(),
                    'status' => $order->status ?? 'pending',
                    'total_amount' => (float) ($order->total_amount ?? 0),
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
                                'emoji' => '🛒',
                                'category' => $orderItem->product->category->name ?? 'Umum',
                            ],
                        ];
                    })->toArray(),
                ];
            });

        // DIPERBAIKI: Statistics dengan error handling
        $totalProducts = Product::where('is_active', true)->count();
        $cartItemsCount = Cart::where('user_id', $user->id)->sum('quantity') ?? 0;

        // DIPERBAIKI: Cart total value dengan null check
        $cartTotalValue = Cart::where('user_id', $user->id)
            ->with('product')
            ->get()
            ->sum(function ($cartItem) {
                return $cartItem->quantity * ($cartItem->product->price ?? 0);
            });

        $totalOrders = Order::where('user_id', $user->id)->count();

        $totalSpent = Order::where('user_id', $user->id)
            ->where('status', 'delivered')
            ->sum('total_amount') ?? 0;

        $pendingOrders = Order::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'processing', 'packed', 'shipped'])
            ->count();

        $stats = [
            'totalProducts' => (int) $totalProducts,
            'cartItemsCount' => (int) $cartItemsCount,
            'cartTotalValue' => (float) $cartTotalValue,
            'totalOrders' => (int) $totalOrders,
            'totalSpent' => (float) $totalSpent,
            'pendingOrders' => (int) $pendingOrders,
        ];

        return Inertia::render('Buyer/Dashboard', [
            'popularProducts' => $popularProducts,
            'cartItems' => $cartItems,
            'recentOrders' => $recentOrders,
            'stats' => $stats,
        ]);
    }

    /**
     * DITAMBAHKAN: Helper method untuk format URL gambar
     */
    private function getImageUrl($imagePath)
    {
        if (!$imagePath) {
            return null;
        }

        // Jika path sudah berupa URL lengkap, return as is
        if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
            return $imagePath;
        }

        // Jika path dimulai dengan 'storage/', hapus prefix tersebut
        if (str_starts_with($imagePath, 'storage/')) {
            $imagePath = substr($imagePath, 8);
        }

        // Jika path dimulai dengan 'public/', hapus prefix tersebut
        if (str_starts_with($imagePath, 'public/')) {
            $imagePath = substr($imagePath, 7);
        }

        // Cek apakah file ada di storage
        if (Storage::disk('public')->exists($imagePath)) {
            return asset('storage/' . $imagePath);
        }

        // Jika tidak ada di storage, coba di public folder
        $publicPath = public_path($imagePath);
        if (file_exists($publicPath)) {
            return asset($imagePath);
        }

        // Jika file tidak ditemukan, return null
        return null;
    }

}
