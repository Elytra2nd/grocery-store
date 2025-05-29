<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    // Daftar pesanan user
    public function index()
    {
        $orders = Order::where('user_id', Auth::id())
            ->with(['orderItems.product'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Orders/Index', [
            'orders' => $orders
        ]);
    }

    // Checkout dari keranjang
    public function create(Request $request)
    {
        $request->validate([
            'shipping_address' => 'required|string|max:255',
        ]);

        $user = Auth::user();
        $carts = Cart::with('product')->where('user_id', $user->id)->get();

        if ($carts->isEmpty()) {
            return redirect()->back()->with('error', 'Keranjang kosong');
        }

        DB::beginTransaction();

        try {
            $order = Order::create([
                'user_id'         => $user->id,
                'order_number'    => Order::generateOrderNumber(),
                'shipping_address'=> $request->shipping_address,
                'status'          => Order::STATUS_PENDING,
                'total_amount'    => 0,
            ]);

            $total = 0;

            foreach ($carts as $cart) {
                // Validasi produk aktif
                if (!$cart->product->is_active) {
                    DB::rollBack();
                    return redirect()->back()->with('error', 'Ada produk yang sudah tidak aktif di keranjang Anda.');
                }
                // Validasi stok
                if ($cart->quantity > $cart->product->stock) {
                    DB::rollBack();
                    return redirect()->back()->with('error', "Stok produk {$cart->product->name} tidak mencukupi.");
                }

                $subtotal = $cart->quantity * $cart->product->price;
                $total += $subtotal;

                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $cart->product_id,
                    'quantity'   => $cart->quantity,
                    'price'      => $cart->product->price,
                ]);

                // Kurangi stok produk
                $cart->product->decrement('stock', $cart->quantity);
            }

            $order->update(['total_amount' => $total]);
            Cart::where('user_id', $user->id)->delete();

            DB::commit();

            return redirect()->route('orders.show', $order->id)->with('message', 'Pesanan berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal membuat pesanan: ' . $e->getMessage());
        }
    }

    // Buy Now (beli langsung satu produk)
    public function buyNow(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string|max:255',
        ]);

        $user = Auth::user();
        $product = Product::findOrFail($request->product_id);

        if (!$product->is_active) {
            return redirect()->back()->with('error', 'Produk tidak aktif.');
        }

        if ($request->quantity > $product->stock) {
            return redirect()->back()->with('error', 'Stok produk tidak mencukupi.');
        }

        DB::beginTransaction();

        try {
            $order = Order::create([
                'user_id'          => $user->id,
                'order_number'     => Order::generateOrderNumber(),
                'shipping_address' => $request->shipping_address,
                'status'           => Order::STATUS_PENDING,
                'total_amount'     => $product->price * $request->quantity,
            ]);

            OrderItem::create([
                'order_id'   => $order->id,
                'product_id' => $product->id,
                'quantity'   => $request->quantity,
                'price'      => $product->price,
            ]);

            // Kurangi stok produk
            $product->decrement('stock', $request->quantity);

            DB::commit();

            return redirect()->route('orders.show', $order->id)->with('message', 'Pembelian berhasil!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal melakukan pembelian: ' . $e->getMessage());
        }
    }

    // Detail pesanan
    public function show($id)
    {
        $order = Order::with('orderItems.product')
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return Inertia::render('Orders/Show', [
            'order' => $order
        ]);
    }

    // (Opsional) Riwayat semua pesanan user dalam bentuk JSON
    public function history()
    {
        $orders = Order::with('orderItems.product')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

    }

    // Batalkan pesanan
    public function cancel($id)
    {
        $order = Order::where('user_id', Auth::id())->findOrFail($id);
        if ($order->status !== Order::STATUS_PENDING) {
            return redirect()->back()->with('error', 'Pesanan tidak bisa dibatalkan.');
        }
        $order->update(['status' => Order::STATUS_CANCELLED]);
        return redirect()->route('orders.show', $order->id)->with('message', 'Pesanan berhasil dibatalkan.');
    }
}
