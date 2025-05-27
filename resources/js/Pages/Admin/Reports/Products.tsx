import React from "react";
import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";

interface Product {
    id: number;
    name: string;
    total_sold: number;
    revenue: number;
}

interface ProductsProps extends Record<string, unknown> {
    products: Product[];
    summary: {
        total_products: number | null;
        total_sold_items: number | null;
        total_revenue: number | null;
    };
    error?: string;
}

export default function Products() {
    // Ambil props dari backend
    const { products = [], summary = { total_products: null, total_sold_items: null, total_revenue: null }, error } = usePage<PageProps<ProductsProps>>().props;

    // Helper format rupiah
    const formatRupiah = (value: number | null | undefined) =>
        typeof value === "number"
            ? "Rp " + value.toLocaleString("id-ID")
            : "-";

    const handleExport = () => {
        window.location.href = "/admin/reports/products/export";
    };

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Produk" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Laporan Produk</h1>
                    <button
                        onClick={handleExport}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition"
                    >
                        Export Laporan Produk
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded">
                        {error}
                    </div>
                )}

                {/* Ringkasan Produk */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SummaryCard
                        label="Total Produk"
                        value={summary.total_products}
                    />
                    <SummaryCard
                        label="Total Terjual"
                        value={summary.total_sold_items}
                    />
                    <SummaryCard
                        label="Total Pendapatan"
                        value={summary.total_revenue}
                        isCurrency
                    />
                </div>

                {/* Tabel Produk */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Analisis Produk</h2>
                    <div className="rounded-xl border bg-white p-4 shadow overflow-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b">
                                    <th className="py-2">ID</th>
                                    <th className="py-2">Nama Produk</th>
                                    <th className="py-2">Jumlah Terjual</th>
                                    <th className="py-2">Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-4 text-center text-gray-400">
                                            Tidak ada data produk.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.id} className="border-b">
                                            <td className="py-2">{product.id}</td>
                                            <td className="py-2">{product.name}</td>
                                            <td className="py-2">
                                                {typeof product.total_sold === 'number'
                                                    ? product.total_sold.toLocaleString("id-ID")
                                                    : "-"}
                                            </td>
                                            <td className="py-2">
                                                {formatRupiah(product.revenue)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Komponen kartu ringkasan
function SummaryCard({
    label,
    value,
    isCurrency = false,
}: {
    label: string;
    value: number | null | undefined;
    isCurrency?: boolean;
}) {
    const formatRupiah = (val: number | null | undefined) =>
        typeof val === "number"
            ? "Rp " + val.toLocaleString("id-ID")
            : "-";
    return (
        <div className="rounded-xl border bg-white p-4 shadow">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-xl font-bold">
                {isCurrency ? formatRupiah(value) : (typeof value === "number" ? value.toLocaleString("id-ID") : "-")}
            </div>
        </div>
    );
}
