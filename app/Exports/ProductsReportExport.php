<?php
// app/Exports/ProductsReportExport.php

namespace App\Exports;

use App\Models\Product;
use Rap2hpoutre\FastExcel\FastExcel;

class ProductsReportExport
{
    protected $category;
    protected $sortBy;
    protected $sortOrder;

    public function __construct($category = 'all', $sortBy = 'name', $sortOrder = 'asc')
    {
        $this->category = $category;
        $this->sortBy = $sortBy;
        $this->sortOrder = $sortOrder;
    }

    public function export()
    {
        $query = Product::with(['orderItems']);

        if ($this->category !== 'all') {
            $query->where('category', $this->category);
        }

        $products = $query->orderBy($this->sortBy, $this->sortOrder)->get();

        $data = $products->map(function ($product) {
            $totalSold = $product->orderItems->sum('quantity');
            $revenue = $product->orderItems->sum(function($item) {
                return $item->quantity * $item->price;
            });
            $profit = $revenue - ($totalSold * ($product->cost ?? 0));

            return [
                'Nama Produk' => $product->name,
                'SKU' => $product->sku ?? 'N/A',
                'Kategori' => $product->category,
                'Harga' => 'Rp ' . number_format($product->price, 0, ',', '.'),
                'Harga Modal' => 'Rp ' . number_format($product->cost ?? 0, 0, ',', '.'),
                'Stok' => $product->stock,
                'Total Terjual' => $totalSold,
                'Revenue' => 'Rp ' . number_format($revenue, 0, ',', '.'),
                'Profit' => 'Rp ' . number_format($profit, 0, ',', '.'),
                'Status' => $product->is_active ? 'Aktif' : 'Nonaktif',
                'Berat (gram)' => $product->weight ?? 'N/A',
                'Tanggal Dibuat' => $product->created_at->format('d/m/Y H:i:s'),
                'Terakhir Update' => $product->updated_at->format('d/m/Y H:i:s')
            ];
        });

        $filename = 'products_report_' . ($this->category !== 'all' ? $this->category . '_' : '') . date('Y-m-d') . '.xlsx';

        return (new FastExcel($data))->download($filename);
    }

    // Generator untuk data besar
    public function exportLarge()
    {
        $filename = 'products_report_large_' . date('Y-m-d') . '.xlsx';

        return (new FastExcel($this->productsGenerator()))->download($filename);
    }

    private function productsGenerator()
    {
        $query = Product::with(['orderItems']);

        if ($this->category !== 'all') {
            $query->where('category', $this->category);
        }

        foreach ($query->cursor() as $product) {
            $totalSold = $product->orderItems->sum('quantity');
            $revenue = $product->orderItems->sum(function($item) {
                return $item->quantity * $item->price;
            });

            yield [
                'Nama Produk' => $product->name,
                'SKU' => $product->sku ?? 'N/A',
                'Kategori' => $product->category,
                'Harga' => $product->price,
                'Stok' => $product->stock,
                'Total Terjual' => $totalSold,
                'Revenue' => $revenue,
                'Status' => $product->is_active ? 'Aktif' : 'Nonaktif',
            ];
        }
    }
}
