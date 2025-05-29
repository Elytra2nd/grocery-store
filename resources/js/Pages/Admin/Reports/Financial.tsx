import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import React, { useRef, useState } from 'react';
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
    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);
    const [exportLoading, setExportLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleDateFilter = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        router.get('/admin/reports/financial', {
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
        });
    };

    const handleResetFilter = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const start_date = firstDay.toISOString().slice(0, 10);
        const end_date = lastDay.toISOString().slice(0, 10);

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

    const handleExport = (reportType: string = 'summary') => {
        setExportLoading(true);
        setShowDropdown(false);
        const params = new URLSearchParams({
            start_date: filters.start_date,
            end_date: filters.end_date,
            report_type: reportType,
        });

        const url = `/admin/reports/export/financial?${params.toString()}`;

        const link = document.createElement('a');
        link.href = url;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => setExportLoading(false), 2000);
    };

    const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Keuangan" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-screen">
                {/* Header Section - DIPERBAIKI: Ukuran lebih kecil */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white rounded-lg shadow-md p-6 border border-amber-200">
                    <div>
                        <h1 className="text-2xl font-semibold text-amber-900 mb-1">Laporan Keuangan</h1>
                        <p className="text-amber-700 text-sm">
                            Periode: {new Date(filters.start_date).toLocaleDateString('id-ID')} - {new Date(filters.end_date).toLocaleDateString('id-ID')}
                        </p>
                    </div>

                    {/* DIPERBAIKI: Export Dropdown dengan z-index yang benar */}
                    <div className="mt-4 sm:mt-0 relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            disabled={exportLoading}
                            className={`px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm ${
                                exportLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {exportLoading ? (
                                <div className="flex items-center space-x-2">
                                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                    </svg>
                                    <span>Mengekspor...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Export Excel</span>
                                    <svg className={`w-4 h-4 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            )}
                        </button>

                        {/* DIPERBAIKI: Dropdown dengan z-index tinggi dan positioning yang benar */}
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                <div className="py-2">
                                    {[
                                        { type: 'summary', icon: '📊', label: 'Ringkasan Keuangan' },
                                        { type: 'detailed', icon: '📋', label: 'Detail Pesanan' },
                                        { type: 'products', icon: '🛍️', label: 'Laporan Produk' },
                                        { type: 'daily', icon: '📅', label: 'Laporan Harian' },
                                        { type: 'multiple', icon: '📑', label: 'Semua Sheet' },
                                        { type: 'styled', icon: '🎨', label: 'Format Premium' }
                                    ].map((item) => (
                                        <button
                                            key={item.type}
                                            onClick={() => handleExport(item.type)}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 transition-colors duration-200 flex items-center space-x-3"
                                        >
                                            <span className="text-base">{item.icon}</span>
                                            <span className="text-gray-700 hover:text-amber-800">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <strong>Error:</strong> {error}
                        </div>
                    </div>
                )}

                {/* DIPERBAIKI: Filter Section dengan z-index rendah */}
                <form onSubmit={handleDateFilter} className="mb-6 bg-white rounded-lg shadow-md p-6 border border-amber-200 relative z-10">
                    <h3 className="text-lg font-semibold text-amber-900 mb-4">Filter Periode</h3>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-sm font-medium text-amber-700 mb-2">Tanggal Mulai</label>
                            <input
                                type="date"
                                name="start_date"
                                defaultValue={filters?.start_date || ''}
                                ref={startDateRef}
                                className="w-full rounded-lg border-amber-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                            />
                        </div>
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-sm font-medium text-amber-700 mb-2">Tanggal Selesai</label>
                            <input
                                type="date"
                                name="end_date"
                                defaultValue={filters?.end_date || ''}
                                ref={endDateRef}
                                className="w-full rounded-lg border-amber-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                            >
                                Terapkan Filter
                            </button>
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-300 text-sm"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </form>

                {/* DIPERBAIKI: Revenue Metrics Cards dengan spacing yang lebih baik */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        {
                            title: 'Pendapatan Kotor',
                            value: safeRevenue.gross_revenue,
                            subtitle: `${safeRevenue.total_orders} pesanan`,
                            icon: (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            ),
                            textColor: 'text-blue-600',
                            iconBg: 'bg-blue-100',
                            borderColor: 'border-blue-500'
                        },
                        {
                            title: 'Pendapatan Bersih',
                            value: safeRevenue.net_revenue,
                            subtitle: 'Setelah refund',
                            icon: (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ),
                            textColor: 'text-emerald-600',
                            iconBg: 'bg-emerald-100',
                            borderColor: 'border-emerald-500'
                        },
                        {
                            title: 'Rata-rata Order',
                            value: safeRevenue.average_order_value,
                            subtitle: 'Per pesanan',
                            icon: (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            ),
                            textColor: 'text-purple-600',
                            iconBg: 'bg-purple-100',
                            borderColor: 'border-purple-500'
                        },
                        {
                            title: 'Pertumbuhan',
                            value: safeRevenue.growth_rate,
                            subtitle: 'Vs bulan lalu',
                            icon: (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                                        safeRevenue.growth_rate >= 0
                                            ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                            : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                                    } />
                                </svg>
                            ),
                            textColor: safeRevenue.growth_rate >= 0 ? 'text-green-600' : 'text-red-600',
                            iconBg: safeRevenue.growth_rate >= 0 ? 'bg-green-100' : 'bg-red-100',
                            borderColor: safeRevenue.growth_rate >= 0 ? 'border-green-500' : 'border-red-500',
                            isPercentage: true
                        }
                    ].map((metric, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border-l-4 ${metric.borderColor}`}
                        >
                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold mb-2 text-gray-700 truncate">
                                            {metric.title}
                                        </h3>
                                        <p className={`text-xl font-bold ${metric.textColor} mb-1`}>
                                            {metric.isPercentage
                                                ? `${metric.value >= 0 ? '+' : ''}${metric.value.toFixed(1)}%`
                                                : formatCurrency(metric.value)
                                            }
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {metric.subtitle}
                                        </p>
                                    </div>
                                    {/* DIPERBAIKI: Icon dengan spacing yang lebih baik */}
                                    <div className={`w-12 h-12 ${metric.iconBg} rounded-lg flex items-center justify-center ${metric.textColor} ml-4 flex-shrink-0`}>
                                        {metric.icon}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Revenue Chart - DIPERBAIKI: Ukuran lebih kecil */}
                <div className="bg-white rounded-lg shadow-md mb-8 border border-amber-200">
                    <div className="p-6">
                        <h3 className="text-xl font-semibold mb-4 text-amber-900">Trend Pendapatan Harian</h3>
                        {safeDailyRevenue.length > 0 ? (
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={safeDailyRevenue}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={formatChartDate}
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            stroke="#9ca3af"
                                        />
                                        <YAxis
                                            tickFormatter={value => formatCurrency(value)}
                                            width={120}
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            stroke="#9ca3af"
                                        />
                                        <Tooltip
                                            formatter={(value: number, name: string) => [
                                                name === 'revenue' ? formatCurrency(value) : value,
                                                name === 'revenue' ? 'Pendapatan' : 'Pesanan'
                                            ]}
                                            labelFormatter={(label) => `Tanggal: ${formatChartDate(label)}`}
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#3b82f6' }}
                                            activeDot={{ r: 8, fill: '#1d4ed8' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-72 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <p className="text-lg mb-2">Tidak ada data pendapatan</p>
                                    <p className="text-sm">Silakan ubah rentang tanggal</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Revenue by Category */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Table */}
                    <div className="bg-white rounded-lg shadow-md border border-amber-200">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-4 text-amber-900">Pendapatan per Kategori</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-amber-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                                                Kategori
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-amber-700 uppercase tracking-wider">
                                                Pendapatan
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-amber-700 uppercase tracking-wider">
                                                %
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {safeRevenueByCategory.length > 0 ? (
                                            safeRevenueByCategory.map((item, index) => {
                                                const totalRevenue = safeRevenueByCategory.reduce((sum, cat) => sum + cat.revenue, 0);
                                                const percentage = totalRevenue > 0 ? (item.revenue / totalRevenue * 100).toFixed(1) : '0';

                                                return (
                                                    <tr key={index} className="hover:bg-amber-50 transition-colors duration-200">
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            <div className="flex items-center">
                                                                <div
                                                                    className="w-3 h-3 rounded-full mr-3"
                                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                                ></div>
                                                                {item.category}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-semibold">
                                                            {formatCurrency(item.revenue)}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                                                            {percentage}%
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={3}
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
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white rounded-lg shadow-md border border-amber-200">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-4 text-amber-900">Distribusi Pendapatan</h3>
                            {safeRevenueByCategory.length > 0 ? (
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={safeRevenueByCategory}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="revenue"
                                            >
                                                {safeRevenueByCategory.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-72 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                                    <div className="text-center">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                        <p>Tidak ada data untuk ditampilkan</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Overlay untuk menutup dropdown ketika klik di luar */}
                {showDropdown && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                    ></div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
