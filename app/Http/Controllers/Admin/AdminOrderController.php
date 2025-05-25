<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    // Tampilkan semua pesanan
    public function index()
    {
        $orders = Order::with('user')->orderBy('created_at', 'desc')->paginate(10);
        return view('admin.orders.index', compact('orders'));
    }

    // Tampilkan detail pesanan tertentu
    public function show($id)
    {
        $order = Order::with(['user', 'orderItems'])->findOrFail($id);
        return view('admin.orders.show', compact('order'));
    }

    // Tampilkan form untuk mengubah status
    public function edit($id)
    {
        $order = Order::findOrFail($id);
        $statuses = Order::getStatuses();
        return view('admin.orders.edit', compact('order', 'statuses'));
    }

    // Simpan perubahan status pesanan
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $request->validate([
            'status' => 'required|in:' . implode(',', array_keys(Order::getStatuses())),
        ]);

        $order->status = $request->status;
        $order->save();

        return redirect()->route('admin.orders.index')->with('success', 'Status pesanan berhasil diperbarui.');
    }

    // Hapus pesanan
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return redirect()->route('admin.orders.index')->with('success', 'Pesanan berhasil dihapus.');
    }
}
