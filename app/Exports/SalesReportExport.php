<?php
// app/Exports/SalesReportExport.php

namespace App\Exports;

use App\Models\Order;
use Rap2hpoutre\FastExcel\FastExcel;
use Carbon\Carbon;

class SalesReportExport
{
    protected $startDate;
    protected $endDate;
    protected $status;

    public function __construct($startDate, $endDate, $status = 'all')
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->status = $status;
    }

    public function export()
    {
        $query = Order::with(['user', 'orderItems.product'])
            ->whereBetween('created_at', [$this->startDate, $this->endDate]);

        if ($this->status !== 'all') {
            $query->where('status', $this->status);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        $data = $orders->map(function ($order) {
            return [
                'No Pesanan' => $order->order_number,
                'Nama Pelanggan' => $order->user->name ?? 'N/A',
                'Email' => $order->user->email ?? 'N/A',
                'Telepon' => $order->user->phone ?? 'N/A',
                'Total Amount' => 'Rp ' . number_format($order->total_amount, 0, ',', '.'),
                'Status' => ucfirst($order->status),
                'Metode Pembayaran' => $order->payment_method ?? 'N/A',
                'Jumlah Item' => $order->orderItems->count(),
                'Tanggal Pesanan' => $order->created_at->format('d/m/Y H:i:s'),
                'Tanggal Selesai' => $order->completed_at ? $order->completed_at->format('d/m/Y H:i:s') : 'N/A',
                'Catatan' => $order->notes ?? 'N/A'
            ];
        });

        $filename = 'sales_report_' . $this->startDate . '_to_' . $this->endDate . '.xlsx';

        return (new FastExcel($data))->download($filename);
    }

    public function exportToStorage()
    {
        // Export ke storage tanpa download
        $filename = 'sales_report_' . $this->startDate . '_to_' . $this->endDate . '.xlsx';
        $path = storage_path('app/exports/' . $filename);

        // Pastikan folder exists
        if (!file_exists(storage_path('app/exports'))) {
            mkdir(storage_path('app/exports'), 0755, true);
        }

        return (new FastExcel($this->getData()))->export($path);
    }

    private function getData()
    {
        $query = Order::with(['user', 'orderItems.product'])
            ->whereBetween('created_at', [$this->startDate, $this->endDate]);

        if ($this->status !== 'all') {
            $query->where('status', $this->status);
        }

        return $query->orderBy('created_at', 'desc')->get()->map(function ($order) {
            return [
                'No Pesanan' => $order->order_number,
                'Nama Pelanggan' => $order->user->name ?? 'N/A',
                'Email' => $order->user->email ?? 'N/A',
                'Total Amount' => $order->total_amount,
                'Status' => ucfirst($order->status),
                'Tanggal Pesanan' => $order->created_at->format('d/m/Y H:i:s'),
            ];
        });
    }
}
