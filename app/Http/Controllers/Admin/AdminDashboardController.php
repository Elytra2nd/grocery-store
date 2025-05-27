<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Order;
use App\Models\User;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // Ambil data statistik dari database
        $total_products = Product::count();
        $active_products = Product::where('is_active', '>', 0)->count();
        $low_stock_products = Product::where('stock', '<=', 10)->count();
        $out_of_stock_products = Product::where('stock', '<=', 0)->count();

        $total_orders = Order::count();
        $pending_orders = Order::where('status', 'pending')->count();
        $total_revenue = Order::where('status', 'completed')->sum('total_amount');
        $total_users = User::count();

        return Inertia::render('Admin/Dashboard', [
            'statistics' => [
                'total_products'      => $total_products,
                'active_products'     => $active_products,
                'low_stock_products'  => $low_stock_products,
                'out_of_stock_products' => $out_of_stock_products,
                'total_orders'        => $total_orders,
                'pending_orders'      => $pending_orders,
                'total_revenue'       => $total_revenue,
                'total_users'         => $total_users,
            ]
        ]);
    }
}
