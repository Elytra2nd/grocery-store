<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;


class OrderController extends Controller
{
    // Membuat pesanan dari keranjang
    public function create(Request $request)
    {
        $request->validate([
            'shipping_address' => 'required|string|max:255',
        ]);

        $user = Auth::user();
        $carts = Cart::with('product')->where('user_id', $user->id)->get();

        if ($carts->isEmpty()) {
            return response()->json(['message' => 'Keranjang kosong'], 400);
        }

        DB::beginTransaction();

        try {
            // Buat order utama
            $order = Order::create([
                'user_id'         => $user->id,
                'order_number'    => Order::generateOrderNumber(),
                'shipping_address'=> $request->shipping_address,
                'status'          => Order::STATUS_PENDING,
                'total_amount'    => 0, // Sementara, akan dihitung nanti
            ]);

            $total = 0;

            // Simpan item pesanan
            foreach ($carts as $cart) {
                $subtotal = $cart->quantity * $cart->product->price;
                $total += $subtotal;

                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $cart->product_id,
                    'quantity'   => $cart->quantity,
                    'price'      => $cart->product->price,
                ]);
            }

            // Update total
            $order->update(['total_amount' => $total]);

            // Kosongkan keranjang
            Cart::where('user_id', $user->id)->delete();

            DB::commit();

            return response()->json([
                'message' => 'Pesanan berhasil dibuat',
                'order'   => $order->load('orderItems.product')
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Gagal membuat pesanan', 'error' => $e->getMessage()], 500);
        }
    }

    // Melihat detail pesanan tertentu
    public function view($id)
    {
        $order = Order::with('orderItems.product')
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return response()->json([
            'order' => $order
        ]);
    }

    // Riwayat semua pesanan user
    public function history()
    {
        $orders = Order::with('orderItems.product')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'orders' => $orders
        ]);
    }
}
