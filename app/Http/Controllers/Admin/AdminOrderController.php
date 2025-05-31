<?php
// app/Http/Controllers/Admin/AdminOrderController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AdminOrderController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:admin']);
    }

    /**
     * Display a listing of orders
     */
    public function index(Request $request)
    {
        try {
            $query = Order::with(['user', 'orderItems.product']);

            // Filter berdasarkan status
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // Filter berdasarkan pencarian
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                      ->orWhereHas('user', function($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            // Filter berdasarkan tanggal
            if ($request->filled('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $orders = $query->orderBy('created_at', 'desc')->paginate(15);

            // Statistik pesanan
            $statistics = [
                'total_orders' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'processing_orders' => Order::where('status', 'processing')->count(),
                'shipped_orders' => Order::where('status', 'shipped')->count(),
                'delivered_orders' => Order::where('status', 'delivered')->count(),
                'cancelled_orders' => Order::where('status', 'cancelled')->count(),
                'total_revenue' => Order::where('status', 'delivered')->sum('total_amount'),
                'today_orders' => Order::whereDate('created_at', today())->count(),
                'today_revenue' => Order::whereDate('created_at', today())
                                       ->where('status', 'delivered')
                                       ->sum('total_amount'),
            ];

            return Inertia::render('Admin/Orders/Index', [
                'orders' => $orders,
                'statistics' => $statistics,
                'filters' => $request->only(['status', 'search', 'date_from', 'date_to']),
                'statuses' => $this->getOrderStatuses(),
            ]);

        } catch (\Exception $e) {
            Log::error('AdminOrderController@index error: ' . $e->getMessage());

            return Inertia::render('Admin/Orders/Index', [
                'orders' => [],
                'statistics' => [
                    'total_orders' => 0,
                    'pending_orders' => 0,
                    'processing_orders' => 0,
                    'shipped_orders' => 0,
                    'delivered_orders' => 0,
                    'cancelled_orders' => 0,
                    'total_revenue' => 0,
                    'today_orders' => 0,
                    'today_revenue' => 0,
                ],
                'filters' => [],
                'statuses' => $this->getOrderStatuses(),
                'error' => 'Terjadi kesalahan saat memuat data pesanan.'
            ]);
        }
    }

    /**
     * Show the form for creating a new order
     */
    public function create()
    {
        try {
            $products = Product::where('is_active', true)
                              ->where('stock', '>', 0)
                              ->orderBy('name')
                              ->get();

            $users = User::role('buyer')
                        ->orderBy('name')
                        ->get();

            return Inertia::render('Admin/Orders/Create', [
                'products' => $products,
                'users' => $users,
                'statuses' => $this->getOrderStatuses(),
            ]);

        } catch (\Exception $e) {
            Log::error('AdminOrderController@create error: ' . $e->getMessage());

            return Inertia::render('Admin/Orders/Create', [
                'products' => [],
                'users' => [],
                'statuses' => $this->getOrderStatuses(),
                'error' => 'Terjadi kesalahan saat memuat data.'
            ]);
        }
    }

    /**
     * Store a newly created order
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'order_items' => 'required|array|min:1',
            'order_items.*.product_id' => 'required|exists:products,id',
            'order_items.*.quantity' => 'required|integer|min:1',
            'order_items.*.price' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:500',
            'shipping_address' => 'required|string|max:500',
            'status' => 'required|in:' . implode(',', array_keys($this->getOrderStatuses())),
        ], [
            'user_id.required' => 'Pelanggan wajib dipilih',
            'user_id.exists' => 'Pelanggan tidak valid',
            'order_items.required' => 'Minimal satu produk harus ditambahkan',
            'order_items.min' => 'Minimal satu produk harus ditambahkan',
            'order_items.*.product_id.required' => 'Produk wajib dipilih',
            'order_items.*.product_id.exists' => 'Produk tidak valid',
            'order_items.*.quantity.required' => 'Jumlah produk wajib diisi',
            'order_items.*.quantity.min' => 'Jumlah produk minimal 1',
            'order_items.*.price.required' => 'Harga produk wajib diisi',
            'order_items.*.price.min' => 'Harga produk tidak boleh negatif',
            'shipping_address.required' => 'Alamat pengiriman wajib diisi',
            'status.required' => 'Status pesanan wajib dipilih',
        ]);

        try {
            DB::beginTransaction();

            // Validate stock availability
            foreach ($request->order_items as $item) {
                $product = Product::find($item['product_id']);
                if (!$product || $product->stock < $item['quantity']) {
                    return back()->withErrors([
                        'order_items' => "Stok produk {$product->name} tidak mencukupi. Stok tersedia: {$product->stock}"
                    ]);
                }
            }

            // Generate order number
            $orderNumber = 'ORD-' . date('Ymd') . '-' . str_pad(Order::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

            // Calculate total amount
            $totalAmount = collect($request->order_items)->sum(function($item) {
                return $item['quantity'] * $item['price'];
            });

            // Create order
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $request->user_id,
                'total_amount' => $totalAmount,
                'status' => $request->status,
                'notes' => $request->notes,
                'shipping_address' => $request->shipping_address,
                'created_by' => auth()->id(),
            ]);

            // Create order items
            foreach ($request->order_items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);

                // Update stock if order is processing
                if ($request->status === 'processing') {
                    $product = Product::find($item['product_id']);
                    if ($product && $product->stock >= $item['quantity']) {
                        $product->decrement('stock', $item['quantity']);
                    }
                }
            }

            $adminName = Auth::check() && Auth::user() ? Auth::user()->name : 'Unknown Admin';
            $adminName = auth()->check() && auth()->user() ? auth()->user()->name : 'Unknown Admin';
            $this->logOrderAction($order, 'created', "Order created by admin: " . $adminName);

            DB::commit();

            return redirect()->route('admin.orders.index')
                ->with('success', "Pesanan #{$order->order_number} berhasil dibuat");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('AdminOrderController@store error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal membuat pesanan: ' . $e->getMessage()]);
        }
    }

    /**
     * Display orders by status
     */
    public function pending()
    {
        return $this->getOrdersByStatus('pending', 'Admin/Orders/Pending');
    }

    public function processing()
    {
        return $this->getOrdersByStatus('processing', 'Admin/Orders/Processing');
    }

    public function shipped()
    {
        return $this->getOrdersByStatus('shipped', 'Admin/Orders/Shipped');
    }

    public function completed()
    {
        return $this->getOrdersByStatus('delivered', 'Admin/Orders/Completed');
    }

    /**
     * Helper method to get orders by status
     */
    private function getOrdersByStatus(string $status, string $view)
    {
        try {
            $orders = Order::with(['user', 'orderItems.product'])
                          ->where('status', $status)
                          ->orderBy('created_at', 'desc')
                          ->paginate(15);

            $statistics = [
                'count' => $orders->total(),
                'total_amount' => Order::where('status', $status)->sum('total_amount'),
                'today_count' => Order::where('status', $status)
                                     ->whereDate('created_at', today())
                                     ->count(),
                'average_amount' => Order::where('status', $status)->avg('total_amount'),
            ];

            return Inertia::render($view, [
                'orders' => $orders,
                'statistics' => $statistics,
                'statuses' => $this->getOrderStatuses(),
            ]);

        } catch (\Exception $e) {
            Log::error("AdminOrderController@{$status} error: " . $e->getMessage());

            return Inertia::render($view, [
                'orders' => [],
                'statistics' => [
                    'count' => 0,
                    'total_amount' => 0,
                    'today_count' => 0,
                    'average_amount' => 0
                ],
                'statuses' => $this->getOrderStatuses(),
                'error' => 'Terjadi kesalahan saat memuat data pesanan.'
            ]);
        }
    }

    /**
     * Display the specified order
     */
    public function show(Order $order)
    {
        $order->load(['user', 'orderItems.product.category']);

        return Inertia::render('Admin/Orders/Show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'user' => [
                    'id' => $order->user->id,
                    'name' => $order->user->name,
                    'email' => $order->user->email,
                ],
                'total_amount' => (float) $order->total_amount,
                'status' => $order->status,
                'shipping_address' => $order->shipping_address,
                'payment_method' => $order->payment_method ?? 'transfer',
                'notes' => $order->notes,
                'shipping_cost' => (float) ($order->shipping_cost ?? 0),
                'tax_amount' => (float) ($order->tax_amount ?? 0),
                'created_at' => $order->created_at->toISOString(),
                'updated_at' => $order->updated_at->toISOString(),
                'order_items' => $order->orderItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'quantity' => (int) $item->quantity,
                        'price' => (float) $item->price,
                        'subtotal' => $item->quantity * $item->price,
                        'product' => [
                            'id' => $item->product->id,
                            'name' => $item->product->name,
                            'description' => $item->product->description,
                            'image' => $item->product->image ? asset('storage/' . $item->product->image) : null,
                            'category' => $item->product->category->name ?? 'Uncategorized',
                        ],
                    ];
                }),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified order
     */
    public function edit(Order $order)
    {
        try {
            $order->load(['user', 'orderItems.product']);

            $products = Product::where('is_active', true)
                              ->orderBy('name')
                              ->get();

            $users = User::role('buyer')
                        ->orderBy('name')
                        ->get();

            return Inertia::render('Admin/Orders/Edit', [
                'order' => $order,
                'products' => $products,
                'users' => $users,
                'statuses' => $this->getOrderStatuses(),
            ]);

        } catch (\Exception $e) {
            Log::error('AdminOrderController@edit error: ' . $e->getMessage());
            return redirect()->route('admin.orders.index')
                ->with('error', 'Pesanan tidak ditemukan.');
        }
    }

    /**
     * Update the specified order
     */
    public function update(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', array_keys($this->getOrderStatuses())),
            'notes' => 'nullable|string|max:500',
            'shipping_address' => 'nullable|string|max:500',
            'tracking_number' => 'nullable|string|max:100',
            'shipping_cost' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
        ], [
            'status.required' => 'Status pesanan wajib dipilih',
            'status.in' => 'Status pesanan tidak valid',
            'notes.max' => 'Catatan maksimal 500 karakter',
            'shipping_address.max' => 'Alamat pengiriman maksimal 500 karakter',
            'tracking_number.max' => 'Nomor resi maksimal 100 karakter',
            'shipping_cost.min' => 'Biaya pengiriman tidak boleh negatif',
            'discount_amount.min' => 'Jumlah diskon tidak boleh negatif',
            'tax_amount.min' => 'Jumlah pajak tidak boleh negatif',
        ]);

        try {
            DB::beginTransaction();

            $oldStatus = $order->status;

            $order->update([
                'status' => $request->status,
                'notes' => $request->notes,
                'shipping_address' => $request->shipping_address,
                'tracking_number' => $request->tracking_number,
                'shipping_cost' => $request->shipping_cost ?? 0,
                'discount_amount' => $request->discount_amount ?? 0,
                'tax_amount' => $request->tax_amount ?? 0,
                'updated_at' => now(),
            ]);

            // Recalculate total amount
            $subtotal = $order->orderItems->sum(function($item) {
                return $item->quantity * $item->price;
            });

            $total = $subtotal + ($request->shipping_cost ?? 0) + ($request->tax_amount ?? 0) - ($request->discount_amount ?? 0);
            $order->update(['total_amount' => $total]);

            // Log status change
            $this->logStatusChange($order, $oldStatus, $request->status, $request->notes);

            // Handle status-specific actions
            $this->handleStatusChange($order, $oldStatus, $request->status);

            DB::commit();

            return redirect()->route('admin.orders.index')
                ->with('success', "Status pesanan #{$order->order_number} berhasil diperbarui menjadi " . $this->getOrderStatuses()[$request->status]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('AdminOrderController@update error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal memperbarui pesanan: ' . $e->getMessage()]);
        }
    }

    /**
     * Update order status via AJAX
     */
    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,packed,shipped,delivered,cancelled'
        ]);

        $oldStatus = $order->status;
        $newStatus = $request->status;

        $order->update([
            'status' => $newStatus
        ]);

        return back()->with('success', "Status pesanan berhasil diperbarui dari '{$oldStatus}' ke '{$newStatus}'");

    }

    /**
     * Handle bulk actions for multiple orders
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:update_status,delete,export',
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'exists:orders,id',
            'status' => 'required_if:action,update_status|in:' . implode(',', array_keys($this->getOrderStatuses())),
        ], [
            'action.required' => 'Aksi wajib dipilih',
            'action.in' => 'Aksi tidak valid',
            'order_ids.required' => 'Pilih minimal satu pesanan',
            'order_ids.min' => 'Pilih minimal satu pesanan',
            'status.required_if' => 'Status wajib dipilih untuk update status',
        ]);

        try {
            $orders = Order::whereIn('id', $request->order_ids);
            $affectedCount = $orders->count();

            switch ($request->action) {
                case 'update_status':
                    DB::beginTransaction();

                    foreach ($orders->get() as $order) {
                        $oldStatus = $order->status;
                        $order->update(['status' => $request->status]);
                        $this->logStatusChange($order, $oldStatus, $request->status, 'Bulk update by admin');
                        $this->handleStatusChange($order, $oldStatus, $request->status);
                    }

                    DB::commit();
                    $message = "{$affectedCount} pesanan berhasil diperbarui statusnya ke " . $this->getOrderStatuses()[$request->status];
                    break;

                case 'delete':
                    // Only allow deletion of cancelled orders
                    $deletableOrders = $orders->where('status', 'cancelled');
                    $deletableCount = $deletableOrders->count();

                    if ($deletableCount === 0) {
                        return back()->withErrors(['bulk_delete' => 'Hanya pesanan yang dibatalkan yang dapat dihapus']);
                    }

                    $deletableOrders->delete();
                    $message = "{$deletableCount} pesanan berhasil dihapus";
                    break;

                case 'export':
                    return $this->exportOrders($request->order_ids);
            }

            return back()->with('success', $message);

        } catch (\Exception $e) {
            if (isset($request->action) && $request->action === 'update_status') {
                DB::rollBack();
            }

            Log::error('AdminOrderController@bulkAction error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal melakukan aksi: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified order
     */
    public function destroy(Order $order)
    {
        try {
            // Only allow deletion of cancelled orders
            if ($order->status !== 'cancelled') {
                return back()->withErrors(['delete' => 'Hanya pesanan yang dibatalkan yang dapat dihapus']);
            }

            $orderNumber = $order->order_number;

            // Log deletion
            $adminName = auth()->check() && auth()->user() ? auth()->user()->name : 'Unknown Admin';
            $this->logOrderAction($order, 'deleted', "Order deleted by admin: " . $adminName);

            $order->delete();

            return redirect()->route('admin.orders.index')
                ->with('success', "Pesanan #{$orderNumber} berhasil dihapus");

        } catch (\Exception $e) {
            Log::error('AdminOrderController@destroy error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menghapus pesanan: ' . $e->getMessage()]);
        }
    }

    /**
     * Export orders to CSV
     */
    public function export(Request $request)
    {
        try {
            $orderIds = $request->input('order_ids', []);
            return $this->exportOrders($orderIds);

        } catch (\Exception $e) {
            Log::error('AdminOrderController@export error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal mengekspor data: ' . $e->getMessage()]);
        }
    }

    /**
     * Helper method to export orders
     */
    private function exportOrders(array $orderIds = [])
    {
        $query = Order::with(['user', 'orderItems.product']);

        if (!empty($orderIds)) {
            $query->whereIn('id', $orderIds);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        $filename = 'orders_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($orders) {
            $file = fopen('php://output', 'w');

            // Add BOM for UTF-8
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header
            fputcsv($file, [
                'Order Number', 'Customer Name', 'Customer Email', 'Status',
                'Total Amount', 'Items Count', 'Order Date', 'Shipping Address', 'Notes'
            ]);

            // Data
            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->order_number,
                    $order->user->name ?? 'N/A',
                    $order->user->email ?? 'N/A',
                    $this->getOrderStatuses()[$order->status] ?? $order->status,
                    $order->total_amount,
                    $order->orderItems->count(),
                    $order->created_at->format('Y-m-d H:i:s'),
                    $order->shipping_address ?? '',
                    $order->notes ?? '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get order statistics for dashboard
     */
    public function statistics()
    {
        try {
            $today = now()->startOfDay();
            $thisMonth = now()->startOfMonth();
            $thisWeek = now()->startOfWeek();

            $stats = [
                'today_orders' => Order::whereDate('created_at', $today)->count(),
                'today_revenue' => Order::whereDate('created_at', $today)
                                       ->where('status', 'delivered')
                                       ->sum('total_amount'),
                'week_orders' => Order::whereDate('created_at', '>=', $thisWeek)->count(),
                'week_revenue' => Order::whereDate('created_at', '>=', $thisWeek)
                                      ->where('status', 'delivered')
                                      ->sum('total_amount'),
                'month_orders' => Order::whereDate('created_at', '>=', $thisMonth)->count(),
                'month_revenue' => Order::whereDate('created_at', '>=', $thisMonth)
                                       ->where('status', 'delivered')
                                       ->sum('total_amount'),
                'pending_count' => Order::where('status', 'pending')->count(),
                'processing_count' => Order::where('status', 'processing')->count(),
                'shipped_count' => Order::where('status', 'shipped')->count(),
                'average_order_value' => Order::where('status', 'delivered')->avg('total_amount'),
                'top_customers' => $this->getTopCustomers(),
                'recent_orders' => Order::with('user')->latest()->take(5)->get(),
            ];

            return response()->json($stats);

        } catch (\Exception $e) {
            Log::error('AdminOrderController@statistics error: ' . $e->getMessage());
            return response()->json([], 500);
        }
    }

    /**
     * Get order statuses
     */
    private function getOrderStatuses(): array
    {
        return [
            'pending' => 'Menunggu Konfirmasi',
            'processing' => 'Sedang Diproses',
            'shipped' => 'Dikirim',
            'delivered' => 'Selesai',
            'cancelled' => 'Dibatalkan',
        ];
    }

    /**
     * Log status change
     */
    private function logStatusChange(Order $order, string $oldStatus, string $newStatus, ?string $notes = null)
    {
        Log::info("Order #{$order->order_number} status changed from {$oldStatus} to {$newStatus}", [
            'order_id' => $order->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'notes' => $notes,
            'changed_by' => auth()->id(),
            'changed_at' => now(),
        ]);
    }

    /**
     * Log order action
     */
    private function logOrderAction(Order $order, string $action, string $description)
    {
        Log::info("Order #{$order->order_number} {$action}", [
            'order_id' => $order->id,
            'action' => $action,
            'description' => $description,
            'performed_by' => auth()->id(),
            'performed_at' => now(),
        ]);
    }

    /**
     * Handle status-specific actions
     */
    private function handleStatusChange(Order $order, string $oldStatus, string $newStatus)
    {
        switch ($newStatus) {
            case 'processing':
                // Update product stock when order is being processed
                if ($oldStatus !== 'processing') {
                    foreach ($order->orderItems as $item) {
                        $product = $item->product;
                        if ($product && $product->stock >= $item->quantity) {
                            $product->decrement('stock', $item->quantity);
                        }
                    }
                }
                break;

            case 'cancelled':
                // Restore product stock when order is cancelled
                if ($oldStatus === 'processing') {
                    foreach ($order->orderItems as $item) {
                        $product = $item->product;
                        if ($product) {
                            $product->increment('stock', $item->quantity);
                        }
                    }
                }
                break;

            case 'shipped':
                // Set shipped date
                $order->update(['shipped_at' => now()]);
                break;

            case 'delivered':
                // Set delivered date
                $order->update(['delivered_at' => now()]);
                break;
        }
    }

    /**
     * Get order history
     */
    private function getOrderHistory(Order $order)
    {
        // This would typically come from a dedicated order_logs table
        // For now, we'll return a simple array
        return [
            [
                'action' => 'created',
                'description' => 'Pesanan dibuat',
                'created_at' => $order->created_at,
                'user' => 'Admin',
            ],
            // Add more history items as needed
        ];
    }

    /**
     * Get top customers
     */
    private function getTopCustomers()
    {
        return User::select('users.*')
                   ->selectRaw('COUNT(orders.id) as orders_count')
                   ->selectRaw('SUM(orders.total_amount) as total_spent')
                   ->join('orders', 'users.id', '=', 'orders.user_id')
                   ->where('orders.status', 'delivered')
                   ->groupBy('users.id')
                   ->orderByDesc('total_spent')
                   ->take(5)
                   ->get();
    }
}
