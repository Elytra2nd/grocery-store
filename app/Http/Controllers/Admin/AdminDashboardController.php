<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'statistics' => [
                'total_products' => 0,
                'active_products' => 0,
                'low_stock_products' => 0,
                'out_of_stock_products' => 0,
                'total_orders' => 0,
                'pending_orders' => 0,
                'total_revenue' => 0,
                'total_users' => 0,
            ]
        ]);
    }
}
