<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Order, Product, User, OrderItem};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Log};
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

// HAPUS BARIS INI:
// use Maatwebsite\Excel\Facades\Excel;
// use App\Exports\{SalesReportExport, ProductsReportExport, CustomersReportExport, FinancialReportExport};

class AdminReportController extends Controller
{
    // ... existing methods ...

    /**
     * Export sales report - Simple CSV
     */
    public function exportSales(Request $request)
    {
        try {
            $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
            $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->toDateString());
            $status = $request->get('status', 'all');

            $query = Order::with(['user', 'orderItems'])
                ->whereBetween('created_at', [$startDate, $endDate]);

            if ($status !== 'all') {
                $query->where('status', $status);
            }

            $orders = $query->get();

            // Simple CSV export tanpa package external
            $filename = 'sales_report_' . $startDate . 'to' . $endDate . '.csv';
            
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];

            $callback = function() use ($orders) {
                $file = fopen('php://output', 'w');
                
                // Header CSV
                fputcsv($file, [
                    'Order Number',
                    'Customer Name', 
                    'Customer Email',
                    'Total Amount',
                    'Status',
                    'Created Date',
                    'Items Count'
                ]);
                
                // Data rows
                foreach ($orders as $order) {
                    fputcsv($file, [
                        $order->order_number,
                        $order->user->name ?? 'N/A',
                        $order->user->email ?? 'N/A',
                        number_format($order->total_amount, 2),
                        ucfirst($order->status),
                        $order->created_at->format('Y-m-d H:i:s'),
                        $order->orderItems->count()
                    ]);
                }
                
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            Log::error('Export sales error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal mengekspor laporan penjualan.');
        }
    }

    /**
     * Export products report - Simple CSV
     */
    public function exportProducts(Request $request)
    {
        try {
            $category = $request->get('category', 'all');
            
            $query = Product::with(['orderItems']);
            
            if ($category !== 'all') {
                $query->where('category', $category);
            }
            
            $products = $query->get();
            
            $filename = 'products_report_' . date('Y-m-d') . '.csv';
            
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];

            $callback = function() use ($products) {
                $file = fopen('php://output', 'w');
                
                fputcsv($file, [
                    'Product Name',
                    'Category',
                    'Price',
                    'Stock',
                    'Total Sold',
                    'Revenue',
                    'Status',
                    'Created Date'
                ]);
                
                foreach ($products as $product) {
                    $totalSold = $product->orderItems->sum('quantity');
                    $revenue = $product->orderItems->sum(function($item) {
                        return $item->quantity * $item->price;
                    });
                    
                    fputcsv($file, [
                        $product->name,
                        $product->category,
                        number_format($product->price, 2),
                        $product->stock,
                        $totalSold,
                        number_format($revenue, 2),
                        $product->is_active ? 'Active' : 'Inactive',
                        $product->created_at->format('Y-m-d H:i:s')
                    ]);
                }
                
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            Log::error('Export products error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal mengekspor laporan produk.');
        }
    }

    /**
     * Export customers report - Simple CSV
     */
    public function exportCustomers(Request $request)
    {
        try {
            $users = User::role('buyer')
                ->with(['orders'])
                ->withCount('orders')
                ->withSum('orders', 'total_amount')
                ->get();
            
            $filename = 'customers_report_' . date('Y-m-d') . '.csv';
            
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];

            $callback = function() use ($users) {
                $file = fopen('php://output', 'w');
                
                fputcsv($file, [
                    'Customer Name',
                    'Email',
                    'Phone',
                    'Total Orders',
                    'Total Spent',
                    'Registration Date',
                    'Last Login',
                    'Status'
                ]);
                
                foreach ($users as $user) {
                    fputcsv($file, [
                        $user->name,
                        $user->email,
                        $user->phone ?? 'N/A',
                        $user->orders_count ?? 0,
                        number_format($user->orders_sum_total_amount ?? 0, 2),
                        $user->created_at->format('Y-m-d H:i:s'),
                        $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : 'Never',
                        $user->is_active ? 'Active' : 'Inactive'
                    ]);
                }
                
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            Log::error('Export customers error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal mengekspor laporan pelanggan.');
        }
    }

    /**
     * Export financial report - Simple CSV
     */
    public function exportFinancial(Request $request)
    {
        try {
            $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->toDateString());
            $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->toDateString());
            
            $orders = Order::where('status', 'delivered')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->with(['user'])
                ->get();
            
            $filename = 'financial_report_' . $startDate . 'to' . $endDate . '.csv';
            
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];

            $callback = function() use ($orders) {
                $file = fopen('php://output', 'w');
                
                fputcsv($file, [
                    'Date',
                    'Order Number',
                    'Customer',
                    'Gross Revenue',
                    'Tax (10%)',
                    'Net Revenue',
                    'Status'
                ]);
                
                foreach ($orders as $order) {
                    $tax = $order->total_amount * 0.1;
                    $netRevenue = $order->total_amount - $tax;
                    
                    fputcsv($file, [
                        $order->created_at->format('Y-m-d'),
                        $order->order_number,
                        $order->user->name ?? 'N/A',
                        number_format($order->total_amount, 2),
                        number_format($tax, 2),
                        number_format($netRevenue, 2),
                        ucfirst($order->status)
                    ]);
                }
                
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            Log::error('Export financial error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal mengekspor laporan keuangan.');
        }
    }
}