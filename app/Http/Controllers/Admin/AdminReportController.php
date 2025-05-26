<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminReportController extends Controller
{
    // ================= SALES REPORT =================

    public function indexSales()
    {
        return Inertia::render('Admin/Reports/Sales/Index');
    }

    public function createSales()
    {
        return Inertia::render('Admin/Reports/Sales/Create');
    }

    public function storeSales(Request $request)
    {
        // Validasi & Simpan Laporan Penjualan
    }

    public function showSales($id)
    {
        return Inertia::render('Admin/Reports/Sales/Show', ['id' => $id]);
    }

    public function editSales($id)
    {
        return Inertia::render('Admin/Reports/Sales/Edit', ['id' => $id]);
    }

    public function updateSales(Request $request, $id)
    {
        // Validasi & Update Laporan Penjualan
    }

    public function destroySales($id)
    {
        // Hapus Laporan Penjualan
    }

    // ================= PRODUCTS REPORT =================

    public function indexProducts()
    {
        return Inertia::render('Admin/Reports/Products/Index');
    }

    public function createProducts()
    {
        return Inertia::render('Admin/Reports/Products/Create');
    }

    public function storeProducts(Request $request)
    {
        // Validasi & Simpan Laporan Produk
    }

    public function showProducts($id)
    {
        return Inertia::render('Admin/Reports/Products/Show', ['id' => $id]);
    }

    public function editProducts($id)
    {
        return Inertia::render('Admin/Reports/Products/Edit', ['id' => $id]);
    }

    public function updateProducts(Request $request, $id)
    {
        // Validasi & Update Laporan Produk
    }

    public function destroyProducts($id)
    {
        // Hapus Laporan Produk
    }

    // ================= CUSTOMERS REPORT =================

    public function indexCustomers()
    {
        return Inertia::render('Admin/Reports/Customers/Index');
    }

    public function createCustomers()
    {
        return Inertia::render('Admin/Reports/Customers/Create');
    }

    public function storeCustomers(Request $request)
    {
        // Validasi & Simpan Laporan Pelanggan
    }

    public function showCustomers($id)
    {
        return Inertia::render('Admin/Reports/Customers/Show', ['id' => $id]);
    }

    public function editCustomers($id)
    {
        return Inertia::render('Admin/Reports/Customers/Edit', ['id' => $id]);
    }

    public function updateCustomers(Request $request, $id)
    {
        // Validasi & Update Laporan Pelanggan
    }

    public function destroyCustomers($id)
    {
        // Hapus Laporan Pelanggan
    }

    // ================= FINANCIAL REPORT =================

    public function indexFinancial()
    {
        return Inertia::render('Admin/Reports/Financial/Index');
    }

    public function createFinancial()
    {
        return Inertia::render('Admin/Reports/Financial/Create');
    }

    public function storeFinancial(Request $request)
    {
        // Validasi & Simpan Laporan Keuangan
    }

    public function showFinancial($id)
    {
        return Inertia::render('Admin/Reports/Financial/Show', ['id' => $id]);
    }

    public function editFinancial($id)
    {
        return Inertia::render('Admin/Reports/Financial/Edit', ['id' => $id]);
    }

    public function updateFinancial(Request $request, $id)
    {
        // Validasi & Update Laporan Keuangan
    }

    public function destroyFinancial($id)
    {
        // Hapus Laporan Keuangan
    }
}
