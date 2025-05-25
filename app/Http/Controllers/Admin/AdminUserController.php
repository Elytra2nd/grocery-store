<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Users/Index');
    }

    public function active()
    {
        return Inertia::render('Admin/Users/Active');
    }

    public function new()
    {
        return Inertia::render('Admin/Users/New');
    }
}
