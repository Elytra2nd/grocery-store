<?php

namespace App\Exports;

use App\Models\Order;
use App\Models\OrderItem;
use Rap2hpoutre\FastExcel\FastExcel;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class FinancialReportExport
{
    protected $startDate;
    protected $endDate;
    protected $reportType;

    public function __construct($startDate = null, $endDate = null, $reportType = 'summary')
    {
        $this->startDate = $startDate ? Carbon::parse($startDate) : Carbon::now()->startOfMonth();
        $this->endDate = $endDate ? Carbon::parse($endDate) : Carbon::now()->endOfMonth();
        $this->reportType = $reportType;
    }

    /**
     * Export laporan ke Excel
     */
    public function export($filename = null)
    {
        $data = $this->getData();

        if (!$filename) {
            $filename = $this->getDefaultFilename();
        }

        return (new FastExcel($data))->download($filename);
    }

    /**
     * Export dengan custom styling
     */
    public function exportWithStyling($filename = null)
    {
        $data = $this->getData();

        if (!$filename) {
            $filename = $this->getDefaultFilename();
        }

        return (new FastExcel($data))
            ->headerStyle([
                'font' => ['bold' => true, 'size' => 12],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'D97706']],
                'alignment' => ['horizontal' => 'center']
            ])
            ->rowsStyle([
                'alignment' => ['vertical' => 'center']
            ])
            ->download($filename);
    }

    /**
     * Get data berdasarkan report type
     */
    private function getData(): Collection
    {
        switch ($this->reportType) {
            case 'detailed':
                return $this->getDetailedReport();
            case 'products':
                return $this->getProductsReport();
            case 'daily':
                return $this->getDailyReport();
            default:
                return $this->getSummaryReport();
        }
    }

    /**
     * Laporan ringkasan keuangan
     */
    private function getSummaryReport(): Collection
    {
        $orders = Order::whereBetween('created_at', [$this->startDate, $this->endDate])
            ->with(['orderItems.product'])
            ->get();

        $totalSales = $orders->where('status', '!=', 'cancelled')->sum('total_amount');
        $totalOrders = $orders->where('status', '!=', 'cancelled')->count();
        $deliveredOrders = $orders->where('status', 'delivered');
        $pendingOrders = $orders->where('status', 'pending');
        $cancelledOrders = $orders->where('status', 'cancelled');

        return collect([
            [
                'Metrik' => 'Total Penjualan',
                'Nilai (Rp)' => number_format($totalSales, 0, ',', '.'),
                'Jumlah' => number_format($totalOrders, 0, ',', '.'),
                'Persentase (%)' => '100%'
            ],
            [
                'Metrik' => 'Pesanan Selesai',
                'Nilai (Rp)' => number_format($deliveredOrders->sum('total_amount'), 0, ',', '.'),
                'Jumlah' => number_format($deliveredOrders->count(), 0, ',', '.'),
                'Persentase (%)' => $orders->count() > 0 ?
                    round(($deliveredOrders->count() / $orders->count()) * 100, 2) . '%' : '0%'
            ],
            [
                'Metrik' => 'Pesanan Pending',
                'Nilai (Rp)' => number_format($pendingOrders->sum('total_amount'), 0, ',', '.'),
                'Jumlah' => number_format($pendingOrders->count(), 0, ',', '.'),
                'Persentase (%)' => $orders->count() > 0 ?
                    round(($pendingOrders->count() / $orders->count()) * 100, 2) . '%' : '0%'
            ],
            [
                'Metrik' => 'Pesanan Dibatalkan',
                'Nilai (Rp)' => number_format($cancelledOrders->sum('total_amount'), 0, ',', '.'),
                'Jumlah' => number_format($cancelledOrders->count(), 0, ',', '.'),
                'Persentase (%)' => $orders->count() > 0 ?
                    round(($cancelledOrders->count() / $orders->count()) * 100, 2) . '%' : '0%'
            ],
            [
                'Metrik' => 'Rata-rata Nilai Pesanan',
                'Nilai (Rp)' => $totalOrders > 0 ?
                    number_format($totalSales / $totalOrders, 0, ',', '.') : '0',
                'Jumlah' => number_format($totalOrders, 0, ',', '.'),
                'Persentase (%)' => '0%'
            ],
            [
                'Metrik' => 'Total Produk Terjual',
                'Nilai (Rp)' => number_format($orders->where('status', '!=', 'cancelled')
                    ->flatMap->orderItems->sum('quantity'), 0, ',', '.'),
                'Jumlah' => number_format($orders->where('status', '!=', 'cancelled')
                    ->flatMap->orderItems->count(), 0, ',', '.'),
                'Persentase (%)' => '0%'
            ]
        ]);
    }

    /**
     * Laporan detail per pesanan
     */
    private function getDetailedReport(): Collection
    {
        return Order::whereBetween('created_at', [$this->startDate, $this->endDate])
            ->with(['user', 'orderItems.product.category'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'No. Pesanan' => $order->order_number,
                    'Tanggal' => Carbon::parse($order->created_at)->format('d/m/Y H:i'),
                    'Pelanggan' => $order->user->name ?? 'N/A',
                    'Email' => $order->user->email ?? 'N/A',
                    'Status' => ucfirst($order->status),
                    'Metode Pembayaran' => ucfirst(str_replace('_', ' ', $order->payment_method ?? 'N/A')),
                    'Subtotal (Rp)' => number_format(
                        $order->total_amount - ($order->shipping_cost ?? 0) - ($order->tax_amount ?? 0),
                        0, ',', '.'
                    ),
                    'Ongkir (Rp)' => number_format($order->shipping_cost ?? 0, 0, ',', '.'),
                    'Pajak (Rp)' => number_format($order->tax_amount ?? 0, 0, ',', '.'),
                    'Total (Rp)' => number_format($order->total_amount, 0, ',', '.'),
                    'Jumlah Item' => $order->orderItems->count(),
                    'Alamat Pengiriman' => $order->shipping_address ?? 'N/A',
                    'Catatan' => $order->notes ?? 'N/A'
                ];
            });
    }

    /**
     * Laporan per produk
     */
    private function getProductsReport(): Collection
    {
        return OrderItem::whereHas('order', function($query) {
            $query->whereBetween('created_at', [$this->startDate, $this->endDate])
                  ->where('status', '!=', 'cancelled');
        })
        ->with(['product.category', 'order'])
        ->get()
        ->groupBy('product_id')
        ->map(function($items) {
            $product = $items->first()->product;
            $totalQuantity = $items->sum('quantity');
            $totalRevenue = $items->sum(function($item) {
                return $item->quantity * $item->price;
            });

            return [
                'Nama Produk' => $product->name ?? 'Produk Dihapus',
                'Kategori' => $product->category->name ?? 'Tidak Ada Kategori',
                'Total Terjual' => number_format($totalQuantity, 0, ',', '.'),
                'Total Pendapatan (Rp)' => number_format($totalRevenue, 0, ',', '.'),
                'Harga Rata-rata (Rp)' => number_format($items->avg('price'), 0, ',', '.'),
                'Jumlah Pesanan' => number_format($items->count(), 0, ',', '.'),
                'Stok Saat Ini' => number_format($product->stock ?? 0, 0, ',', '.'),
                'Status Produk' => $product ? ($product->is_active ? 'Aktif' : 'Tidak Aktif') : 'Dihapus'
            ];
        })
        ->sortByDesc(function($item) {
            return (int) str_replace(['.', ','], '', $item['Total Pendapatan (Rp)']);
        })
        ->values();
    }

    /**
     * Laporan harian
     */
    private function getDailyReport(): Collection
    {
        return Order::whereBetween('created_at', [$this->startDate, $this->endDate])
            ->where('status', '!=', 'cancelled')
            ->get()
            ->groupBy(function($order) {
                return Carbon::parse($order->created_at)->format('Y-m-d');
            })
            ->map(function($orders, $date) {
                $totalRevenue = $orders->sum('total_amount');
                $totalOrders = $orders->count();

                return [
                    'Tanggal' => Carbon::parse($date)->format('d/m/Y'),
                    'Hari' => Carbon::parse($date)->locale('id')->dayName,
                    'Total Pesanan' => number_format($totalOrders, 0, ',', '.'),
                    'Total Pendapatan (Rp)' => number_format($totalRevenue, 0, ',', '.'),
                    'Rata-rata Nilai Pesanan (Rp)' => $totalOrders > 0 ?
                        number_format($totalRevenue / $totalOrders, 0, ',', '.') : '0',
                    'Pesanan Selesai' => number_format($orders->where('status', 'delivered')->count(), 0, ',', '.'),
                    'Pesanan Pending' => number_format($orders->where('status', 'pending')->count(), 0, ',', '.'),
                    'Pesanan Diproses' => number_format($orders->where('status', 'processing')->count(), 0, ',', '.'),
                    'Pesanan Dikirim' => number_format($orders->where('status', 'shipped')->count(), 0, ',', '.')
                ];
            })
            ->sortBy('Tanggal')
            ->values();
    }

    /**
     * Get default filename
     */
    private function getDefaultFilename(): string
    {
        $typeNames = [
            'summary' => 'ringkasan',
            'detailed' => 'detail-pesanan',
            'products' => 'laporan-produk',
            'daily' => 'laporan-harian'
        ];

        $typeName = $typeNames[$this->reportType] ?? 'keuangan';
        $dateRange = $this->startDate->format('Y-m-d') . '_' . $this->endDate->format('Y-m-d');

        return "laporan-{$typeName}-{$dateRange}.xlsx";
    }

    /**
     * Export multiple sheets
     */
    public function exportMultipleSheets($filename = null)
    {
        if (!$filename) {
            $dateRange = $this->startDate->format('Y-m-d') . '_' . $this->endDate->format('Y-m-d');
            $filename = "laporan-lengkap-{$dateRange}.xlsx";
        }

        $sheets = [
            'Ringkasan' => $this->getSummaryReport(),
            'Detail Pesanan' => $this->getDetailedReport(),
            'Laporan Produk' => $this->getProductsReport(),
            'Laporan Harian' => $this->getDailyReport()
        ];

        return (new FastExcel($sheets))->download($filename);
    }

    /**
     * Get report statistics
     */
    public function getStatistics(): array
    {
        $orders = Order::whereBetween('created_at', [$this->startDate, $this->endDate])->get();

        return [
            'total_orders' => $orders->count(),
            'total_revenue' => $orders->where('status', '!=', 'cancelled')->sum('total_amount'),
            'average_order_value' => $orders->where('status', '!=', 'cancelled')->avg('total_amount'),
            'completed_orders' => $orders->where('status', 'delivered')->count(),
            'pending_orders' => $orders->where('status', 'pending')->count(),
            'cancelled_orders' => $orders->where('status', 'cancelled')->count(),
            'date_range' => [
                'start' => $this->startDate->format('Y-m-d'),
                'end' => $this->endDate->format('Y-m-d')
            ]
        ];
    }
}
