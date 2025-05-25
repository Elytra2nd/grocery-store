<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;


class CartController extends Controller
{
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

        return response()->json([
            'message' => 'Produk berhasil ditambahkan ke keranjang',
            'data'    => $cart
        ]);
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

        return response()->json([
            'message' => 'Kuantitas keranjang diperbarui',
            'data'    => $cart
        ]);
    }

    // Hapus item dari keranjang
    public function delete($id)
    {
        $cart = Cart::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $cart->delete();

        return response()->json([
            'message' => 'Item berhasil dihapus dari keranjang'
        ]);
    }
}
