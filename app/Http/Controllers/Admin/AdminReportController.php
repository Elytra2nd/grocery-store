<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Order, Product, User, OrderItem};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Log};
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

// Tambahkan FastExcel untuk ekspor
use Rap2hpoutre\FastExcel\FastExcel;

// Import export classes jika diperlukan
use App\Exports\{
    SalesReportExport,
    ProductsReportExport,
    CustomersReportExport
};

class AdminReportController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'role:admin']);
    }

    /**
     * Dashboard laporan ringkas
     */
    public function index(): Response
    {
        try {
            $currentMonth = Carbon::now();

            // Statistik ringkas
            $stats = [
                'total_sales' => Order::where('status', 'delivered')->sum('total_amount'),
                'monthly_sales' => Order::where('status', 'delivered')
                    ->whereMonth('created_at', $currentMonth->month)
                    ->whereYear('created_at', $currentMonth->year)
                    ->sum('total_amount'),
                'total_orders' => Order::count(),
                'monthly_orders' => Order::whereMonth('created_at', $currentMonth->month)
                    ->whereYear('created_at', $currentMonth->year)
                    ->count(),
                'total_customers' => User::role('buyer')->count(),
                'active_products' => Product::where('is_active', true)->count(),
            ];

            // Trend penjualan 12 bulan terakhir
            $salesTrend = [];
            for ($i = 11; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $salesTrend[] = [
                    'month' => $date->format('M Y'),
                    'sales' => Order::where('status', 'delivered')
                        ->whereMonth('created_at', $date->month)
                        ->whereYear('created_at', $date->year)
                        ->sum('total_amount'),
                    'orders' => Order::whereMonth('created_at', $date->month)
                        ->whereYear('created_at', $date->year)
                        ->count(),
                ];
            }

            // Produk terlaris
            $topProducts = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_sold'), DB::raw('SUM(quantity * price) as total_revenue'))
                ->with('product')
                ->groupBy('product_id')
                ->orderBy('total_sold', 'desc')
                ->limit(10)
                ->get();

            return Inertia::render('Admin/Reports/Index', [
                'statistics' => $stats,
                'salesTrend' => $salesTrend,
                'topProducts' => $topProducts,
            ]);

        } catch (\Exception $e) {
            Log::error('AdminReportController@index error: ' . $e->getMessage());

            return Inertia::render('Admin/Reports/Index', [
                'statistics' => [
                    'total_sales' => 0,
                    'monthly_sales' => 0,
                    'total_orders' => 0,
                    'monthly_orders' => 0,
                    'total_customers' => 0,
                    'active_products' => 0,
                ],
                'salesTrend' => [],
                'topProducts' => [],
                'error' => 'Terjadi kesalahan saat memuat laporan.'
            ]);
        }
    }

    /**
     * Laporan penjualan
     */
    public function sales(Request $request): Response
    {
        try {
            $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
            $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->toDateString());
            $status = $request->get('status', 'all');

            $query = Order::with(['user', 'orderItems.product'])
                ->whereBetween('created_at', [$startDate, $endDate]);

            if ($status !== 'all') {
                $query->where('status', $status);
            }

            $orders = $query->orderBy('created_at', 'desc')->paginate(20);

            // Sales summary
            $summary = [
                'total_orders' => $query->count(),
                'total_revenue' => $query->sum('total_amount'),
                'average_order_value' => $query->avg('total_amount'),
                'completed_orders' => $query->where('status', 'delivered')->count(),
                'pending_orders' => $query->where('status', 'pending')->count(),
                'cancelled_orders' => $query->where('status', 'cancelled')->count(),
            ];

            // Daily sales data
            $dailySales = Order::select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as orders'),
                    DB::raw('SUM(total_amount) as revenue')
                )
                ->whereBetween('created_at', [$startDate, $endDate])
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            return Inertia::render('Admin/Reports/Sales', [
                'orders' => $orders,
                'summary' => $summary,
                'dailySales' => $dailySales,
                'filters' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'status' => $status,
                ],
                'statuses' => [
                    'all' => 'Semua Status',
                    'pending' => 'Menunggu',
                    'processing' => 'Diproses',
                    'shipped' => 'Dikirim',
                    'delivered' => 'Selesai',
                    'cancelled' => 'Dibatalkan',
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('AdminReportController@sales error: ' . $e->getMessage());

            return Inertia::render('Admin/Reports/Sales', [
                'orders' => [],
                'summary' => [],
                'dailySales' => [],
                'filters' => [],
                'statuses' => [],
                'error' => 'Terjadi kesalahan saat memuat laporan penjualan.'
            ]);
        }
    }

    /**
     * Laporan produk
     */
    public function products(Request $request): Response
    {
        try {
            // Ambil data produk beserta total terjual dan pendapatan per produk
            $products = Product::select([
                    'products.id',
                    'products.name',
                    DB::raw('COALESCE(SUM(order_items.quantity),0) as total_sold'),
                    DB::raw('COALESCE(SUM(order_items.quantity * order_items.price),0) as revenue')

                ])
                ->leftJoin('order_items', 'products.id', '=', 'order_items.product_id')
                ->groupBy('products.id', 'products.name')
                ->orderByDesc('total_sold')
                ->get();

            // Ringkasan
            $summary = [
                'total_products'    => Product::count(),
                'total_sold_items'  => $products->sum('total_sold'),
                'total_revenue'     => 0, // Akan diisi setelah perhitungan
            ];

            // Hitung total pendapatan
            $totalRevenue = OrderItem::select(DB::raw('SUM(quantity * price) as total_revenue'))
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', 'delivered')
                ->whereIn('order_items.product_id', $products->pluck('id'))
                ->value('total_revenue');
            $summary['total_revenue'] = $totalRevenue ? 'Rp ' . number_format($totalRevenue, 0, ',', '.') : 'Rp 0';

            return Inertia::render('Admin/Reports/Products', [
                'products' => $products,
                'total_Revenue' => $summary['total_revenue'],
                'summary'  => $summary,
                'error'    => null,
            ]);
        } catch (\Exception $e) {
            Log::error('AdminReportController@products error: ' . $e->getMessage());

            return Inertia::render('Admin/Reports/Products', [
                'products' => [],
                'summary'  => [
                    'total_products' => 0,
                    'total_sold_items' => 0,
                    'total_revenue' => 0,
                ],
                'error' => 'Terjadi kesalahan saat memuat laporan produk: ' . $e->getMessage(),
            ]);
        }
    }


    /**
     * Laporan pelanggan
     */
    public function customers(Request $request): Response
    {
        try {
            $sortBy = $request->get('sort_by', 'total_orders');
            $sortOrder = $request->get('sort_order', 'desc');
            $dateRange = $request->get('date_range', '30');

            $startDate = Carbon::now()->subDays($dateRange);

            $customers = User::role('buyer')
                ->select('users.*')
                ->leftJoin('orders', 'users.id', '=', 'orders.user_id')
                ->selectRaw('
                    users.*,
                    COUNT(orders.id) as total_orders,
                    COALESCE(SUM(orders.total_amount), 0) as total_spent,
                    COALESCE(AVG(orders.total_amount), 0) as average_order_value,
                    MAX(orders.created_at) as last_order_date
                ')
                ->groupBy('users.id')
                ->orderBy($sortBy, $sortOrder)
                ->paginate(20);

            $summary = [
                'total_customers' => User::role('buyer')->count(),
                'active_customers' => User::role('buyer')
                    ->whereHas('orders', function($query) use ($startDate) {
                        $query->where('created_at', '>=', $startDate);
                    })->count(),
                'new_customers' => User::role('buyer')
                    ->where('created_at', '>=', $startDate)
                    ->count(),
                'repeat_customers' => User::role('buyer')
                    ->whereHas('orders', function($query) {
                        $query->havingRaw('COUNT(*) > 1');
                    })->count(),
            ];

            $acquisitionTrend = [];
            for ($i = 29; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $acquisitionTrend[] = [
                    'date' => $date->format('Y-m-d'),
                    'new_customers' => User::role('buyer')
                        ->whereDate('created_at', $date)
                        ->count(),
                ];
            }

            return Inertia::render('Admin/Reports/Customers', [
            'customers' => new \Illuminate\Pagination\LengthAwarePaginator([], 0, 20),
            'summary' => [
                    'total_customers' => 0,
                    'active_customers' => 0,
                     'new_customers' => 0,
                    'repeat_customers' => 0,
            ],
            'acquisitionTrend' => [],
            'filters' => [],
            'error' => 'Terjadi kesalahan saat memuat laporan pelanggan.'
        ]);


        } catch (\Exception $e) {
            Log::error('AdminReportController@customers error: ' . $e->getMessage());

            return Inertia::render('Admin/Reports/Customers', [
                'customers' => [],
                'summary' => [],
                'acquisitionTrend' => [],
                'filters' => [],
                'error' => 'Terjadi kesalahan saat memuat laporan pelanggan.'
            ]);
        }
    }

    /**
     * Laporan keuangan
     */
    public function financial(Request $request): Response
    {
        try {
            $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
            $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->toDateString());

            $revenue = [
                'gross_revenue' => Order::where('status', 'delivered')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->sum('total_amount'),
                'total_orders' => Order::where('status', 'delivered')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
                'average_order_value' => Order::where('status', 'delivered')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->avg('total_amount'),
                'refunds' => Order::where('status', 'cancelled')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->sum('total_amount'),
            ];
            $revenue['net_revenue'] = $revenue['gross_revenue'] - $revenue['refunds'];

            $currentMonth = Carbon::parse($startDate);
            $previousMonth = $currentMonth->copy()->subMonth();

            $previousRevenue = Order::where('status', 'delivered')
                ->whereBetween('created_at', [
                    $previousMonth->startOfMonth(),
                    $previousMonth->endOfMonth()
                ])
                ->sum('total_amount');

            $revenue['growth_rate'] = $previousRevenue > 0
                ? (($revenue['gross_revenue'] - $previousRevenue) / $previousRevenue) * 100
                : 0;

            $revenueByCategory = OrderItem::select('products.category')
                ->selectRaw('SUM(order_items.quantity * order_items.price) as revenue')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', 'delivered')
                ->whereBetween('orders.created_at', [$startDate, $endDate])
                ->groupBy('products.category')
                ->orderBy('revenue', 'desc')
                ->get();

            $dailyRevenue = Order::select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(total_amount) as revenue'),
                    DB::raw('COUNT(*) as orders')
                )
                ->where('status', 'delivered')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            return Inertia::render('Admin/Reports/Financial', [
                'revenue' => $revenue,
                'revenueByCategory' => $revenueByCategory,
                'dailyRevenue' => $dailyRevenue,
                'filters' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('AdminReportController@financial error: ' . $e->getMessage());

            return Inertia::render('Admin/Reports/Financial', [
                'revenue' => [],
                'revenueByCategory' => [],
                'dailyRevenue' => [],
                'filters' => [],
                'error' => 'Terjadi kesalahan saat memuat laporan keuangan.'
            ]);
        }
    }

    /**
     * Laporan inventori
     */
    public function inventory(Request $request): Response
    {
        try {
            $category = $request->get('category', 'all');
            $stockStatus = $request->get('stock_status', 'all');

            $query = Product::query();

            if ($category !== 'all') {
                $query->where('category', $category);
            }

            switch ($stockStatus) {
                case 'low':
                    $query->where('stock', '<=', 10)->where('stock', '>', 0);
                    break;
                case 'out':
                    $query->where('stock', 0);
                    break;
                case 'good':
                    $query->where('stock', '>', 10);
                    break;
            }

            $products = $query->orderBy('stock', 'asc')->paginate(20);

            $summary = [
                'total_products' => Product::count(),
                'low_stock' => Product::where('stock', '<=', 10)->where('stock', '>', 0)->count(),
                'out_of_stock' => Product::where('stock', 0)->count(),
                'good_stock' => Product::where('stock', '>', 10)->count(),
                'total_inventory_value' => Product::selectRaw('SUM(stock * price)')->value('SUM(stock * price)') ?? 0,
            ];

            $categories = Product::select('category')
                ->distinct()
                ->whereNotNull('category')
                ->pluck('category');

            $stockAlerts = Product::where('stock', '<=', 5)
                ->orderBy('stock', 'asc')
                ->limit(10)
                ->get();

            return Inertia::render('Admin/Reports/Inventory', [
                'products' => $products,
                'summary' => $summary,
                'stockAlerts' => $stockAlerts,
                'categories' => $categories,
                'filters' => [
                    'category' => $category,
                    'stock_status' => $stockStatus,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('AdminReportController@inventory error: ' . $e->getMessage());

            return Inertia::render('Admin/Reports/Inventory', [
                'products' => [],
                'summary' => [],
                'stockAlerts' => [],
                'categories' => [],
                'filters' => [],
                'error' => 'Terjadi kesalahan saat memuat laporan inventori.'
            ]);
        }
    }

    /**
     * Export sales report
     */
    public function exportSales(Request $request)
    {
        try {
            $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
            $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->toDateString());
            $status = $request->get('status', 'all');

            $export = new SalesReportExport($startDate, $endDate, $status);
            return $export->export();

        } catch (\Exception $e) {
            Log::error('AdminReportController@exportSales error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal mengekspor laporan penjualan: ' . $e->getMessage());
        }
    }

    /**
     * Export products report
     */
    public function exportProducts(Request $request)
    {
        try {
            $category = $request->get('category', 'all');
            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');

            $export = new ProductsReportExport($category, $sortBy, $sortOrder);
            return $export->export();

        } catch (\Exception $e) {
            Log::error('AdminReportController@exportProducts error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal mengekspor laporan produk: ' . $e->getMessage());
        }
    }

    /**
     * Export customers report
     */
    public function exportCustomers(Request $request)
    {
        try {
            $dateRange = $request->get('date_range', 30);
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $export = new CustomersReportExport($dateRange, $sortBy, $sortOrder);
            return $export->export();

        } catch (\Exception $e) {
            Log::error('AdminReportController@exportCustomers error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal mengekspor laporan pelanggan: ' . $e->getMessage());
        }
    }

    /**
     * Export financial report
     */
    public function exportFinancial(Request $request)
    {
        try {
            $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
            $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->toDateString());

            $orders = Order::where('status', 'delivered')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->with(['user', 'orderItems.product'])
                ->orderBy('created_at', 'desc')
                ->get();

            $data = $orders->map(function ($order) {
                $grossRevenue = $order->total_amount;
                $cogs = 0;
                foreach ($order->orderItems as $item) {
                    $productCost = $item->product->cost ?? 0;
                    $cogs += $item->quantity * $productCost;
                }
                $grossProfit = $grossRevenue - $cogs;
                $tax = $grossRevenue * 0.11;
                $netRevenue = $grossRevenue - $tax;
                $profitMargin = $grossRevenue > 0 ? ($grossProfit / $grossRevenue) * 100 : 0;
                $mainCategory = $order->orderItems->first()->product->category ?? 'N/A';

                return [
                    'Tanggal' => $order->created_at->format('d/m/Y'),
                    'No Pesanan' => $order->order_number,
                    'Pelanggan' => $order->user->name ?? 'N/A',
                    'Gross Revenue' => 'Rp ' . number_format($grossRevenue, 0, ',', '.'),
                    'COGS' => 'Rp ' . number_format($cogs, 0, ',', '.'),
                    'Gross Profit' => 'Rp ' . number_format($grossProfit, 0, ',', '.'),
                    'Pajak PPN 11%' => 'Rp ' . number_format($tax, 0, ',', '.'),
                    'Net Revenue' => 'Rp ' . number_format($netRevenue, 0, ',', '.'),
                    'Profit Margin (%)' => number_format($profitMargin, 2, ',', '.') . '%',
                    'Metode Pembayaran' => $order->payment_method ?? 'N/A',
                    'Kategori Utama' => $mainCategory,
                    'Jumlah Item' => $order->orderItems->count(),
                    'Status' => ucfirst($order->status)
                ];
            });

            $filename = 'financial_report_' . $startDate . '_to_' . $endDate . '.xlsx';

            return (new FastExcel($data))->download($filename);

        } catch (\Exception $e) {
            Log::error('AdminReportController@exportFinancial error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal mengekspor laporan keuangan: ' . $e->getMessage());
        }
    }

    /**
     * Export inventory report
     */
    public function exportInventory(Request $request)
    {
        try {
            $category = $request->get('category', 'all');
            $stockStatus = $request->get('stock_status', 'all');

            $query = Product::query();

            if ($category !== 'all') {
                $query->where('category', $category);
            }

            switch ($stockStatus) {
                case 'low':
                    $query->where('stock', '<=', 10)->where('stock', '>', 0);
                    break;
                case 'out':
                    $query->where('stock', 0);
                    break;
                case 'good':
                    $query->where('stock', '>', 10);
                    break;
            }

            $products = $query->orderBy('stock', 'asc')->get();

            $data = $products->map(function ($product) {
                $stockStatus = 'Good Stock';
                if ($product->stock <= 0) {
                    $stockStatus = 'Out of Stock';
                } elseif ($product->stock <= 10) {
                    $stockStatus = 'Low Stock';
                }
                $stockValue = $product->stock * $product->price;

                return [
                    'Nama Produk' => $product->name,
                    'SKU' => $product->sku ?? 'N/A',
                    'Kategori' => $product->category,
                    'Stok Saat Ini' => $product->stock,
                    'Status Stok' => $stockStatus,
                    'Harga Satuan' => 'Rp ' . number_format($product->price, 0, ',', '.'),
                    'Nilai Stok' => 'Rp ' . number_format($stockValue, 0, ',', '.'),
                    'Reorder Level' => $product->reorder_level ?? 10,
                    'Supplier' => $product->supplier ?? 'N/A',
                    'Terakhir Restock' => $product->last_restocked_at ? $product->last_restocked_at->format('d/m/Y') : 'N/A',
                    'Status Produk' => $product->is_active ? 'Aktif' : 'Nonaktif'
                ];
            });

            $filename = 'inventory_report_' . date('Y-m-d') . '.xlsx';

            return (new FastExcel($data))->download($filename);

        } catch (\Exception $e) {
            Log::error('AdminReportController@exportInventory error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal mengekspor laporan inventori: ' . $e->getMessage());
        }
    }
}
