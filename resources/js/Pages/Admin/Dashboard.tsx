// resources/js/Pages/Admin/Dashboard.tsx
import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    CubeIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline';

interface AdminDashboardProps extends PageProps {
    statistics?: {
        total_products: number;
        active_products: number;
        low_stock_products: number;
        out_of_stock_products: number;
        total_orders: number;
        pending_orders: number;
        total_revenue: number;
        total_users: number;
    };
}

// PASTIKAN menggunakan default export yang benar
export default function AdminDashboard({ statistics }: AdminDashboardProps): JSX.Element {
    const stats = statistics || {
        total_products: 0,
        active_products: 0,
        low_stock_products: 0,
        out_of_stock_products: 0,
        total_orders: 0,
        pending_orders: 0,
        total_revenue: 0,
        total_users: 0,
    };

    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Admin Dashboard
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Selamat datang di panel admin Grocery Store
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Produk"
                            value={stats.total_products}
                            icon={CubeIcon}
                            color="blue"
                        />
                        <StatCard
                            title="Produk Aktif"
                            value={stats.active_products}
                            icon={CheckCircleIcon}
                            color="green"
                        />
                        <StatCard
                            title="Stok Rendah"
                            value={stats.low_stock_products}
                            icon={ExclamationTriangleIcon}
                            color="yellow"
                        />
                        <StatCard
                            title="Total Pesanan"
                            value={stats.total_orders}
                            icon={ShoppingBagIcon}
                            color="indigo"
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Aksi Cepat
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <a
                                        href="/admin/products/create"
                                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-150"
                                    >
                                        Tambah Produk
                                    </a>
                                    <a
                                        href="/admin/orders"
                                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-150"
                                    >
                                        Lihat Pesanan
                                    </a>
                                    <a
                                        href="/admin/products/low-stock"
                                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-150"
                                    >
                                        Stok Rendah
                                    </a>
                                    <a
                                        href="/admin/reports"
                                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-150"
                                    >
                                        Laporan
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Aktivitas Terbaru
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                                        Sistem berjalan normal
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                        {stats.pending_orders} pesanan menunggu konfirmasi
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                                        {stats.low_stock_products} produk stok rendah
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// StatCard Component
interface StatCardProps {
    title: string;
    value: number;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: 'blue' | 'green' | 'yellow' | 'indigo' | 'red';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps): JSX.Element {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        indigo: 'bg-indigo-500',
        red: 'bg-red-500',
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className={`w-8 h-8 ${colorClasses[color]} rounded-md flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {title}
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                                {value.toLocaleString('id-ID')}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
