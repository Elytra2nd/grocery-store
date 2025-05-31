import React from "react";
import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import {
    ShoppingCartIcon,
    CurrencyDollarIcon,
    DocumentTextIcon
} from "@heroicons/react/24/solid";

interface Order {
    id: number;
    total: number;
    status: string;
    created_at: string;
}

interface DailySale {
    date: string;
    total: number;
}

interface SalesProps {
    orders?: {
        data?: Order[];
        links?: any;
        meta?: any;
    };
    summary?: {
        total_orders?: number | null;
        total_revenue?: number | null;
        average_order_value?: number | null;
        completed_orders?: number;
        pending_orders?: number;
        cancelled_orders?: number;
    };
    dailySales?: DailySale[];
    filters?: {
        start_date?: string;
        end_date?: string;
        status?: string;
    };
    statuses?: Record<string, string>;
    error?: string;
    [key: string]: unknown; // Add index signature to satisfy Record<string, unknown>
}

export default function Sales() {
    const { props } = usePage<PageProps<SalesProps>>();
    const {
        orders,
        summary,
        dailySales,
        filters,
        statuses,
        error
    } = props;

    const handleExport = () => {
        if (!filters) return;

        const query = new URLSearchParams({
            startDate: filters.start_date || '',
            endDate: filters.end_date || '',
            status: filters.status || ''
        }).toString();

        window.location.href = `/admin/reports/sales/export?${query}`;
    };

    // Loading state
    if (!orders || !summary || !dailySales || !filters || !statuses) {
        return (
            <AuthenticatedLayout>
                <Head title="Memuat..." />
                <div className="p-6 text-center">Memuat laporan...</div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-amber-900 leading-tight">
                    Laporan
                </h2>
            }
        >
            <Head title="Laporan Penjualan" />

            <div className="py-8 min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold text-amber-900 drop-shadow-sm">
                                Laporan Penjualan
                            </h1>
                            <p className="mt-2 text-amber-700">
                                Analisis detail performa penjualan dan transaksi
                            </p>
                        </div>
                        {/* Export Button Top Right */}
                        <div className="mt-4 sm:mt-0 flex justify-end">
                            <button
                                onClick={handleExport}
                                className="flex items-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <DocumentTextIcon className="w-5 h-5 mr-2" />
                                Export Laporan Penjualan
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg animate-fade-in-up">
                            {error}
                        </div>
                    )}

                    {/* Sales Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div className="relative overflow-hidden rounded-2xl shadow-xl border border-amber-100 bg-white/70 backdrop-blur hover:scale-[1.025] transition-all duration-200 group">
                            <div className="absolute inset-0 z-0 bg-gradient-to-br from-green-400/70 via-amber-200/60 to-amber-100/80 opacity-70 group-hover:opacity-90 transition-all duration-300" />
                            <div className="relative z-10 p-6 flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-xl bg-white/50 flex items-center justify-center shadow">
                                    <ShoppingCartIcon className="h-7 w-7 text-amber-700" />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-amber-700 uppercase">Total Pesanan</div>
                                    <div className="text-2xl font-extrabold text-amber-900">
                                        {summary.total_orders?.toLocaleString() ?? '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total Revenue Card */}
                        <div className="relative overflow-hidden rounded-2xl shadow-xl border border-amber-100 bg-white/70 backdrop-blur hover:scale-[1.025] transition-all duration-200 group">
                            <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-400/70 via-amber-200/60 to-amber-100/80 opacity-70 group-hover:opacity-90 transition-all duration-300" />
                            <div className="relative z-10 p-6 flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-xl bg-white/50 flex items-center justify-center shadow">
                                    <CurrencyDollarIcon className="h-7 w-7 text-amber-700" />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-amber-700 uppercase">Total Pendapatan</div>
                                    <div className="text-2xl font-extrabold text-amber-900">
                                        Rp {summary.total_revenue?.toLocaleString() ?? '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Average Order Value Card */}
                        <div className="relative overflow-hidden rounded-2xl shadow-xl border border-amber-100 bg-white/70 backdrop-blur hover:scale-[1.025] transition-all duration-200 group">
                            <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-400/70 via-amber-200/60 to-amber-100/80 opacity-70 group-hover:opacity-90 transition-all duration-300" />
                            <div className="relative z-10 p-6 flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-xl bg-white/50 flex items-center justify-center shadow">
                                    <DocumentTextIcon className="h-7 w-7 text-amber-700" />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-amber-700 uppercase">Rata-rata Pesanan</div>
                                    <div className="text-2xl font-extrabold text-amber-900">
                                        Rp {summary.average_order_value?.toLocaleString() ?? '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tables */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Daily Sales */}
                        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-amber-100">
                            <div className="px-6 py-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
                                <h3 className="text-lg font-bold text-amber-900">Penjualan Harian</h3>
                            </div>
                            <div className="p-6">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="text-left text-sm text-amber-700 border-b">
                                            <th className="py-3">Tanggal</th>
                                            <th className="py-3">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(dailySales || []).map((sale, index) => (
                                            <tr key={index} className="border-b hover:bg-amber-50 transition-colors">
                                                <td className="py-3 text-amber-900">{sale.date}</td>
                                                <td className="py-3 font-medium text-amber-900">
                                                    Rp {sale.total?.toLocaleString() || '0'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Orders Table */}
                        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-amber-100">
                            <div className="px-6 py-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
                                <h3 className="text-lg font-bold text-amber-900">Daftar Pesanan</h3>
                            </div>
                            <div className="p-6 overflow-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="text-left text-sm text-amber-700 border-b">
                                            <th className="py-3">ID</th>
                                            <th className="py-3">Tanggal</th>
                                            <th className="py-3">Total</th>
                                            <th className="py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(orders.data || []).map((order) => (
                                            <tr key={order.id} className="border-b hover:bg-amber-50 transition-colors">
                                                <td className="py-3 text-amber-900">#{order.id}</td>
                                                <td className="py-3 text-amber-900">{order.created_at}</td>
                                                <td className="py-3 font-medium text-amber-900">
                                                    Rp {order.total?.toLocaleString() || '0'}
                                                </td>
                                                <td className="py-3">
                                                    <span className="capitalize px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm">
                                                        {order.status || 'Unknown'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
