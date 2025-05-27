import React from "react";
import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";

interface Product {
    id: number;
    name: string;
    stock: number;
    total_sold: number;
    revenue: number;
}

interface Summary {
    total_products: number;
    total_sold_items: number;
    total_revenue: number;
}

interface ProductReportProps extends Record<string, unknown> {
    products: Product[];
    summary: Summary;
}

export default function Products() {
    const {
        products = [],
        summary: rawSummary = {} as Summary,
    } = usePage<PageProps<ProductReportProps>>().props;

    const summary: Summary = {
        total_products: rawSummary.total_products ?? 0,
        total_sold_items: rawSummary.total_sold_items ?? 0,
        total_revenue: rawSummary.total_revenue ?? 0,
    };

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Performa Produk & Inventori" />

            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold">Laporan Produk</h1>

                {/* Performa Produk */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border bg-white p-4 shadow">
                        <div className="text-sm text-gray-500">Total Produk</div>
                        <div className="text-xl font-bold">{summary.total_products}</div>
                    </div>
                    <div className="rounded-xl border bg-white p-4 shadow">
                        <div className="text-sm text-gray-500">Total Terjual</div>
                        <div className="text-xl font-bold">{summary.total_sold_items}</div>
                    </div>
                    <div className="rounded-xl border bg-white p-4 shadow">
                        <div className="text-sm text-gray-500">Total Pendapatan</div>
                        <div className="text-xl font-bold">
                            Rp {summary.total_revenue.toLocaleString("id-ID")}
                        </div>
                    </div>
                </div>

                {/* Analisis Inventori */}
                <div>
                    <h2 className="text-xl font-semibold mt-6 mb-2">Analisis Inventori</h2>
                    <div className="rounded-xl border bg-white p-4 shadow overflow-auto">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b">
                                    <th className="py-2">Nama Produk</th>
                                    <th className="py-2">Stok</th>
                                    <th className="py-2">Terjual</th>
                                    <th className="py-2">Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <tr key={product.id} className="border-b">
                                            <td className="py-2">{product.name}</td>
                                            <td className="py-2">{product.stock}</td>
                                            <td className="py-2">{product.total_sold}</td>
                                            <td className="py-2">
                                                Rp {product.revenue.toLocaleString("id-ID")}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="py-4 text-center" colSpan={4}>
                                            Tidak ada data produk.
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
