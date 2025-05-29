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

            // Ambil item yang akan di-checkout
            if ($request->has('items') && is_array($request->items)) {
                // Checkout item yang dipilih
                $cartItems = Cart::with('product.category')
                    ->where('user_id', $user->id)
                    ->whereIn('id', $request->items)
                    ->get();
            } else {
                // Checkout semua item
                $cartItems = Cart::with('product.category')
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

            $shippingCost = 15000; // Flat rate shipping
            $tax = $subtotal * 0.1; // 10% tax
            $total = $subtotal + $shippingCost + $tax;

            return Inertia::render('Buyer/Checkout/Index', [
                'cartItems' => $cartItems,
                'subtotal' => $subtotal,
                'shippingCost' => $shippingCost,
                'tax' => $tax,
                'total' => $total,
                'user' => $user,
            ]);

        } catch (\Exception $e) {
            return redirect()->route('cart.index')
                ->with('error', 'Terjadi kesalahan saat memuat halaman checkout.');
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

            // Ambil cart items
            $cartItems = Cart::with('product')
                ->where('user_id', $user->id)
                ->whereIn('id', $request->cart_items)
                ->get();

            if ($cartItems->isEmpty()) {
                throw new \Exception('Cart items tidak ditemukan.');
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

            // Hapus cart items
            Cart::whereIn('id', $request->cart_items)->delete();

            DB::commit();

            return redirect()->route('orders.show', $order->id)
                ->with('success', 'Pesanan berhasil dibuat! Nomor pesanan: ' . $order->order_number);

        } catch (\Exception $e) {
            DB::rollback();
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
