<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AdminOrderController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Orders/Index');
    }

    public function pending()
    {
        return Inertia::render('Admin/Orders/Pending');
    }

    public function processing()
    {
        return Inertia::render('Admin/Orders/Processing');
    }

    public function shipped()
    {
        return Inertia::render('Admin/Orders/Shipped');
    }

    public function completed()
    {
        return Inertia::render('Admin/Orders/Completed');
    }
}
