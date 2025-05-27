// resources/js/Pages/Admin/Dashboard.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
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

function formatCurrency(value: number): string {
    return `Rp ${value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminDashboard({ statistics }: AdminDashboardProps): JSX.Element {
    const stats = {
        total_products: statistics?.total_products ?? 0,
        active_products: statistics?.active_products ?? 0,
        low_stock_products: statistics?.low_stock_products ?? 0,
        out_of_stock_products: statistics?.out_of_stock_products ?? 0,
        total_orders: statistics?.total_orders ?? 0,
        pending_orders: statistics?.pending_orders ?? 0,
        total_revenue: statistics?.total_revenue ?? 0,
        total_users: statistics?.total_users ?? 0,
    };

    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard" />

            <div className="py-6 min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8 animate-fade-in-down">
                        <h1 className="text-3xl font-extrabold text-amber-900 tracking-tight drop-shadow-sm">
                            Selamat Datang, Admin! 👋
                        </h1>
                        <p className="mt-2 text-amber-700">
                            Pantau statistik toko dan kelola data dengan mudah.
                        </p>
                    </div>

                    {/* Statistik Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-fade-in-up">
                        <StatCard
                            title="Total Produk"
                            value={stats.total_products}
                            icon={CubeIcon}
                            color="bg-amber-700"
                        />
                        <StatCard
                            title="Produk Aktif"
                            value={stats.active_products}
                            icon={CheckCircleIcon}
                            color="bg-green-500"
                        />
                        <StatCard
                            title="Stok Rendah"
                            value={stats.low_stock_products}
                            icon={ExclamationTriangleIcon}
                            color="bg-amber-400"
                        />
                        <StatCard
                            title="Total Pesanan"
                            value={stats.total_orders}
                            icon={ShoppingBagIcon}
                            color="bg-indigo-500"
                        />
                    </div>

                    {/* Statistik Revenue & Users */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 animate-fade-in-up">
                        <StatCard
                            title="Total Pendapatan"
                            value={stats.total_revenue}
                            icon={CurrencyIcon}
                            color="bg-amber-500"
                            isCurrency
                        />
                        <StatCard
                            title="Total Pengguna"
                            value={stats.total_users}
                            icon={UserGroupIcon}
                            color="bg-amber-300"
                        />
                    </div>

                    {/* Quick Actions - satu baris penuh */}
                    <div className="bg-white shadow rounded-xl p-6 animate-fade-in-up">
                        <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
                            Aksi Cepat
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <QuickAction
                                href="/admin/products/create"
                                label="Tambah Produk"
                                icon={<CubeIcon className="w-5 h-5" />}
                                color="bg-amber-600"
                                textColor="text-white"
                            />
                            <QuickAction
                                href="/admin/orders"
                                label="Lihat Pesanan"
                                icon={<ShoppingBagIcon className="w-5 h-5" />}
                                color="bg-white border border-amber-300"
                                textColor="text-amber-700"
                            />
                            <QuickAction
                                href="/admin/products/low-stock"
                                label="Stok Rendah"
                                icon={<ExclamationTriangleIcon className="w-5 h-5" />}
                                color="bg-amber-100"
                                textColor="text-amber-900"
                            />
                            <QuickAction
                                href="/admin/reports"
                                label="Laporan"
                                icon={<ShoppingBagIcon className="w-5 h-5" />}
                                color="bg-indigo-50"
                                textColor="text-indigo-800"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// --- StatCard Modern ---
import { UserGroupIcon, CurrencyDollarIcon as CurrencyIcon } from '@heroicons/react/24/outline';

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
    isCurrency?: boolean;
}
function StatCard({ title, value, icon: Icon, color, isCurrency }: StatCardProps): JSX.Element {
    return (
        <div className={`overflow-hidden shadow rounded-xl group hover:shadow-lg transition-shadow duration-200 bg-white animate-fade-in-up`}>
            <div className="p-5 flex items-center">
                <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${color} shadow group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-5 flex-1">
                    <dt className="text-sm font-medium text-amber-700 group-hover:text-amber-900 transition-colors duration-200">
                        {title}
                    </dt>
                    <dd className="text-2xl font-extrabold text-amber-900 group-hover:text-amber-700 transition-colors duration-200">
                        {isCurrency ? formatCurrency(value) : value.toLocaleString('id-ID')}
                    </dd>
                </div>
            </div>
        </div>
    );
}

// --- Quick Action Button ---
interface QuickActionProps {
    href: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    textColor: string;
}

function QuickAction({ href, label, icon, color, textColor }: QuickActionProps) {
    return (
        <Link
            href={href}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-150 ${color} ${textColor} hover:scale-105`}
        >
            {icon}
            {label}
        </Link>
    );
}
