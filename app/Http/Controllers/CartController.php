<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
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

    /**
     * DITAMBAHKAN: Fungsi Buy Now - langsung ke checkout
     */
    public function buyNow(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'integer|min:1|max:100'
        ]);

        $product = Product::findOrFail($request->product_id);
        $quantity = $request->quantity ?? 1;

        // Cek stok tersedia
        if ($product->stock < $quantity) {
            return back()->with('error', 'Stok tidak mencukupi. Stok tersedia: ' . $product->stock);
        }

        // PERBAIKAN: Simpan cart lama ke session untuk dikembalikan nanti
        $existingCartItems = Cart::where('user_id', Auth::id())->get();
        session(['saved_cart_items' => $existingCartItems->toArray()]);

        // Hapus semua item dari cart sementara
        Cart::where('user_id', Auth::id())->delete();

        // Tambahkan hanya produk yang akan dibeli sekarang
        Cart::create([
            'user_id' => Auth::id(),
            'product_id' => $product->id,
            'quantity' => $quantity,
        ]);

        // Redirect ke checkout dengan flag buy_now
        return redirect()->route('buyer.checkout.index')
            ->with('buy_now_mode', true)
            ->with('success', 'Produk siap untuk checkout. Item keranjang lama akan dikembalikan setelah checkout.');
    }

    public function restoreCart(): RedirectResponse
    {
        $savedCartItems = session('saved_cart_items', []);

        if (!empty($savedCartItems)) {
            // Hapus cart saat ini
            Cart::where('user_id', Auth::id())->delete();

            // Restore cart items yang disimpan
            foreach ($savedCartItems as $item) {
                Cart::create([
                    'user_id' => Auth::id(),
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Hapus session
            session()->forget('saved_cart_items');

            return redirect()->route('cart.index')
                ->with('success', 'Keranjang berhasil dikembalikan');
        }

        return redirect()->route('cart.index')
            ->with('info', 'Tidak ada keranjang yang perlu dikembalikan');
    }

    public function destroy($id): RedirectResponse
    {
        // Cari cart item berdasarkan ID dan user yang sedang login
        $cartItem = Cart::where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        // Jika item tidak ditemukan
        if (!$cartItem) {
            return back()->with('error', 'Item tidak ditemukan di keranjang Anda');
        }

        // Ambil nama produk untuk pesan konfirmasi
        $productName = $cartItem->product->name ?? 'Produk';

        // Hapus item dari keranjang
        $cartItem->delete();

        // Redirect kembali dengan pesan sukses
        return back()->with('sukses', $productName . ' berhasil dihapus dari keranjang');
    }

}
