<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            // DIPERBAIKI: Load kategori dengan benar
            if ($request->has('items') && is_array($request->items)) {
                $cartItems = Cart::with(['product.category'])
                    ->where('user_id', $user->id)
                    ->whereIn('id', $request->items)
                    ->get();
            } else {
                $cartItems = Cart::with(['product.category'])
                    ->where('user_id', $user->id)
                    ->get();
            }

            if ($cartItems->isEmpty()) {
                return redirect()->route('cart.index')
                    ->with('error', 'Tidak ada item untuk di-checkout.');
            }

            // Hitung total
            $subtotal = $cartItems->sum(function ($item) {
                return $item->quantity * $item->product->price;
            });

            $shippingCost = 15000;
            $tax = $subtotal * 0.1;
            $total = $subtotal + $shippingCost + $tax;

            // DIPERBAIKI: Format data dengan kategori yang benar
            $formattedCartItems = $cartItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'price' => (float) $item->product->price,
                        'image' => $item->product->image ? asset('storage/' . $item->product->image) : null,
                        'stock' => $item->product->stock,
                        'category' => [
                            'id' => $item->product->category->id ?? null,
                            'name' => $item->product->category->name ?? 'Tidak ada kategori',
                        ],
                    ],
                    'subtotal' => $item->quantity * $item->product->price,
                ];
            });

            return Inertia::render('Buyer/Checkout/Index', [
                'cartItems' => $formattedCartItems,
                'subtotal' => (float) $subtotal,
                'shippingCost' => (float) $shippingCost,
                'tax' => (float) $tax,
                'total' => (float) $total,
                'user' => $user,
                'buyNowMode' => session('buy_now_mode', false),
                'hasSavedCart' => !empty(session('saved_cart_items', [])),
                'cartItemIds' => $cartItems->pluck('id')->toArray(),
            ]);

        } catch (\Exception $e) {
            return redirect()->route('cart.index')
                ->with('error', 'Terjadi kesalahan saat memuat halaman checkout: ' . $e->getMessage());
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'shipping_address' => 'required|string|max:500',
            'payment_method' => 'required|in:bank_transfer,cod,ewallet',
            'notes' => 'nullable|string|max:500',
            'cart_items' => 'required|array',
        ]);

        DB::beginTransaction();
        try {
            $user = Auth::user();

            // DIPERBAIKI: Cek mode buy now untuk handling cart restoration
            $buyNowMode = session('buy_now_mode', false);
            $savedCartItems = session('saved_cart_items', []);

            // Ambil cart items
            $cartItems = Cart::with('product')
                ->where('user_id', $user->id)
                ->whereIn('id', $request->cart_items)
                ->get();

            if ($cartItems->isEmpty()) {
                throw new \Exception('Cart items tidak ditemukan.');
            }

            // DIPERBAIKI: Validasi stok lagi sebelum membuat order
            foreach ($cartItems as $cartItem) {
                if ($cartItem->product->stock < $cartItem->quantity) {
                    throw new \Exception('Stok tidak mencukupi untuk produk: ' . $cartItem->product->name . '. Stok tersedia: ' . $cartItem->product->stock);
                }
            }

            // Hitung total
            $subtotal = $cartItems->sum(function ($item) {
                return $item->quantity * $item->product->price;
            });

            $shippingCost = 15000;
            $tax = $subtotal * 0.1;
            $total = $subtotal + $shippingCost + $tax;

            // Buat order
            $order = Order::create([
                'order_number' => 'ORD-' . time() . '-' . $user->id,
                'user_id' => $user->id,
                'total_amount' => $total,
                'status' => 'pending',
                'shipping_address' => $request->shipping_address,
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
                'shipping_cost' => $shippingCost,
                'tax_amount' => $tax,
            ]);

            // Buat order items
            foreach ($cartItems as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->product->price,
                ]);

                // Update stok produk
                $cartItem->product->decrement('stock', $cartItem->quantity);
            }

            // Hapus cart items yang di-checkout
            Cart::whereIn('id', $request->cart_items)->delete();

            // DIPERBAIKI: Handle cart restoration untuk buy now mode
            if ($buyNowMode && !empty($savedCartItems)) {
                // Restore cart items yang disimpan sebelumnya
                foreach ($savedCartItems as $item) {
                    // Cek apakah produk masih ada dan stok masih tersedia
                    $product = \App\Models\Product::find($item['product_id']);
                    if ($product && $product->stock >= $item['quantity']) {
                        Cart::create([
                            'user_id' => $user->id,
                            'product_id' => $item['product_id'],
                            'quantity' => $item['quantity'],
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }

                // Hapus session
                session()->forget(['saved_cart_items', 'buy_now_mode']);
            }

            DB::commit();

            // DIPERBAIKI: Pesan sukses yang berbeda untuk buy now mode
            $successMessage = 'Pesanan berhasil dibuat! Nomor pesanan: ' . $order->order_number;
            if ($buyNowMode && !empty($savedCartItems)) {
                $successMessage .= ' Keranjang lama telah dikembalikan.';
            }

            return redirect()->route('orders.show', $order->id)
                ->with('success', $successMessage);

        } catch (\Exception $e) {
            DB::rollback();
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * DITAMBAHKAN: Method untuk cancel checkout dan restore cart (jika buy now mode)
     */
    public function cancel(): RedirectResponse
    {
        try {
            $buyNowMode = session('buy_now_mode', false);
            $savedCartItems = session('saved_cart_items', []);

            if ($buyNowMode && !empty($savedCartItems)) {
                // Hapus cart saat ini (yang berisi item buy now)
                Cart::where('user_id', Auth::id())->delete();

                // Restore cart items yang disimpan sebelumnya
                foreach ($savedCartItems as $item) {
                    // Cek apakah produk masih ada dan stok masih tersedia
                    $product = \App\Models\Product::find($item['product_id']);
                    if ($product && $product->stock >= $item['quantity']) {
                        Cart::create([
                            'user_id' => Auth::id(),
                            'product_id' => $item['product_id'],
                            'quantity' => $item['quantity'],
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }

                // Hapus session
                session()->forget(['saved_cart_items', 'buy_now_mode']);

                return redirect()->route('cart.index')
                    ->with('success', 'Checkout dibatalkan. Keranjang lama telah dikembalikan.');
            }

            // Jika bukan buy now mode, langsung ke cart
            return redirect()->route('cart.index')
                ->with('info', 'Checkout dibatalkan.');

        } catch (\Exception $e) {
            \Log::error('Error canceling checkout:', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return redirect()->route('cart.index')
                ->with('error', 'Terjadi kesalahan saat membatalkan checkout: ' . $e->getMessage());
        }
    }

    /**
     * DITAMBAHKAN: Method untuk mendapatkan ringkasan checkout via AJAX
     */
    public function summary(Request $request)
    {
        try {
            $user = Auth::user();
            $cartItemIds = $request->input('items', []);

            if (empty($cartItemIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada item yang dipilih'
                ], 400);
            }

            $cartItems = Cart::with('product')
                ->where('user_id', $user->id)
                ->whereIn('id', $cartItemIds)
                ->get();

            $subtotal = $cartItems->sum(function ($item) {
                return $item->quantity * $item->product->price;
            });

            $shippingCost = 15000;
            $tax = $subtotal * 0.1;
            $total = $subtotal + $shippingCost + $tax;

            return response()->json([
                'success' => true,
                'data' => [
                    'subtotal' => $subtotal,
                    'shipping_cost' => $shippingCost,
                    'tax' => $tax,
                    'total' => $total,
                    'item_count' => $cartItems->count(),
                    'formatted' => [
                        'subtotal' => 'Rp ' . number_format($subtotal, 0, ',', '.'),
                        'shipping_cost' => 'Rp ' . number_format($shippingCost, 0, ',', '.'),
                        'tax' => 'Rp ' . number_format($tax, 0, ',', '.'),
                        'total' => 'Rp ' . number_format($total, 0, ',', '.'),
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
}
