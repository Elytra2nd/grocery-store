import React from "react";
import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";

// Data types
type Customer = {
    id: number;
    name: string;
    email: string;
    created_at: string;
    total_orders: number;
    total_spent: number;
    average_order_value: number;
    last_order_date: string | null;
};

interface CustomersProps extends Record<string, unknown> {
    customers: Customer[];
    summary: {
        total_customers: number | null;
        active_customers: number | null;
        new_customers: number | null;
        repeat_customers: number | null;
    };
    acquisitionTrend: { date: string; new_customers: number }[];
    error?: string;
}

function Customers() {
    // Ambil props dari backend
    const {
        customers = [],
        summary = {
            total_customers: null,
            active_customers: null,
            new_customers: null,
            repeat_customers: null,
        },
        acquisitionTrend = [],
        error,
    } = usePage<PageProps<CustomersProps>>().props;

    // Helper format rupiah
    const formatRupiah = (value: number | null | undefined) =>
        typeof value === "number"
            ? "Rp " + value.toLocaleString("id-ID")
            : "-";

    // Segmentasi perilaku pelanggan
    const segments = { baru: 0, repeat: 0, nonAktif: 0 };
    customers.forEach((c) => {
        if (c.total_orders > 1) segments.repeat++;
        else if (c.total_orders === 1) segments.baru++;
        else segments.nonAktif++;
    });
    const totalSegment = segments.baru + segments.repeat + segments.nonAktif || 1;

    const handleExport = () => {
        window.location.href = "/admin/reports/customers/export";
    };

    return (
        <>
            <Head title="Laporan Pelanggan" />

            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-extrabold text-amber-900 drop-shadow-sm">Laporan Pelanggan</h1>
                    <button
                        onClick={handleExport}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl shadow transition-all duration-150 text-sm font-semibold"
                    >
                        Export Laporan Pelanggan
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded animate-fade-in-up">
                        {error}
                    </div>
                )}

                {/* Ringkasan Pelanggan */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <SummaryCard label="Total Pelanggan" value={summary.total_customers} />
                    <SummaryCard label="Pelanggan Aktif" value={summary.active_customers} />
                    <SummaryCard label="Pelanggan Baru" value={summary.new_customers} />
                    <SummaryCard label="Repeat Order" value={summary.repeat_customers} />
                </div>

                {/* Segmentasi Pelanggan */}
                <div>
                    <h2 className="text-xl font-semibold mb-2 text-amber-900">Analisis Perilaku & Segmentasi Pelanggan</h2>
                    <div className="rounded-xl border border-amber-100 bg-white p-4 shadow">
                        <div className="mb-2 flex items-center gap-4">
                            <div className="flex-1">
                                <div className="h-6 flex rounded overflow-hidden">
                                    <div
                                        className="bg-blue-500"
                                        style={{ width: `${(segments.baru / totalSegment) * 100}%` }}
                                        title={`Baru: ${segments.baru}`}
                                    />
                                    <div
                                        className="bg-green-500"
                                        style={{ width: `${(segments.repeat / totalSegment) * 100}%` }}
                                        title={`Repeat: ${segments.repeat}`}
                                    />
                                    <div
                                        className="bg-gray-400"
                                        style={{ width: `${(segments.nonAktif / totalSegment) * 100}%` }}
                                        title={`Non-aktif: ${segments.nonAktif}`}
                                    />
                                </div>
                                <div className="flex justify-between text-xs mt-1">
                                    <span className="text-blue-600">Baru: {segments.baru}</span>
                                    <span className="text-green-600">Repeat: {segments.repeat}</span>
                                    <span className="text-gray-600">Non-aktif: {segments.nonAktif}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            Segmentasi berdasarkan perilaku order pelanggan dalam sistem.
                        </div>
                    </div>
                </div>

                {/* Tren Akuisisi Pelanggan */}
                <div>
                    <h2 className="text-xl font-semibold mb-2 text-amber-900">Tren Akuisisi Pelanggan Baru (30 Hari Terakhir)</h2>
                    <div className="rounded-xl border border-amber-100 bg-white p-4 shadow overflow-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="text-left text-sm text-amber-700 border-b">
                                    <th className="py-2">Tanggal</th>
                                    <th className="py-2">Pelanggan Baru</th>
                                </tr>
                            </thead>
                            <tbody>
                                {acquisitionTrend.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="py-4 text-center text-gray-400">
                                            Tidak ada data tren akuisisi.
                                        </td>
                                    </tr>
                                ) : (
                                    acquisitionTrend.map((item) => (
                                        <tr key={item.date} className="border-b hover:bg-amber-50 transition-colors duration-150">
                                            <td className="py-2">{item.date}</td>
                                            <td className="py-2">{item.new_customers}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tabel Daftar Pelanggan */}
                <div>
                    <h2 className="text-xl font-semibold mb-2 text-amber-900">Daftar Pelanggan</h2>
                    <div className="rounded-xl border border-amber-100 bg-white p-4 shadow overflow-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="text-left text-sm text-amber-700 border-b">
                                    <th className="py-2">Nama</th>
                                    <th className="py-2">Email</th>
                                    <th className="py-2">Tanggal Daftar</th>
                                    <th className="py-2">Total Order</th>
                                    <th className="py-2">Total Belanja</th>
                                    <th className="py-2">Rata-rata Order</th>
                                    <th className="py-2">Terakhir Order</th>
                                    <th className="py-2">Segmentasi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-4 text-center text-gray-400">
                                            Tidak ada data pelanggan.
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => {
                                        let segment = "Baru";
                                        if (customer.total_orders > 1) segment = "Repeat Order";
                                        else if (customer.total_orders === 1) segment = "Pelanggan Baru";
                                        else segment = "Non-aktif";
                                        return (
                                            <tr key={customer.id} className="border-b hover:bg-amber-50 transition-colors duration-150">
                                                <td className="py-2 text-amber-900 font-medium">{customer.name}</td>
                                                <td className="py-2">{customer.email}</td>
                                                <td className="py-2">{customer.created_at?.slice(0, 10)}</td>
                                                <td className="py-2 text-center">{customer.total_orders}</td>
                                                <td className="py-2 text-right">{formatRupiah(customer.total_spent)}</td>
                                                <td className="py-2 text-right">{formatRupiah(customer.average_order_value)}</td>
                                                <td className="py-2">{customer.last_order_date?.slice(0, 10) ?? "-"}</td>
                                                <td className="py-2">{segment}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

// Komponen kartu ringkasan autumn enchant
function SummaryCard({
    label,
    value,
}: {
    label: string;
    value: number | null | undefined;
}) {
    // Pilih warna autumn berdasarkan label
    const colorMap: Record<string, string> = {
        "Total Pelanggan": "from-amber-400/70 to-orange-100/50",
        "Pelanggan Aktif": "from-orange-400/70 to-yellow-100/50",
        "Pelanggan Baru": "from-blue-400/70 to-blue-100/50",
        "Repeat Order": "from-green-400/70 to-amber-100/50",
    };
    const gradient = colorMap[label] || "from-amber-400/70 to-orange-100/50";

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border border-amber-100 shadow bg-white/70 backdrop-blur group hover:scale-[1.03] hover:shadow-2xl transition-all duration-200`}
        >
            <div className={`absolute inset-0 z-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:opacity-80 transition-all duration-300`} />
            <div className="relative z-10 p-4 flex flex-col items-start">
                <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">{label}</div>
                <div className="text-2xl font-extrabold text-amber-900 drop-shadow">
                    {typeof value === "number"
                        ? value.toLocaleString("id-ID")
                        : "-"}
                </div>
            </div>
        </div>
    );
}

// Deklarasi layout AGAR sidebar tidak double
Customers.layout = (page: React.ReactNode) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

export default Customers;
