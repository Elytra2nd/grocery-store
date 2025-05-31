import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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

    const handleExport = () => {
        const params = new URLSearchParams({
            start_date: filters.start_date,
            end_date: filters.end_date,
        });
        window.location.href = `/admin/reports/export/financial?${params.toString()}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-amber-900 leading-tight">
                    Laporan
                </h2>
            }
        >
            <Head title="Laporan Keuangan" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-screen">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-light text-amber-900">Laporan Keuangan</h1>
                    <button
                        onClick={handleExport}
                        className="group px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Export Excel</span>
                        </div>
                    </button>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded animate-shake">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Filter Section */}
                <form onSubmit={handleDateFilter} className="mb-8 flex gap-4 flex-wrap bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-amber-200">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-amber-700">Mulai:</label>
                        <input
                            type="date"
                            name="start_date"
                            defaultValue={filters?.start_date || ''}
                            ref={startDateRef}
                            className="rounded-lg border-amber-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 transition-all duration-200"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-amber-700">Sampai:</label>
                        <input
                            type="date"
                            name="end_date"
                            defaultValue={filters?.end_date || ''}
                            ref={endDateRef}
                            className="rounded-lg border-amber-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 transition-all duration-200"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                        Terapkan Filter
                    </button>
                    <button
                        type="button"
                        onClick={handleResetFilter}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-300"
                    >
                        Reset
                    </button>
                </form>

                {/* Enhanced Revenue Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        {
                            id: 'gross',
                            title: 'Pendapatan Kotor',
                            value: safeRevenue.gross_revenue,
                            subtitle: `${safeRevenue.total_orders} pesanan`,
                            color: 'blue',
                            bgGradient: 'from-blue-500 to-blue-600',
                            icon: '💰'
                        },
                        {
                            id: 'net',
                            title: 'Pendapatan Bersih',
                            value: safeRevenue.net_revenue,
                            subtitle: 'Setelah refund',
                            color: 'green',
                            bgGradient: 'from-green-500 to-green-600',
                            icon: '✅'
                        },
                        {
                            id: 'average',
                            title: 'Rata-rata Order',
                            value: safeRevenue.average_order_value,
                            subtitle: 'Per pesanan',
                            color: 'purple',
                            bgGradient: 'from-purple-500 to-purple-600',
                            icon: '📊'
                        },
                        {
                            id: 'growth',
                            title: 'Pertumbuhan',
                            value: safeRevenue.growth_rate,
                            subtitle: 'Vs bulan lalu',
                            color: safeRevenue.growth_rate >= 0 ? 'green' : 'red',
                            bgGradient: safeRevenue.growth_rate >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600',
                            icon: safeRevenue.growth_rate >= 0 ? '📈' : '📉',
                            isPercentage: true
                        }
                    ].map((metric, index) => (
                        <div
                            key={metric.id}
                            className={`group relative bg-white rounded-xl shadow-lg border-l-4 border-${metric.color}-500 overflow-hidden transition-all duration-500 hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 cursor-pointer ${hoveredCard === metric.id ? 'ring-4 ring-amber-300/50' : ''
                                }`}
                            onMouseEnter={() => setHoveredCard(metric.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            style={{
                                animationDelay: `${index * 100}ms`
                            }}
                        >
                            {/* Animated background gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${metric.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                            {/* Shimmer effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                            <div className="relative p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-2xl animate-bounce">{metric.icon}</span>
                                            <h3 className="text-lg font-semibold text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                                                {metric.title}
                                            </h3>
                                        </div>
                                        <p className={`text-2xl font-bold text-${metric.color}-600 transition-all duration-300 group-hover:scale-110`}>
                                            {metric.isPercentage
                                                ? `${metric.value >= 0 ? '+' : ''}${metric.value.toFixed(1)}%`
                                                : formatCurrency(metric.value)
                                            }
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-300">
                                            {metric.subtitle}
                                        </p>
                                    </div>
                                </div>

                                {/* Animated progress bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${metric.bgGradient} rounded-full transition-all duration-1000 ease-out transform ${hoveredCard === metric.id ? 'translate-x-0 scale-x-100' : 'translate-x-[-20%] scale-x-75'
                                            }`}
                                        style={{
                                            width: hoveredCard === metric.id ? '100%' : '70%'
                                        }}
                                    ></div>
                                </div>

                                {/* Floating particles effect */}
                                {hoveredCard === metric.id && (
                                    <>
                                        <div className="absolute top-4 right-4 w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>
                                        <div className="absolute top-8 right-8 w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
                                        <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce"></div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Enhanced Revenue Chart */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg mb-8 border border-amber-200 overflow-hidden transition-all duration-500 hover:shadow-xl">
                    <div className="p-6">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                            <span className="text-2xl mr-3 animate-pulse">📈</span>
                            Trend Pendapatan Harian
                        </h3>
                        {safeDailyRevenue.length > 0 ? (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={safeDailyRevenue}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#D97706" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#D97706" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={formatChartDate}
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                        />
                                        <YAxis
                                            tickFormatter={value => formatCurrency(value)}
                                            width={120}
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                        />
                                        <Tooltip
                                            formatter={(value: number, name: string) => [
                                                name === 'revenue' ? formatCurrency(value) : value,
                                                name === 'revenue' ? 'Pendapatan' : 'Pesanan'
                                            ]}
                                            labelFormatter={(label) => `Tanggal: ${formatChartDate(label)}`}
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#D97706"
                                            strokeWidth={3}
                                            dot={{ r: 5, fill: '#D97706' }}
                                            activeDot={{ r: 8, fill: '#B45309' }}
                                            fill="url(#colorRevenue)"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-80 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                                <div className="text-center animate-pulse">
                                    <p className="text-lg mb-2">Tidak ada data pendapatan</p>
                                    <p className="text-sm">Silakan ubah rentang tanggal</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Revenue by Category */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Enhanced Table */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200 overflow-hidden transition-all duration-500 hover:shadow-xl">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                                <span className="text-2xl mr-3">🏷️</span>
                                Pendapatan per Kategori
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                                                Kategori
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-amber-700 uppercase tracking-wider">
                                                Pendapatan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {safeRevenueByCategory.length > 0 ? (
                                            safeRevenueByCategory.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-amber-50 transition-all duration-300 group cursor-pointer transform hover:scale-[1.02]"
                                                    style={{
                                                        animationDelay: `${index * 50}ms`
                                                    }}
                                                >
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 group-hover:text-amber-800 transition-colors duration-300">
                                                        {item.category}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-semibold group-hover:text-amber-800 transition-colors duration-300">
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
                    </div>

                    {/* Enhanced Chart */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200 overflow-hidden transition-all duration-500 hover:shadow-xl">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                                <span className="text-2xl mr-3">📊</span>
                                Chart Kategori
                            </h3>
                            {safeRevenueByCategory.length > 0 ? (
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={safeRevenueByCategory} layout="horizontal">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                            <XAxis
                                                type="number"
                                                tickFormatter={value => formatCurrency(value)}
                                                width={100}
                                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="category"
                                                width={100}
                                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                            />
                                            <Tooltip
                                                formatter={(value: number) => [
                                                    formatCurrency(value),
                                                    'Pendapatan'
                                                ]}
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                                                }}
                                            />
                                            <Bar
                                                dataKey="revenue"
                                                fill="url(#barGradient)"
                                                radius={[0, 4, 4, 0]}
                                            />
                                            <defs>
                                                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.6} />
                                                </linearGradient>
                                            </defs>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-80 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                                    <p className="animate-pulse">Tidak ada data untuk ditampilkan</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom CSS untuk animasi tambahan */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .grid > div {
                    animation: slideInUp 0.6s ease-out forwards;
                    opacity: 0;
                }

                .grid > div:nth-child(1) { animation-delay: 0.1s; }
                .grid > div:nth-child(2) { animation-delay: 0.2s; }
                .grid > div:nth-child(3) { animation-delay: 0.3s; }
                .grid > div:nth-child(4) { animation-delay: 0.4s; }
            `}</style>
        </AuthenticatedLayout>
    );
}
