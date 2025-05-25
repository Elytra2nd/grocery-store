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
                'total_orders' => 0,
                'total_users' => 0,
                'total_revenue' => 0,
            ]
        ]);
    }
}
