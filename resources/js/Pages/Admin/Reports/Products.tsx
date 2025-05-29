import React from "react";
import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { DocumentTextIcon } from "@heroicons/react/24/solid";

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
    const {
        products = [],
        summary = {
            total_products: null,
            total_sold_items: null,
            total_revenue: null,
        },
        error,
    } = usePage<PageProps<ProductsProps>>().props;

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
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-extrabold text-amber-900 drop-shadow-sm">
                        Laporan Produk
                    </h1>
                    <button
                        onClick={handleExport}
                        className="flex items-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold"
                    >
                        <DocumentTextIcon className="w-5 h-5 mr-2" />
                        Export Laporan Produk
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded animate-fade-in-up">
                        {error}
                    </div>
                )}

                {/* Ringkasan Produk */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SummaryCard label="Total Produk" value={summary.total_products} />
                    <SummaryCard label="Total Terjual" value={summary.total_sold_items} />
                    <SummaryCard
                        label="Total Pendapatan"
                        value={summary.total_revenue}
                        isCurrency
                    />
                </div>

                {/* Tabel Produk */}
                <div>
                    <h2 className="text-xl font-semibold mb-2 text-amber-900">Analisis Produk</h2>
                    <div className="rounded-xl border border-amber-100 bg-white p-4 shadow overflow-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="text-left text-sm text-amber-700 border-b">
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
                                        <tr
                                            key={product.id}
                                            className="border-b hover:bg-amber-50 transition-colors duration-150"
                                        >
                                            <td className="py-2">{product.id}</td>
                                            <td className="py-2 text-amber-900 font-medium">
                                                {product.name}
                                            </td>
                                            <td className="py-2">
                                                {typeof product.total_sold === "number"
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

    const colorMap: Record<string, string> = {
        "Total Produk": "from-amber-400/70 to-orange-100/50",
        "Total Terjual": "from-orange-400/70 to-yellow-100/50",
        "Total Pendapatan": "from-green-400/70 to-amber-100/50",
    };
    const gradient = colorMap[label] || "from-amber-400/70 to-orange-100/50";

    return (
        <div className="relative overflow-hidden rounded-2xl border border-amber-100 shadow bg-white/70 backdrop-blur group hover:scale-[1.03] hover:shadow-2xl transition-all duration-200">
            <div
                className={`absolute inset-0 z-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:opacity-80 transition-all duration-300`}
            />
            <div className="relative z-10 p-4 flex flex-col items-start">
                <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                    {label}
                </div>
                <div className="text-2xl font-extrabold text-amber-900 drop-shadow">
                    {isCurrency
                        ? formatRupiah(value)
                        : typeof value === "number"
                        ? value.toLocaleString("id-ID")
                        : "-"}
                </div>
            </div>
        </div>
    );
}
