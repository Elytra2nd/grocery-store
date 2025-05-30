<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Order, Product, User, OrderItem};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Log};
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

// Import FastExcel dan FinancialReportExport
use Rap2hpoutre\FastExcel\FastExcel;
use App\Exports\FinancialReportExport;

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
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            $category = $request->get('category', 'all');

            // Query builder untuk produk dengan data penjualan yang terintegrasi
            $query = Product::select([
                'products.id',
                'products.name',
                'products.price', // DIPERBAIKI: Pastikan price dari products table
                'products.stock',
                'products.is_active',
                'products.created_at',
                'categories.name as category_name'
            ])
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id');

            // DIPERBAIKI: Subquery untuk menghitung total_sold dan revenue
            $salesSubquery = OrderItem::select('product_id')
                ->selectRaw('COALESCE(SUM(quantity), 0) as total_sold')
                ->selectRaw('COALESCE(SUM(quantity * price), 0) as revenue') // DIPERBAIKI: Gunakan price dari order_items
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', '!=', 'cancelled');

            // Filter berdasarkan tanggal jika ada
            if ($startDate && $endDate) {
                $salesSubquery->whereBetween('orders.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
            }

            $salesSubquery = $salesSubquery->groupBy('product_id');

            // Join dengan subquery sales
            $query->leftJoinSub($salesSubquery, 'sales', function ($join) {
                $join->on('products.id', '=', 'sales.product_id');
            })
            ->selectRaw('COALESCE(sales.total_sold, 0) as total_sold')
            ->selectRaw('COALESCE(sales.revenue, 0) as revenue');

            // Filter berdasarkan kategori
            if ($category !== 'all') {
                $query->where('categories.name', $category);
            }

            $products = $query->orderByDesc('total_sold')->get();

            // DIPERBAIKI: Hitung ringkasan dengan data yang benar
            $totalProducts = Product::count();
            $activeProducts = Product::where('is_active', true)->count();
            $lowStockProducts = Product::where('stock', '<=', 10)->count();

            // Hitung total dari hasil query, bukan dari collection
            $totalSoldItems = $products->sum('total_sold');
            $totalRevenue = $products->sum('revenue');

            $summary = [
                'total_products' => (int) $totalProducts,
                'total_sold_items' => (int) $totalSoldItems,
                'total_revenue' => (float) $totalRevenue,
                'active_products' => (int) $activeProducts,
                'low_stock_products' => (int) $lowStockProducts,
            ];

            // Ambil kategori untuk filter
            $categories = DB::table('categories')
                ->select('name')
                ->distinct()
                ->orderBy('name')
                ->pluck('name');

            return Inertia::render('Admin/Reports/Products', [
                'products' => $products->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'price' => (float) $product->price, // DIPERBAIKI: Cast ke float
                        'stock' => (int) $product->stock,
                        'is_active' => (bool) $product->is_active,
                        'category_name' => $product->category_name,
                        'total_sold' => (int) $product->total_sold,
                        'revenue' => (float) $product->revenue, // DIPERBAIKI: Cast ke float
                        'created_at' => $product->created_at,
                    ];
                }),
                'summary' => $summary,
                'categories' => $categories,
                'filters' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'category' => $category,
                ],
                'error' => null,
            ]);

        } catch (\Exception $e) {
            Log::error('AdminReportController@products error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return Inertia::render('Admin/Reports/Products', [
                'products' => [],
                'summary' => [
                    'total_products' => 0,
                    'total_sold_items' => 0,
                    'total_revenue' => 0.0,
                    'active_products' => 0,
                    'low_stock_products' => 0,
                ],
                'categories' => [],
                'filters' => [
                    'start_date' => $request->get('start_date'),
                    'end_date' => $request->get('end_date'),
                    'category' => $request->get('category', 'all'),
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
            $dateRange = (int) $request->get('date_range', 30);
            $perPage = (int) $request->get('per_page', 15); // Items per page
            $search = $request->get('search', ''); // Search functionality

            $startDate = Carbon::now()->subDays($dateRange);

            // DIPERBAIKI: Query dengan paginasi
            $customersQuery = User::role('buyer')
                ->leftJoin('orders', function($join) use ($startDate) {
                    $join->on('users.id', '=', 'orders.user_id')
                         ->where('orders.status', '!=', 'cancelled')
                         ->where('orders.created_at', '>=', $startDate);
                })
                ->select([
                    'users.id',
                    'users.name',
                    'users.email',
                    'users.created_at',
                    DB::raw('COUNT(orders.id) as total_orders'),
                    DB::raw('COALESCE(SUM(orders.total_amount), 0) as total_spent'),
                    DB::raw('CASE WHEN COUNT(orders.id) > 0 THEN AVG(orders.total_amount) ELSE 0 END as average_order_value'),
                    DB::raw('MAX(orders.created_at) as last_order_date')
                ])
                ->groupBy('users.id', 'users.name', 'users.email', 'users.created_at');

            // Search functionality
            if (!empty($search)) {
                $customersQuery->where(function($query) use ($search) {
                    $query->where('users.name', 'LIKE', "%{$search}%")
                          ->orWhere('users.email', 'LIKE', "%{$search}%");
                });
            }

            // Apply sorting
            $customersQuery->orderBy($sortBy, $sortOrder);

            // DIPERBAIKI: Menggunakan paginate() dengan transform
            $customers = $customersQuery->paginate($perPage);

            // Transform paginated data
            $customers->getCollection()->transform(function ($customer) {
                return [
                    'id' => (int) $customer->id,
                    'name' => (string) $customer->name,
                    'email' => (string) $customer->email,
                    'total_orders' => (int) $customer->total_orders,
                    'total_spent' => (float) $customer->total_spent,
                    'average_order_value' => (float) $customer->average_order_value,
                    'last_order_date' => $customer->last_order_date,
                    'created_at' => $customer->created_at->toISOString(),
                ];
            });

            // Summary calculations (tidak terpaginasi)
            $summary = [
                'total_customers' => User::role('buyer')->count(),
                'active_customers' => User::role('buyer')
                    ->whereHas('orders', function ($query) use ($startDate) {
                        $query->where('created_at', '>=', $startDate)
                              ->where('status', '!=', 'cancelled');
                    })->count(),
                'new_customers' => User::role('buyer')
                    ->where('created_at', '>=', $startDate)
                    ->count(),
                'repeat_customers' => User::role('buyer')
                    ->whereHas('orders', function ($query) {
                        $query->select(DB::raw('COUNT(*)'))
                              ->where('status', '!=', 'cancelled')
                              ->havingRaw('COUNT(*) > 1');
                    })->count(),
            ];

            // Acquisition trend
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
                'customers' => $customers, // DIPERBAIKI: Paginated data
                'summary' => $summary,
                'acquisitionTrend' => $acquisitionTrend,
                'filters' => [
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                    'date_range' => (string) $dateRange,
                    'per_page' => $perPage,
                    'search' => $search,
                ],
                'error' => null,
            ]);

        } catch (\Exception $e) {
            Log::error('AdminReportController@customers error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return Inertia::render('Admin/Reports/Customers', [
                'customers' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $perPage,
                    'total' => 0,
                    'from' => null,
                    'to' => null,
                ], // DIPERBAIKI: Pagination structure untuk error state
                'summary' => [
                    'total_customers' => 0,
                    'active_customers' => 0,
                    'new_customers' => 0,
                    'repeat_customers' => 0,
                ],
                'acquisitionTrend' => [],
                'filters' => [
                    'sort_by' => $request->get('sort_by', 'total_orders'),
                    'sort_order' => $request->get('sort_order', 'desc'),
                    'date_range' => $request->get('date_range', '30'),
                    'per_page' => $perPage,
                    'search' => $request->get('search', ''),
                ],
                'error' => 'Terjadi kesalahan saat memuat laporan pelanggan: ' . $e->getMessage(),
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

            // Validasi tanggal
            try {
                $startDateCarbon = Carbon::parse($startDate);
                $endDateCarbon = Carbon::parse($endDate);
            } catch (\Exception $e) {
                throw new \Exception('Format tanggal tidak valid');
            }

            // Revenue by category
            $revenueByCategory = OrderItem::select('categories.name as category')
                ->selectRaw('SUM(order_items.quantity * order_items.price) as revenue')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->join('categories', 'products.category_id', '=', 'categories.id')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', 'delivered')
                ->whereBetween('orders.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->groupBy('categories.name')
                ->orderBy('revenue', 'desc')
                ->get()
                ->map(function ($item) {
                    return [
                        'category' => $item->category ?? 'Tidak Berkategori',
                        'revenue' => (float) ($item->revenue ?? 0)
                    ];
                });

            // Revenue summary
            $revenue = [
                'gross_revenue' => (float) Order::where('status', 'delivered')
                    ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->sum('total_amount'),
                'net_revenue' => (float) Order::where('status', 'delivered')
                    ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->sum('total_amount') * 0.89,
                'total_orders' => Order::where('status', 'delivered')
                    ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->count(),
                'average_order_value' => (float) Order::where('status', 'delivered')
                    ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->avg('total_amount'),
                'refunds' => (float) Order::where('status', 'refunded')
                    ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->sum('total_amount'),
                'growth_rate' => 0,
            ];

            // Daily revenue
            $dailyRevenue = Order::select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(total_amount) as revenue')
                )
                ->where('status', 'delivered')
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
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
            Log::error('AdminReportController@financial error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return Inertia::render('Admin/Reports/Financial', [
                'revenue' => [
                    'gross_revenue' => 0,
                    'net_revenue' => 0,
                    'total_orders' => 0,
                    'average_order_value' => 0,
                    'refunds' => 0,
                    'growth_rate' => 0,
                ],
                'revenueByCategory' => [],
                'dailyRevenue' => [],
                'filters' => [
                    'start_date' => $request->get('start_date', Carbon::now()->startOfMonth()->toDateString()),
                    'end_date' => $request->get('end_date', Carbon::now()->endOfMonth()->toDateString()),
                ],
                'error' => 'Terjadi kesalahan saat memuat laporan keuangan: ' . $e->getMessage()
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
     * Export financial report menggunakan FinancialReportExport - DIPERBAIKI
     */
    public function exportFinancial(Request $request)
    {
        try {
            $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
            $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->toDateString());
            $reportType = $request->get('report_type', 'summary');

            $export = new FinancialReportExport($startDate, $endDate, $reportType);

            // Export berdasarkan tipe - DIPERBAIKI method names
            switch ($reportType) {
                case 'multiple':
                    return $export->exportMultipleSheets();
                case 'styled':
                    return $export->exportWithStyling();
                case 'detailed':
                    return $export->export();
                case 'products':
                    return $export->export();
                case 'daily':
                    return $export->export();
                default:
                    return $export->export();
            }

        } catch (\Exception $e) {
            Log::error('AdminReportController@exportFinancial error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal mengekspor laporan keuangan: ' . $e->getMessage());
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

            // Menggunakan FinancialReportExport untuk sales
            $export = new FinancialReportExport($startDate, $endDate, 'detailed');
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
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            $category = $request->get('category', 'all');

            // Menggunakan FinancialReportExport untuk products
            $export = new FinancialReportExport($startDate, $endDate, 'products');
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

            $customers = User::role('buyer')
                ->with(['orders' => function($query) {
                    $query->where('status', 'delivered');
                }])
                ->get()
                ->map(function ($customer) {
                    return [
                        'Nama' => $customer->name,
                        'Email' => $customer->email,
                        'Tanggal Daftar' => $customer->created_at->format('d/m/Y'),
                        'Total Pesanan' => $customer->orders->count(),
                        'Total Belanja (Rp)' => number_format($customer->orders->sum('total_amount'), 0, ',', '.'),
                        'Rata-rata Pesanan (Rp)' => $customer->orders->count() > 0 ?
                            number_format($customer->orders->avg('total_amount'), 0, ',', '.') : '0',
                        'Pesanan Terakhir' => $customer->orders->max('created_at') ?
                            Carbon::parse($customer->orders->max('created_at'))->format('d/m/Y') : 'Belum ada',
                        'Status' => $customer->orders->count() > 1 ? 'Repeat Customer' : 'New Customer'
                    ];
                });

            $filename = 'customers_report_' . date('Y-m-d') . '.xlsx';
            return (new FastExcel($customers))->download($filename);

        } catch (\Exception $e) {
            Log::error('AdminReportController@exportCustomers error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal mengekspor laporan pelanggan: ' . $e->getMessage());
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

    /**
     * Export daily report menggunakan FinancialReportExport
     */
    public function exportDaily(Request $request)
    {
        try {
            $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
            $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->toDateString());

            $export = new FinancialReportExport($startDate, $endDate, 'daily');
            return $export->export();

        } catch (\Exception $e) {
            Log::error('AdminReportController@exportDaily error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal mengekspor laporan harian: ' . $e->getMessage());
        }
    }

    /**
     * Export large dataset menggunakan generator untuk performa optimal
     */
    public function exportLargeDataset(Request $request)
    {
        try {
            $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
            $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->toDateString());

            // Generator untuk dataset besar
            $generator = function() use ($startDate, $endDate) {
                $orders = Order::whereBetween('created_at', [$startDate, $endDate])
                    ->with(['user', 'orderItems.product.category'])
                    ->cursor(); // Menggunakan cursor untuk memory efficiency

                foreach ($orders as $order) {
                    yield [
                        'No. Pesanan' => $order->order_number,
                        'Tanggal' => Carbon::parse($order->created_at)->format('d/m/Y H:i'),
                        'Pelanggan' => $order->user->name ?? 'N/A',
                        'Email' => $order->user->email ?? 'N/A',
                        'Status' => ucfirst($order->status),
                        'Total (Rp)' => number_format($order->total_amount, 0, ',', '.'),
                        'Jumlah Item' => $order->orderItems->count()
                    ];
                }
            };

            $filename = 'large_dataset_' . $startDate . '_to_' . $endDate . '.xlsx';
            return (new FastExcel($generator()))->download($filename);

        } catch (\Exception $e) {
            Log::error('AdminReportController@exportLargeDataset error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal mengekspor dataset besar: ' . $e->getMessage());
        }
    }
}
