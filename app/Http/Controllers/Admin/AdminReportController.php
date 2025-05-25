<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AdminReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Reports/Index');
    }

    public function sales()
    {
        return Inertia::render('Admin/Reports/Sales');
    }

    public function products()
    {
        return Inertia::render('Admin/Reports/Products');
    }

    public function customers()
    {
        return Inertia::render('Admin/Reports/Customers');
    }

    public function financial()
    {
        return Inertia::render('Admin/Reports/Financial');
    }
}
