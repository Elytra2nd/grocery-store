import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { DocumentTextIcon, FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

interface Customer {
    id: number;
    name: string;
    email: string;
    total_orders: number;
    total_spent: number;
    average_order_value: number;
    last_order_date: string | null;
    created_at: string;
}

interface PaginatedCustomers {
    data: Customer[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface CustomersProps extends PageProps {
    customers: PaginatedCustomers;
    summary: {
        total_customers: number;
        active_customers: number;
        new_customers: number;
        repeat_customers: number;
    };
    acquisitionTrend: Array<{
        date: string;
        new_customers: number;
    }>;
    filters: {
        sort_by: string;
        sort_order: string;
        date_range: string;
        per_page: number;
        search: string;
    };
    error?: string;
}

export default function Customers({
    customers,
    summary = {
        total_customers: 0,
        active_customers: 0,
        new_customers: 0,
        repeat_customers: 0,
    },
    acquisitionTrend = [],
    filters = {
        sort_by: 'total_orders',
        sort_order: 'desc',
        date_range: '30',
        per_page: 15,
        search: '',
    },
    error,
}: CustomersProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // DIPERBAIKI: Safe access untuk paginated data
    const customersData = customers?.data || [];
    const paginationInfo = {
        current_page: customers?.current_page || 1,
        last_page: customers?.last_page || 1,
        per_page: customers?.per_page || 15,
        total: customers?.total || 0,
        from: customers?.from || null,
        to: customers?.to || null,
        links: customers?.links || [],
    };

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

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Belum ada pesanan';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (e) {
            return 'Format tanggal tidak valid';
        }
    };

    const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        router.get('/admin/reports/customers', {
            sort_by: formData.get('sort_by'),
            sort_order: formData.get('sort_order'),
            date_range: formData.get('date_range'),
            per_page: formData.get('per_page'),
            search: searchTerm,
            page: 1, // Reset ke halaman pertama saat filter
        }, {
            onFinish: () => setIsLoading(false),
            preserveScroll: true,
        });
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        router.get('/admin/reports/customers', {
            ...filters,
            search: searchTerm,
            page: 1, // Reset ke halaman pertama saat search
        }, {
            onFinish: () => setIsLoading(false),
            preserveScroll: true,
        });
    };

    const handlePageChange = (url: string) => {
        if (!url) return;

        setIsLoading(true);
        router.visit(url, {
            onFinish: () => setIsLoading(false),
            preserveScroll: true,
        });
    };

    const handlePerPageChange = (perPage: number) => {
        setIsLoading(true);
        router.get('/admin/reports/customers', {
            ...filters,
            per_page: perPage,
            page: 1, // Reset ke halaman pertama
        }, {
            onFinish: () => setIsLoading(false),
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        setIsLoading(true);
        const params = new URLSearchParams({
            sort_by: filters.sort_by,
            sort_order: filters.sort_order,
            date_range: filters.date_range,
            search: filters.search,
        });

        const link = document.createElement('a');
        link.href = `/admin/reports/export/customers?${params.toString()}`;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-amber-900 leading-tight">
                    Laporan
                </h2>
            }
        >
            <Head title="Laporan Pelanggan" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-screen">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-light text-amber-900 tracking-wide">
                            Laporan Pelanggan
                        </h1>
                        <div className="w-16 h-0.5 bg-amber-600 mt-2"></div>
                        <p className="text-amber-700 mt-2">
                            Analisis data dan perilaku pelanggan
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
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <strong>Error:</strong> {error}
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-6 bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-amber-100 p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari pelanggan berdasarkan nama atau email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-amber-200 focus:border-amber-500 focus:ring-amber-500 transition-colors duration-200"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-all duration-200 font-medium text-sm"
                        >
                            {isLoading ? 'Mencari...' : 'Cari'}
                        </button>
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm('');
                                    router.get('/admin/reports/customers', {
                                        ...filters,
                                        search: '',
                                        page: 1,
                                    });
                                }}
                                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </form>

                {/* Filter Section */}
                <form onSubmit={handleFilter} className="mb-8 bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-amber-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FunnelIcon className="w-5 h-5 text-amber-600" />
                        <h3 className="text-lg font-medium text-amber-900">Filter & Sorting</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-amber-700 mb-2">Urutkan Berdasarkan</label>
                            <select
                                name="sort_by"
                                defaultValue={filters.sort_by}
                                className="w-full rounded-lg border-amber-200 focus:border-amber-500 focus:ring-amber-500 transition-colors duration-200"
                            >
                                <option value="total_orders">Total Pesanan</option>
                                <option value="total_spent">Total Belanja</option>
                                <option value="average_order_value">Rata-rata Pesanan</option>
                                <option value="created_at">Tanggal Daftar</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-amber-700 mb-2">Urutan</label>
                            <select
                                name="sort_order"
                                defaultValue={filters.sort_order}
                                className="w-full rounded-lg border-amber-200 focus:border-amber-500 focus:ring-amber-500 transition-colors duration-200"
                            >
                                <option value="desc">Tertinggi ke Terendah</option>
                                <option value="asc">Terendah ke Tertinggi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-amber-700 mb-2">Rentang Waktu (Hari)</label>
                            <select
                                name="date_range"
                                defaultValue={filters.date_range}
                                className="w-full rounded-lg border-amber-200 focus:border-amber-500 focus:ring-amber-500 transition-colors duration-200"
                            >
                                <option value="7">7 Hari Terakhir</option>
                                <option value="30">30 Hari Terakhir</option>
                                <option value="90">90 Hari Terakhir</option>
                                <option value="365">1 Tahun Terakhir</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-amber-700 mb-2">Items per Halaman</label>
                            <select
                                name="per_page"
                                defaultValue={filters.per_page}
                                className="w-full rounded-lg border-amber-200 focus:border-amber-500 focus:ring-amber-500 transition-colors duration-200"
                            >
                                <option value="10">10</option>
                                <option value="15">15</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
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
                    </div>
                </form>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <SummaryCard
                        label="Total Pelanggan"
                        value={summary.total_customers}
                        icon="👥"
                        color="blue"
                    />
                    <SummaryCard
                        label="Pelanggan Aktif"
                        value={summary.active_customers}
                        icon="✅"
                        color="green"
                    />
                    <SummaryCard
                        label="Pelanggan Baru"
                        value={summary.new_customers}
                        icon="🆕"
                        color="purple"
                    />
                    <SummaryCard
                        label="Repeat Customers"
                        value={summary.repeat_customers}
                        icon="🔄"
                        color="amber"
                    />
                </div>

                {/* Customers Table */}
                <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-amber-100 overflow-hidden">
                    <div className="p-6 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-medium text-amber-900 flex items-center">
                                    <svg className="w-6 h-6 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    Data Pelanggan Detail
                                </h2>
                                <p className="text-sm text-amber-700 mt-1">
                                    Menampilkan {paginationInfo.from || 0} - {paginationInfo.to || 0} dari {paginationInfo.total} pelanggan
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="text-sm text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                                    Halaman {paginationInfo.current_page} dari {paginationInfo.last_page}
                                </div>
                                <select
                                    value={paginationInfo.per_page}
                                    onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                                    className="text-sm rounded border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                                >
                                    <option value="10">10 per halaman</option>
                                    <option value="15">15 per halaman</option>
                                    <option value="25">25 per halaman</option>
                                    <option value="50">50 per halaman</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-amber-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                                        Pelanggan
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-amber-700 uppercase tracking-wider">
                                        Total Pesanan
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-amber-700 uppercase tracking-wider">
                                        Total Belanja
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-amber-700 uppercase tracking-wider">
                                        Rata-rata Pesanan
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-amber-700 uppercase tracking-wider">
                                        Pesanan Terakhir
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-amber-700 uppercase tracking-wider">
                                        Tanggal Daftar
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {customersData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <div className="text-6xl mb-4">👥</div>
                                                <p className="text-lg font-medium mb-2">
                                                    {filters.search ? 'Tidak ada pelanggan yang cocok' : 'Tidak ada data pelanggan'}
                                                </p>
                                                <p className="text-sm">
                                                    {filters.search ? 'Coba ubah kata kunci pencarian' : 'Silakan ubah filter atau tunggu pelanggan baru'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    customersData.map((customer, index) => (
                                        <tr
                                            key={customer.id}
                                            className="hover:bg-amber-50 transition-all duration-300 group cursor-pointer"
                                            style={{
                                                animationDelay: `${index * 50}ms`
                                            }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mr-3">
                                                        <span className="text-amber-600 font-bold text-sm">
                                                            {customer.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {customer.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {customer.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {customer.total_orders}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">
                                                {formatRupiah(customer.total_spent)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                                {formatRupiah(customer.average_order_value)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                {formatDate(customer.last_order_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                {formatDate(customer.created_at)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {paginationInfo.last_page > 1 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => handlePageChange(paginationInfo.links[0]?.url || '')}
                                        disabled={paginationInfo.current_page === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(paginationInfo.links[paginationInfo.links.length - 1]?.url || '')}
                                        disabled={paginationInfo.current_page === paginationInfo.last_page}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Menampilkan{' '}
                                            <span className="font-medium">{paginationInfo.from}</span>
                                            {' '}sampai{' '}
                                            <span className="font-medium">{paginationInfo.to}</span>
                                            {' '}dari{' '}
                                            <span className="font-medium">{paginationInfo.total}</span>
                                            {' '}hasil
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            {paginationInfo.links.map((link, index) => {
                                                if (index === 0) {
                                                    return (
                                                        <button
                                                            key="prev"
                                                            onClick={() => handlePageChange(link.url || '')}
                                                            disabled={!link.url}
                                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <span className="sr-only">Previous</span>
                                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    );
                                                }

                                                if (index === paginationInfo.links.length - 1) {
                                                    return (
                                                        <button
                                                            key="next"
                                                            onClick={() => handlePageChange(link.url || '')}
                                                            disabled={!link.url}
                                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <span className="sr-only">Next</span>
                                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    );
                                                }

                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => handlePageChange(link.url || '')}
                                                        disabled={!link.url}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${link.active
                                                                ? 'z-10 bg-amber-50 border-amber-500 text-amber-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            })}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function SummaryCard({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: number;
    icon: string;
    color: string;
}) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600 bg-blue-100 text-blue-600',
        green: 'from-green-500 to-green-600 bg-green-100 text-green-600',
        purple: 'from-purple-500 to-purple-600 bg-purple-100 text-purple-600',
        amber: 'from-amber-500 to-amber-600 bg-amber-100 text-amber-600',
    };

    const [gradient, iconBg, textColor] = colorClasses[color as keyof typeof colorClasses]?.split(' ') || colorClasses.amber.split(' ');

    return (
        <div className="group relative bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                        {label}
                    </h3>
                    <p className={`text-2xl font-light ${textColor} transition-all duration-300 group-hover:scale-105`}>
                        {value.toLocaleString('id-ID')}
                    </p>
                </div>
                <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                    <span className="text-xl">{icon}</span>
                </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 ease-out group-hover:w-full`}
                    style={{ width: '60%' }}
                ></div>
            </div>
        </div>
    );
}
