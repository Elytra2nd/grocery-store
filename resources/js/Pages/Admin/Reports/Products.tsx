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
    const { products, summary, error } = usePage<PageProps<ProductsProps>>().props;

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
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
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
                    <div className="rounded-xl border bg-white p-4 shadow">
                        <div className="text-sm text-gray-500">Total Produk</div>
                        <div className="text-xl font-bold">
                            {summary.total_products != null
                                ? summary.total_products.toLocaleString()
                                : "-"}
                        </div>
                    </div>
                    <div className="rounded-xl border bg-white p-4 shadow">
                        <div className="text-sm text-gray-500">Total Terjual</div>
                        <div className="text-xl font-bold">
                            {summary.total_sold_items != null
                                ? summary.total_sold_items.toLocaleString()
                                : "-"}
                        </div>
                    </div>
                    <div className="rounded-xl border bg-white p-4 shadow">
                        <div className="text-sm text-gray-500">Total Pendapatan</div>
                        <div className="text-xl font-bold">
                            Rp{" "}
                            {summary.total_revenue != null
                                ? summary.total_revenue.toLocaleString()
                                : "-"}
                        </div>
                    </div>
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
                                {products.map((product) => (
                                    <tr key={product.id} className="border-b">
                                        <td className="py-2">{product.id}</td>
                                        <td className="py-2">{product.name}</td>
                                        <td className="py-2">
                                            {product.total_sold.toLocaleString()}
                                        </td>
                                        <td className="py-2">
                                            Rp {product.revenue.toLocaleString()}
                                        </td>
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
