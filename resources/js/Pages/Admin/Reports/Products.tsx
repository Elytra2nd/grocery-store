import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { DocumentTextIcon, FunnelIcon } from "@heroicons/react/24/solid";

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    is_active: boolean;
    category_name: string | null;
    total_sold: number;
    revenue: number;
}

interface ProductsProps extends PageProps {
    products: Product[];
    summary: {
        total_products: number;
        total_sold_items: number;
        total_revenue: number;
        active_products: number;
        low_stock_products: number;
    };
    categories: string[];
    filters: {
        start_date?: string;
        end_date?: string;
        category: string;
    };
    error?: string;
}

export default function Products({
    products = [],
    summary = {
        total_products: 0,
        total_sold_items: 0,
        total_revenue: 0,
        active_products: 0,
        low_stock_products: 0,
    },
    categories = [],
    filters = { category: 'all' },
    error,
}: ProductsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // DIPERBAIKI: Safe summary dengan fallback values sesuai backend
    const safeSummary = {
        total_products: summary?.total_products ?? 0,
        total_sold_items: summary?.total_sold_items ?? 0,
        total_revenue: summary?.total_revenue ?? 0,
        active_products: summary?.active_products ?? 0,
        low_stock_products: summary?.low_stock_products ?? 0,
    };

    // DIPERBAIKI: Format currency yang robust sesuai backend
    const formatRupiah = (value: number | null | undefined) => {
        if (typeof value !== "number" || isNaN(value)) {
            return "Rp 0";
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    // DIPERBAIKI: Format number yang robust
    const formatNumber = (value: number | null | undefined) => {
        if (typeof value !== "number" || isNaN(value)) {
            return "0";
        }
        return new Intl.NumberFormat('id-ID').format(value);
    };

    // DIPERBAIKI: Handle filter sesuai backend endpoint
    const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        router.get('/admin/reports/products', {
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
            category: formData.get('category'),
        }, {
            onFinish: () => setIsLoading(false),
            preserveScroll: true,
        });
    };

    // DIPERBAIKI: Handle reset sesuai backend
    const handleReset = () => {
        setIsLoading(true);
        router.get('/admin/reports/products', {}, {
            onFinish: () => setIsLoading(false),
            preserveScroll: true,
        });
    };

    // DIPERBAIKI: Handle export sesuai backend route
    const handleExport = () => {
        setIsLoading(true);
        const params = new URLSearchParams({
            start_date: filters.start_date || '',
            end_date: filters.end_date || '',
            category: filters.category || 'all',
        });

        // Create download link
        const link = document.createElement('a');
        link.href = `/admin/reports/export/products?${params.toString()}`;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <AuthenticatedLayout>
            <Head title ="Laporan Produk" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-screen">
                {/* Floating Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-32 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                {/* Header */}
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-amber-900 tracking-wide">
                            Laporan Produk
                        </h1>
                        <div className="w-16 h-0.5 bg-amber-600 mt-2"></div>
                        <p className="text-amber-700 mt-2">
                            Analisis performa produk dan penjualan
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={isLoading}
                        className="group flex items-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-medium hover:scale-105 disabled:opacity-50"
                    >
                        <DocumentTextIcon className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                        {isLoading ? 'Mengekspor...' : 'Export Laporan'}
                    </button>
                </div>

                {error && (
                    <div className="relative z-10 mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-shake">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <strong>Error:</strong> {error}
                        </div>
                    </div>
                )}

                {/* DIPERBAIKI: Filter Section sesuai backend */}
                <form onSubmit={handleFilter} className="relative z-10 mb-8 bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-amber-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FunnelIcon className="w-5 h-5 text-amber-600" />
                        <h3 className="text-lg font-medium text-amber-900">Filter Laporan</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-amber-700 mb-2">Tanggal Mulai</label>
                            <input
                                type="date"
                                name="start_date"
                                defaultValue={filters.start_date || ''}
                                className="w-full rounded-lg border-amber-200 focus:border-amber-500 focus:ring-amber-500 transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-amber-700 mb-2">Tanggal Selesai</label>
                            <input
                                type="date"
                                name="end_date"
                                defaultValue={filters.end_date || ''}
                                className="w-full rounded-lg border-amber-200 focus:border-amber-500 focus:ring-amber-500 transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-amber-700 mb-2">Kategori</label>
                            <select
                                name="category"
                                defaultValue={filters.category}
                                className="w-full rounded-lg border-amber-200 focus:border-amber-500 focus:ring-amber-500 transition-colors duration-200"
                            >
                                <option value="all">Semua Kategori</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-all duration-200 font-medium text-sm"
                            >
                                {isLoading ? 'Memuat...' : 'Terapkan Filter'}
                            </button>
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={isLoading}
                                className="w-full px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all duration-200 font-medium text-sm"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </form>

                {/* DIPERBAIKI: Enhanced Summary Cards sesuai backend data */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <SummaryCard
                        id="total-products"
                        label="Total Produk"
                        value={safeSummary.total_products}
                        icon="📦"
                        color="blue"
                        hoveredCard={hoveredCard}
                        setHoveredCard={setHoveredCard}
                    />
                    <SummaryCard
                        id="active-products"
                        label="Produk Aktif"
                        value={safeSummary.active_products}
                        icon="✅"
                        color="green"
                        hoveredCard={hoveredCard}
                        setHoveredCard={setHoveredCard}
                    />
                    <SummaryCard
                        id="low-stock"
                        label="Stok Rendah"
                        value={safeSummary.low_stock_products}
                        icon="⚠️"
                        color="yellow"
                        hoveredCard={hoveredCard}
                        setHoveredCard={setHoveredCard}
                    />
                    <SummaryCard
                        id="total-sold"
                        label="Total Terjual"
                        value={safeSummary.total_sold_items}
                        icon="📊"
                        color="purple"
                        hoveredCard={hoveredCard}
                        setHoveredCard={setHoveredCard}
                    />
                    <SummaryCard
                        id="total-revenue"
                        label="Total Pendapatan"
                        value={safeSummary.total_revenue}
                        icon="💰"
                        color="amber"
                        isCurrency
                        hoveredCard={hoveredCard}
                        setHoveredCard={setHoveredCard}
                    />
                </div>

                {/* DIPERBAIKI: Enhanced Products Table sesuai backend structure */}
                <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-amber-100 overflow-hidden">
                    <div className="p-6 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-medium text-amber-900 flex items-center">
                                    <svg className="w-6 h-6 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Analisis Produk Detail
                                </h2>
                                <p className="text-sm text-amber-700 mt-1">
                                    Menampilkan {products.length} produk dengan data penjualan
                                </p>
                            </div>
                            <div className="text-sm text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                                {products.length} Items
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-amber-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                                        <div className="flex items-center space-x-1">
                                            <span>Produk</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-amber-700 uppercase tracking-wider">
                                        <div className="flex items-center justify-end space-x-1">
                                            <span>Harga</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-amber-700 uppercase tracking-wider">
                                        <div className="flex items-center justify-end space-x-1">
                                            <span>Stok</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-amber-700 uppercase tracking-wider">
                                        <div className="flex items-center justify-end space-x-1">
                                            <span>Terjual</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-amber-700 uppercase tracking-wider">
                                        <div className="flex items-center justify-end space-x-1">
                                            <span>Pendapatan</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-amber-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center animate-pulse">
                                                <div className="text-6xl mb-4">📦</div>
                                                <p className="text-lg font-medium mb-2">Tidak ada data produk</p>
                                                <p className="text-sm">Silakan ubah filter atau tambah produk baru</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product, index) => (
                                        <tr
                                            key={product.id}
                                            className="hover:bg-amber-50 transition-all duration-300 group cursor-pointer transform hover:scale-[1.01]"
                                            style={{
                                                animationDelay: `${index * 50}ms`
                                            }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                                                        <span className="text-amber-600 font-bold text-sm">
                                                            {product.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 group-hover:text-amber-800 transition-colors duration-300">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {product.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                    {product.category_name || 'Tidak ada kategori'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                                {formatRupiah(product.price)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-300 ${
                                                    product.stock <= 10
                                                        ? 'bg-red-100 text-red-800 animate-pulse'
                                                        : product.stock <= 50
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {formatNumber(product.stock)}
                                                    {product.stock <= 10 && (
                                                        <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold group-hover:text-amber-800 transition-colors duration-300">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <span>{formatNumber(product.total_sold)}</span>
                                                    {product.total_sold > 0 && (
                                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold group-hover:text-amber-800 transition-colors duration-300">
                                                <div className="flex flex-col items-end">
                                                    <span>{formatRupiah(product.revenue)}</span>
                                                    {product.revenue > 0 && products.length > 0 && (
                                                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1 overflow-hidden">
                                                            <div
                                                                className="bg-gradient-to-r from-amber-400 to-orange-500 h-1 rounded-full transition-all duration-1000 ease-out"
                                                                style={{
                                                                    width: `${Math.min((product.revenue / Math.max(...products.map(p => p.revenue))) * 100, 100)}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-300 ${
                                                    product.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {product.is_active ? (
                                                        <>
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            Aktif
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            </svg>
                                                            Nonaktif
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    {products.length > 0 && (
                        <div className="px-6 py-4 bg-amber-50/50 border-t border-amber-100">
                            <div className="flex items-center justify-between text-sm text-amber-700">
                                <div className="flex items-center space-x-4">
                                    <span>📊 Total: {products.length} produk</span>
                                    <span>💰 Total Pendapatan: {formatRupiah(products.reduce((sum, p) => sum + (p.revenue || 0), 0))}</span>
                                </div>
                                <div className="text-xs text-amber-600">
                                    Data diperbarui secara real-time
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom CSS untuk animasi */}
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

                tbody tr {
                    animation: slideInUp 0.6s ease-out forwards;
                    opacity: 0;
                }

                tbody tr:nth-child(1) { animation-delay: 0.1s; }
                tbody tr:nth-child(2) { animation-delay: 0.15s; }
                tbody tr:nth-child(3) { animation-delay: 0.2s; }
                tbody tr:nth-child(4) { animation-delay: 0.25s; }
                tbody tr:nth-child(5) { animation-delay: 0.3s; }
                tbody tr:nth-child(n+6) { animation-delay: 0.35s; }
            `}</style>
        </AuthenticatedLayout>
    );
}

function SummaryCard({
    id,
    label,
    value,
    icon,
    color,
    isCurrency = false,
    hoveredCard,
    setHoveredCard,
}: {
    id: string;
    label: string;
    value: number | null | undefined;
    icon: string;
    color: string;
    isCurrency?: boolean;
    hoveredCard: string | null;
    setHoveredCard: (id: string | null) => void;
}) {
    // DIPERBAIKI: Safe formatting dengan null check sesuai backend
    const formatRupiah = (val: number | null | undefined) => {
        if (typeof val !== "number" || isNaN(val)) {
            return "Rp 0";
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    const formatNumber = (val: number | null | undefined) => {
        if (typeof val !== "number" || isNaN(val)) {
            return "0";
        }
        return new Intl.NumberFormat('id-ID').format(val);
    };

    const colorClasses = {
        blue: 'from-blue-500 to-blue-600 bg-blue-100 text-blue-600',
        green: 'from-green-500 to-green-600 bg-green-100 text-green-600',
        yellow: 'from-yellow-500 to-yellow-600 bg-yellow-100 text-yellow-600',
        purple: 'from-purple-500 to-purple-600 bg-purple-100 text-purple-600',
        amber: 'from-amber-500 to-amber-600 bg-amber-100 text-amber-600',
    };

    const [gradient, iconBg, textColor] = colorClasses[color as keyof typeof colorClasses]?.split(' ') || colorClasses.amber.split(' ');

    return (
        <div
            className={`group relative bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-500 hover:shadow-lg hover:-translate-y-2 cursor-pointer overflow-hidden ${
                hoveredCard === id ? 'ring-2 ring-amber-300/50 scale-105' : ''
            }`}
            onMouseEnter={() => setHoveredCard(id)}
            onMouseLeave={() => setHoveredCard(null)}
        >
            {/* Animated background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="relative">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-600 mb-1">
                            {label}
                        </h3>
                        <p className={`text-2xl font-light ${textColor} transition-all duration-300 group-hover:scale-110`}>
                            {isCurrency ? formatRupiah(value) : formatNumber(value)}
                        </p>
                    </div>
                    <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                        <span className="text-xl">{icon}</span>
                    </div>
                </div>

                {/* Animated progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 ease-out transform ${
                            hoveredCard === id ? 'translate-x-0 scale-x-100' : 'translate-x-[-20%] scale-x-75'
                        }`}
                        style={{
                            width: hoveredCard === id ? '100%' : '60%'
                        }}
                    ></div>
                </div>

                {/* Floating particles effect */}
                {hoveredCard === id && (
                    <>
                        <div className="absolute top-4 right-4 w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>
                        <div className="absolute top-8 right-8 w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce"></div>
                    </>
                )}
            </div>
        </div>
    );
}
