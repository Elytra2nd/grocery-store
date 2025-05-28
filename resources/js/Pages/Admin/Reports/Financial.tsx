import { Head, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import React from 'react';
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
    const handleDateFilter = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        router.get('/Admin/Reports/Financial', {
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Keuangan" />
            
            <div className="py-6 px-4 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Filter Section */}
                <form onSubmit={handleDateFilter} className="mb-8 flex gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <label>Mulai:</label>
                        <input
                            type="date"
                            name="start_date"
                            defaultValue={filters.start_date}
                            className="rounded-md border-gray-300"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label>Sampai:</label>
                        <input
                            type="date"
                            name="end_date"
                            defaultValue={filters.end_date}
                            className="rounded-md border-gray-300"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Filter
                    </button>
                </form>

                {/* Revenue Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Pendapatan Kotor</h3>
                        <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(revenue.gross_revenue)}
                        </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Pendapatan Bersih</h3>
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(revenue.net_revenue)}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Pertumbuhan</h3>
                        <p className={`text-2xl font-bold ${
                            revenue.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {revenue.growth_rate.toFixed(1)}%
                        </p>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h3 className="text-xl font-semibold mb-4">Pendapatan Harian</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis 
                                    tickFormatter={value => `Rp${value / 1000000}jt`}
                                    width={90}
                                />
                                <Tooltip 
                                    formatter={(value: number) => [
                                        formatCurrency(value),
                                        'Pendapatan'
                                    ]}
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
                </div>

                {/* Revenue by Category */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Pendapatan per Kategori</h3>
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
                                {revenueByCategory.length > 0 ? (
                                    revenueByCategory.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.category}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                                                {formatCurrency(item.revenue)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td 
                                            colSpan={2} 
                                            className="px-4 py-4 text-center text-gray-500"
                                        >
                                            Tidak ada data
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
