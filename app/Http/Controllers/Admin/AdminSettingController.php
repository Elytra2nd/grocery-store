<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AdminSettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Settings/Index');
    }

    public function general()
    {
        return Inertia::render('Admin/Settings/General');
    }

    public function store()
    {
        return Inertia::render('Admin/Settings/Store');
    }

    public function payment()
    {
        return Inertia::render('Admin/Settings/Payment');
    }

    public function shipping()
    {
        return Inertia::render('Admin/Settings/Shipping');
    }
}
