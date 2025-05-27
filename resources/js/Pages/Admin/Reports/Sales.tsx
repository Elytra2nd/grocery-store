import React from "react";
import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";

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

interface SalesProps extends Record<string, unknown> {
    orders: {
        data: Order[];
        links: any;
        meta: any;
    };
    summary: {
        total_orders: number | null;
        total_revenue: number | null;
        average_order_value: number | null;
        completed_orders: number;
        pending_orders: number;
        cancelled_orders: number;
    };
    dailySales: DailySale[];
    filters: {
        start_date: string;
        end_date: string;
        status: string;
    };
    statuses: Record<string, string>;
    error?: string;
}

export default function Sales() {
    const {
        orders,
        summary,
        dailySales,
        filters,
        statuses,
        error,
    } = usePage<PageProps<SalesProps>>().props;

    const handleExport = () => {
        const query = new URLSearchParams({
            startDate: filters.start_date,
            endDate: filters.end_date,
            status: filters.status,
        }).toString();

        window.location.href = `/admin/reports/sales/export?${query}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Penjualan" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Laporan Penjualan</h1>
                    <button
                        onClick={handleExport}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
                    >
                        Export Laporan Penjualan
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded">
                        {error}
                    </div>
                )}

                {/* Ringkasan Penjualan */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border bg-white p-4 shadow">
                        <div className="text-sm text-gray-500">Total Pesanan</div>
                        <div className="text-xl font-bold">
                            {summary.total_orders ?? '-'}
                        </div>
                    </div>
                    <div className="rounded-xl border bg-white p-4 shadow">
                        <div className="text-sm text-gray-500">Total Pendapatan</div>
                        <div className="text-xl font-bold">
                            Rp {summary.total_revenue != null ? summary.total_revenue.toLocaleString() : '-'}
                        </div>
                    </div>
                    <div className="rounded-xl border bg-white p-4 shadow">
                        <div className="text-sm text-gray-500">Rata-rata per Pesanan</div>
                        <div className="text-xl font-bold">
                            Rp {summary.average_order_value != null ? summary.average_order_value.toLocaleString() : '-'}
                        </div>
                    </div>
                </div>

                {/* Penjualan Harian */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Penjualan Harian</h2>
                    <div className="rounded-xl border bg-white p-4 shadow">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b">
                                    <th className="py-2">Tanggal</th>
                                    <th className="py-2">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailySales.map((sale, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-2">{sale.date}</td>
                                        <td className="py-2">Rp {sale.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tabel Data Pesanan */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Daftar Pesanan</h2>
                    <div className="rounded-xl border bg-white p-4 shadow overflow-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b">
                                    <th className="py-2">ID</th>
                                    <th className="py-2">Tanggal</th>
                                    <th className="py-2">Total</th>
                                    <th className="py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.data.map((order) => (
                                    <tr key={order.id} className="border-b">
                                        <td className="py-2">{order.id}</td>
                                        <td className="py-2">{order.created_at}</td>
                                        <td className="py-2">Rp {order.total.toLocaleString()}</td>
                                        <td className="py-2 capitalize">{order.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
