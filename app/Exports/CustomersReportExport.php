<?php
// app/Exports/CustomersReportExport.php

namespace App\Exports;

use App\Models\User;
use Rap2hpoutre\FastExcel\FastExcel;
use Carbon\Carbon;

class CustomersReportExport
{
    protected $dateRange;
    protected $sortBy;
    protected $sortOrder;

    public function __construct($dateRange = 30, $sortBy = 'created_at', $sortOrder = 'desc')
    {
        $this->dateRange = $dateRange;
        $this->sortBy = $sortBy;
        $this->sortOrder = $sortOrder;
    }

    public function export()
    {
        $users = User::role('buyer')
            ->with(['orders'])
            ->withCount('orders')
            ->withSum('orders', 'total_amount')
            ->withMax('orders', 'created_at')
            ->orderBy($this->sortBy, $this->sortOrder)
            ->get();

        $data = $users->map(function ($user) {
            $totalSpent = $user->orders_sum_total_amount ?? 0;
            $totalOrders = $user->orders_count ?? 0;
            $avgOrderValue = $totalOrders > 0 ? $totalSpent / $totalOrders : 0;

            // Customer segmentation
            $segment = 'New';
            if ($totalOrders >= 10 && $totalSpent >= 1000000) {
                $segment = 'VIP';
            } elseif ($totalOrders >= 5 && $totalSpent >= 500000) {
                $segment = 'Regular';
            } elseif ($totalOrders >= 1) {
                $segment = 'Active';
            }

            return [
                'Nama Pelanggan' => $user->name,
                'Email' => $user->email,
                'Telepon' => $user->phone ?? 'N/A',
                'Alamat' => $user->address ?? 'N/A',
                'Total Pesanan' => $totalOrders,
                'Total Belanja' => 'Rp ' . number_format($totalSpent, 0, ',', '.'),
                'Rata-rata Nilai Pesanan' => 'Rp ' . number_format($avgOrderValue, 0, ',', '.'),
                'Segmen Pelanggan' => $segment,
                'Tanggal Daftar' => $user->created_at->format('d/m/Y H:i:s'),
                'Terakhir Login' => $user->last_login_at ? $user->last_login_at->format('d/m/Y H:i:s') : 'Belum pernah',
                'Terakhir Pesan' => $user->orders_max_created_at ? Carbon::parse($user->orders_max_created_at)->format('d/m/Y H:i:s') : 'Belum pernah',
                'Email Verified' => $user->email_verified_at ? 'Ya' : 'Tidak',
                'Status' => $user->is_active ? 'Aktif' : 'Nonaktif'
            ];
        });

        $filename = 'customers_report_' . date('Y-m-d') . '.xlsx';

        return (new FastExcel($data))->download($filename);
    }
}
