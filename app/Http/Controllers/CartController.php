<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        $cartItems = Cart::with(['product'])
            ->where('user_id', Auth::id())
            ->get();

        $totalAmount = $cartItems->sum(function ($item) {
            return $item->quantity * $item->product->price;
        });

        return Inertia::render('Cart/Index', [
            'cartItems' => $cartItems,
            'totalAmount' => $totalAmount,
        ]);
    }

    // Tambah item ke keranjang
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        $cart = Cart::updateOrCreate(
            [
                'user_id'    => Auth::id(),
                'product_id' => $request->product_id,
            ],
            [
                'quantity' => DB::raw("quantity + {$request->quantity}")
            ]
        );

        // PERBAIKI: Redirect ke cart index dengan flash message
        return redirect()->route('cart.index')->with('message', 'Produk berhasil ditambahkan ke keranjang');
    }

    // Update kuantitas item di keranjang
    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = Cart::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $cart->update(['quantity' => $request->quantity]);

        return back()->with('message', 'Kuantitas keranjang diperbarui');
    }

    // Hapus item dari keranjang
    public function remove($id)
    {
        $cart = Cart::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $cart->delete();

        return back()->with('message', 'Item berhasil dihapus dari keranjang');
    }
}
