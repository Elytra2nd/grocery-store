<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminOrderController extends Controller
{
    // Tampilkan semua pesanan
    public function index(Request $request)
    {
        $query = Order::with(['user', 'orderItems.product']);

        // Filter berdasarkan status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan pencarian
        if ($request->has('search') && $request->search !== '') {
            $query->where(function($q) use ($request) {
                $q->where('order_number', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', function($userQuery) use ($request) {
                      $userQuery->where('name', 'like', '%' . $request->search . '%')
                               ->orWhere('email', 'like', '%' . $request->search . '%');
                  });
            });
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(15);

        // Statistik pesanan
        $statistics = [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'processing_orders' => Order::where('status', 'processing')->count(),
            'completed_orders' => Order::where('status', 'delivered')->count(),
            'total_revenue' => Order::where('status', 'delivered')->sum('total_amount'),
        ];

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'statistics' => $statistics,
            'filters' => $request->only(['status', 'search']),
            'statuses' => $this->getOrderStatuses(),
        ]);
    }

    // Tampilkan pesanan berdasarkan status
    public function pending()
    {
        $orders = Order::with(['user', 'orderItems.product'])
                      ->where('status', 'pending')
                      ->orderBy('created_at', 'desc')
                      ->paginate(15);

        return Inertia::render('Admin/Orders/Pending', [
            'orders' => $orders,
            'statuses' => $this->getOrderStatuses(),
        ]);
    }

    public function processing()
    {
        $orders = Order::with(['user', 'orderItems.product'])
                      ->where('status', 'processing')
                      ->orderBy('created_at', 'desc')
                      ->paginate(15);

        return Inertia::render('Admin/Orders/Processing', [
            'orders' => $orders,
            'statuses' => $this->getOrderStatuses(),
        ]);
    }

    public function shipped()
    {
        $orders = Order::with(['user', 'orderItems.product'])
                      ->where('status', 'shipped')
                      ->orderBy('created_at', 'desc')
                      ->paginate(15);

        return Inertia::render('Admin/Orders/Shipped', [
            'orders' => $orders,
            'statuses' => $this->getOrderStatuses(),
        ]);
    }

    public function completed()
    {
        $orders = Order::with(['user', 'orderItems.product'])
                      ->where('status', 'delivered')
                      ->orderBy('created_at', 'desc')
                      ->paginate(15);

        return Inertia::render('Admin/Orders/Completed', [
            'orders' => $orders,
            'statuses' => $this->getOrderStatuses(),
        ]);
    }

    // Tampilkan detail pesanan tertentu
    public function show($id)
    {
        $order = Order::with(['user', 'orderItems.product'])->findOrFail($id);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'statuses' => $this->getOrderStatuses(),
        ]);
    }

    // Tampilkan form untuk mengubah status
    public function edit($id)
    {
        $order = Order::with(['user', 'orderItems.product'])->findOrFail($id);

        return Inertia::render('Admin/Orders/Edit', [
            'order' => $order,
            'statuses' => $this->getOrderStatuses(),
        ]);
    }

    // Simpan perubahan status pesanan
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $request->validate([
            'status' => 'required|in:' . implode(',', array_keys($this->getOrderStatuses())),
            'notes' => 'nullable|string|max:500',
        ]);

        $oldStatus = $order->status;
        $order->status = $request->status;
        
        if ($request->has('notes')) {
            $order->notes = $request->notes;
        }

        $order->save();

        // Log status change (optional)
        // OrderStatusLog::create([
        //     'order_id' => $order->id,
        //     'old_status' => $oldStatus,
        //     'new_status' => $request->status,
        //     'changed_by' => auth()->id(),
        //     'notes' => $request->notes,
        // ]);

        return redirect()->route('admin.orders.index')
                        ->with('success', 'Status pesanan berhasil diperbarui.');
    }

    // Update status via AJAX
    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $request->validate([
            'status' => 'required|in:' . implode(',', array_keys($this->getOrderStatuses())),
        ]);

        $order->status = $request->status;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui.',
            'order' => $order->load(['user', 'orderItems.product']),
        ]);
    }

    // Bulk action untuk multiple orders
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:update_status,delete',
            'order_ids' => 'required|array',
            'order_ids.*' => 'exists:orders,id',
            'status' => 'required_if:action,update_status|in:' . implode(',', array_keys($this->getOrderStatuses())),
        ]);

        $orders = Order::whereIn('id', $request->order_ids);

        switch ($request->action) {
            case 'update_status':
                $orders->update(['status' => $request->status]);
                $message = 'Status pesanan berhasil diperbarui.';
                break;
            
            case 'delete':
                $orders->delete();
                $message = 'Pesanan berhasil dihapus.';
                break;
        }

        return redirect()->route('admin.orders.index')
                        ->with('success', $message);
    }

    // Hapus pesanan
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        
        // Hapus order items terlebih dahulu
        $order->orderItems()->delete();
        
        // Hapus order
        $order->delete();

        return redirect()->route('admin.orders.index')
                        ->with('success', 'Pesanan berhasil dihapus.');
    }

    // Export orders to CSV/Excel
    public function export(Request $request)
    {
        $query = Order::with(['user', 'orderItems.product']);

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from') && $request->date_from !== '') {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to !== '') {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        // Return CSV download
        $filename = 'orders_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($orders) {
            $file = fopen('php://output', 'w');
            
            // CSV Headers
            fputcsv($file, [
                'Order Number',
                'Customer Name',
                'Customer Email',
                'Total Amount',
                'Status',
                'Created At',
                'Items Count'
            ]);

            // CSV Data
            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->order_number,
                    $order->user->name,
                    $order->user->email,
                    $order->total_amount,
                    $order->status,
                    $order->created_at->format('Y-m-d H:i:s'),
                    $order->orderItems->count()
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    // Helper method untuk mendapatkan status pesanan
    private function getOrderStatuses()
    {
        return [
            'pending' => 'Menunggu Konfirmasi',
            'processing' => 'Sedang Diproses',
            'shipped' => 'Dikirim',
            'delivered' => 'Selesai',
            'cancelled' => 'Dibatalkan',
        ];
    }

    // Dashboard statistics
    public function statistics()
    {
        $today = now()->startOfDay();
        $thisMonth = now()->startOfMonth();

        $stats = [
            'today_orders' => Order::whereDate('created_at', $today)->count(),
            'today_revenue' => Order::whereDate('created_at', $today)
                                   ->where('status', 'delivered')
                                   ->sum('total_amount'),
            'month_orders' => Order::whereDate('created_at', '>=', $thisMonth)->count(),
            'month_revenue' => Order::whereDate('created_at', '>=', $thisMonth)
                                   ->where('status', 'delivered')
                                   ->sum('total_amount'),
            'pending_count' => Order::where('status', 'pending')->count(),
            'processing_count' => Order::where('status', 'processing')->count(),
        ];

        return response()->json($stats);
    }
}
