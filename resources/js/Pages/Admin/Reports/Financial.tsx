import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import React, { useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface FinancialReportProps extends PageProps {
    revenue: {
        gross_revenue: number;
        net_revenue: number;
        total_orders: number;
        average_order_value: number;
        refunds: number;
        growth_rate: number;
    };
    revenueByCategory: Array<{
        category: string;
        revenue: number;
    }>;
    dailyRevenue: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
    filters: {
        start_date: string;
        end_date: string;
    };
    error?: string;
}

export default function Financial({
    revenue,
    revenueByCategory,
    dailyRevenue,
    filters,
    error
}: FinancialReportProps) {
    // Ref untuk akses langsung nilai input
    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);

    // Handler untuk submit filter tanggal
    const handleDateFilter = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        router.get('/admin/reports/financial', {
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
        });
    };

    // Handler untuk reset filter tanggal
    const handleResetFilter = () => {
        // Default ke awal dan akhir bulan berjalan
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const start_date = firstDay.toISOString().slice(0, 10);
        const end_date = lastDay.toISOString().slice(0, 10);

        // Set nilai input (agar UI ikut berubah)
        if (startDateRef.current) startDateRef.current.value = start_date;
        if (endDateRef.current) endDateRef.current.value = end_date;

        router.get('/admin/reports/financial', {
            start_date,
            end_date,
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(value || 0);
    };

    const formatChartDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short'
        });
    };

    const safeRevenue = {
        gross_revenue: revenue?.gross_revenue || 0,
        net_revenue: revenue?.net_revenue || 0,
        total_orders: revenue?.total_orders || 0,
        average_order_value: revenue?.average_order_value || 0,
        refunds: revenue?.refunds || 0,
        growth_rate: revenue?.growth_rate || 0,
    };

    const safeDailyRevenue = Array.isArray(dailyRevenue) ? dailyRevenue : [];
    const safeRevenueByCategory = Array.isArray(revenueByCategory) ? revenueByCategory : [];

    const handleExport = () => {
        const params = new URLSearchParams({
            start_date: filters.start_date,
            end_date: filters.end_date,
        });
        window.location.href = `/admin/reports/export/financial?${params.toString()}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Keuangan" />
            
            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                        Export Excel
                    </button>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Filter Section */}
                <form onSubmit={handleDateFilter} className="mb-8 flex gap-4 flex-wrap bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Mulai:</label>
                        <input
                            type="date"
                            name="start_date"
                            defaultValue={filters?.start_date || ''}
                            ref={startDateRef}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Sampai:</label>
                        <input
                            type="date"
                            name="end_date"
                            defaultValue={filters?.end_date || ''}
                            ref={endDateRef}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Terapkan Filter
                    </button>
                    <button
                        type="button"
                        onClick={handleResetFilter}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Reset
                    </button>
                </form>

                {/* Revenue Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">Pendapatan Kotor</h3>
                        <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(safeRevenue.gross_revenue)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {safeRevenue.total_orders} pesanan
                        </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">Pendapatan Bersih</h3>
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(safeRevenue.net_revenue)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Setelah refund
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">Rata-rata Order</h3>
                        <p className="text-2xl font-bold text-purple-600">
                            {formatCurrency(safeRevenue.average_order_value)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Per pesanan
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">Pertumbuhan</h3>
                        <p className={`text-2xl font-bold ${
                            safeRevenue.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {safeRevenue.growth_rate >= 0 ? '+' : ''}{safeRevenue.growth_rate.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Vs bulan lalu
                        </p>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Trend Pendapatan Harian</h3>
                    {safeDailyRevenue.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={safeDailyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={formatChartDate}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis 
                                        tickFormatter={value => formatCurrency(value)}
                                        width={120}
                                    />
                                    <Tooltip 
                                        formatter={(value: number, name: string) => [
                                            name === 'revenue' ? formatCurrency(value) : value,
                                            name === 'revenue' ? 'Pendapatan' : 'Pesanan'
                                        ]}
                                        labelFormatter={(label) => `Tanggal: ${formatChartDate(label)}`}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <p className="text-lg mb-2">Tidak ada data pendapatan</p>
                                <p className="text-sm">Silakan ubah rentang tanggal</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Revenue by Category */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Table */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Pendapatan per Kategori</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kategori
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pendapatan
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {safeRevenueByCategory.length > 0 ? (
                                        safeRevenueByCategory.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {item.category}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-semibold">
                                                    {formatCurrency(item.revenue)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td 
                                                colSpan={2} 
                                                className="px-4 py-8 text-center text-gray-500"
                                            >
                                                Tidak ada data kategori
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Chart Kategori</h3>
                        {safeRevenueByCategory.length > 0 ? (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={safeRevenueByCategory} layout="horizontal">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            type="number"
                                            tickFormatter={value => formatCurrency(value)}
                                            width={100}
                                        />
                                        <YAxis 
                                            type="category"
                                            dataKey="category"
                                            width={100}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <Tooltip 
                                            formatter={(value: number) => [
                                                formatCurrency(value),
                                                'Pendapatan'
                                            ]}
                                        />
                                        <Bar
                                            dataKey="revenue"
                                            fill="#8b5cf6"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-80 flex items-center justify-center text-gray-500">
                                <p>Tidak ada data untuk ditampilkan</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
