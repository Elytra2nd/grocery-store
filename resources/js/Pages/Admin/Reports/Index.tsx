// resources/js/Pages/Admin/Reports/Index.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ChartBarIcon,
    CurrencyDollarIcon,
    ShoppingCartIcon,
    UsersIcon,
    CubeIcon,
    DocumentChartBarIcon,
    TrophyIcon
} from '@heroicons/react/24/outline';

interface ReportStatistics {
    total_sales: number;
    monthly_sales: number;
    total_orders: number;
    monthly_orders: number;
    total_customers: number;
    active_products: number;
}

interface SalesTrend {
    month: string;
    sales: number;
    orders: number;
}

interface TopProduct {
    product_id: number;
    total_sold: number;
    total_revenue: number;
    product: {
        id: number;
        name: string;
        price: number;
        image?: string;
    };
}

interface Props extends PageProps {
    statistics: ReportStatistics;
    salesTrend: SalesTrend[];
    topProducts: TopProduct[];
    error?: string;
}

export default function ReportsIndex({
    statistics,
    salesTrend = [],
    topProducts = [],
    error
}: Props): JSX.Element {
    const safeStatistics = statistics || {
        total_sales: 0,
        monthly_sales: 0,
        total_orders: 0,
        monthly_orders: 0,
        total_customers: 0,
        active_products: 0,
    };

    const formatCurrency = (amount: number): string => `Rp ${amount.toLocaleString('id-ID')}`;
    const formatNumber = (value: number): string => value.toLocaleString('id-ID');

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Laporan" />

            <div className="py-8 min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-amber-900 drop-shadow-sm">
                            Dashboard Laporan
                        </h1>
                        <p className="mt-2 text-amber-700">
                            Overview performa bisnis dan analisis penjualan
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg animate-fade-in-up">
                            {error}
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            title="Total Penjualan"
                            value={formatCurrency(safeStatistics.total_sales)}
                            icon={CurrencyDollarIcon}
                            gradient="from-green-400/70 via-amber-200/60 to-amber-100/80"
                        />
                        <StatCard
                            title="Penjualan Bulan Ini"
                            value={formatCurrency(safeStatistics.monthly_sales)}
                            icon={ChartBarIcon}
                            gradient="from-blue-400/70 via-amber-200/60 to-amber-100/80"
                        />
                        <StatCard
                            title="Total Pesanan"
                            value={formatNumber(safeStatistics.total_orders)}
                            icon={ShoppingCartIcon}
                            gradient="from-purple-400/70 via-amber-200/60 to-amber-100/80"
                        />
                        <StatCard
                            title="Pesanan Bulan Ini"
                            value={formatNumber(safeStatistics.monthly_orders)}
                            icon={DocumentChartBarIcon}
                            gradient="from-indigo-400/70 via-amber-200/60 to-amber-100/80"
                        />
                        <StatCard
                            title="Total Pelanggan"
                            value={formatNumber(safeStatistics.total_customers)}
                            icon={UsersIcon}
                            gradient="from-yellow-400/70 via-amber-200/60 to-amber-100/80"
                        />
                        <StatCard
                            title="Produk Aktif"
                            value={formatNumber(safeStatistics.active_products)}
                            icon={CubeIcon}
                            gradient="from-emerald-400/70 via-amber-200/60 to-amber-100/80"
                        />
                    </div>

                    {/* Report Navigation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <ReportCard
                            title="Laporan Penjualan"
                            description="Analisis penjualan harian, mingguan, dan bulanan"
                            icon={ChartBarIcon}
                            href="/admin/reports/sales"
                            gradient="from-blue-500/90 to-blue-300/60"
                        />
                        <ReportCard
                            title="Laporan Produk"
                            description="Performa produk dan analisis inventori"
                            icon={CubeIcon}
                            href="/admin/reports/products"
                            gradient="from-green-500/90 to-green-300/60"
                        />
                        <ReportCard
                            title="Laporan Pelanggan"
                            description="Analisis perilaku dan segmentasi pelanggan"
                            icon={UsersIcon}
                            href="/admin/reports/customers"
                            gradient="from-purple-500/90 to-purple-300/60"
                        />
                        <ReportCard
                            title="Laporan Keuangan"
                            description="Analisis pendapatan dan profitabilitas"
                            icon={CurrencyDollarIcon}
                            href="/admin/reports/financial"
                            gradient="from-yellow-500/90 to-yellow-300/60"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Sales Trend Chart */}
                        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-amber-100 animate-fade-in-up">
                            <div className="px-6 py-4 border-b border-amber-100">
                                <h3 className="text-lg font-bold text-amber-900">
                                    Tren Penjualan (12 Bulan Terakhir)
                                </h3>
                            </div>
                            <div className="p-6">
                                {salesTrend.length > 0 ? (
                                    <SalesTrendChart data={salesTrend} />
                                ) : (
                                    <div className="text-center py-8 text-amber-400">
                                        Data tren penjualan tidak tersedia
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-amber-100 animate-fade-in-up">
                            <div className="px-6 py-4 border-b border-amber-100">
                                <h3 className="text-lg font-bold text-amber-900">
                                    Produk Terlaris
                                </h3>
                            </div>
                            <div className="p-6">
                                {topProducts.length > 0 ? (
                                    <TopProductsList products={topProducts} />
                                ) : (
                                    <div className="text-center py-8 text-amber-400">
                                        Data produk terlaris tidak tersedia
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// StatCard dengan glassmorphism, gradient, dan animasi hover
function StatCard({
    title,
    value,
    icon: Icon,
    gradient
}: {
    title: string;
    value: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    gradient: string;
}) {
    return (
        <div className={`relative overflow-hidden rounded-2xl shadow-xl border border-amber-100 bg-white/70 backdrop-blur hover:scale-[1.025] hover:shadow-2xl transition-all duration-200 group`}>
            <div className={`absolute inset-0 z-0 bg-gradient-to-br ${gradient} opacity-70 group-hover:opacity-90 transition-all duration-300`} />
            <div className="relative z-10 p-6 flex items-center space-x-4">
                <div className="w-14 h-14 rounded-xl bg-white/50 flex items-center justify-center shadow group-hover:bg-white/80 transition-all duration-200">
                    <Icon className="h-7 w-7 text-amber-700" />
                </div>
                <div>
                    <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">{title}</div>
                    <div className="text-2xl font-extrabold text-amber-900 drop-shadow">{value}</div>
                </div>
            </div>
        </div>
    );
}

// ReportCard dengan gradient, glass, dan animasi
function ReportCard({
    title,
    description,
    icon: Icon,
    href,
    gradient
}: {
    title: string;
    description: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    href: string;
    gradient: string;
}) {
    return (
        <Link
            href={href}
            className="relative block rounded-2xl shadow-lg border border-amber-100 bg-white/70 backdrop-blur hover:scale-[1.025] hover:shadow-2xl transition-all duration-200 group overflow-hidden"
        >
            <div className={`absolute inset-0 z-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:opacity-90 transition-all duration-300`} />
            <div className="relative z-10 p-6 flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center shadow mb-4 group-hover:bg-white/80 transition-all duration-200">
                    <Icon className="h-6 w-6 text-amber-700" />
                </div>
                <h3 className="text-lg font-bold text-amber-900 mb-1 drop-shadow">{title}</h3>
                <p className="text-sm text-amber-700">{description}</p>
            </div>
        </Link>
    );
}

// SalesTrendChart autumn bar chart
function SalesTrendChart({ data }: { data: SalesTrend[] }) {
    const maxSales = Math.max(...data.map(item => item.sales), 1);

    return (
        <div className="space-y-4">
            {data.slice(-6).map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                    <div className="w-16 text-xs text-amber-700 font-bold">{item.month}</div>
                    <div className="flex-1">
                        <div className="bg-amber-100 rounded-full h-4 relative">
                            <div
                                className="bg-gradient-to-r from-amber-400 to-orange-400 h-4 rounded-full transition-all duration-300"
                                style={{ width: `${(item.sales / maxSales) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div className="w-24 text-xs font-bold text-amber-900 text-right">
                        Rp {item.sales.toLocaleString('id-ID')}
                    </div>
                </div>
            ))}
        </div>
    );
}

// TopProductsList autumn
function TopProductsList({ products }: { products: TopProduct[] }) {
    return (
        <div className="space-y-4">
            {products.slice(0, 5).map((item, index) => (
                <div key={item.product_id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-orange-200 rounded-full flex items-center justify-center shadow">
                            {index === 0 ? (
                                <TrophyIcon className="h-5 w-5 text-yellow-700" />
                            ) : (
                                <span className="text-xs font-bold text-yellow-700">{index + 1}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-900 truncate">
                            {item.product?.name || 'Produk Tidak Ditemukan'}
                        </p>
                        <p className="text-xs text-amber-700">
                            {item.total_sold} terjual
                        </p>
                    </div>
                    <div className="text-xs font-bold text-amber-900">
                        Rp {item.total_revenue.toLocaleString('id-ID')}
                    </div>
                </div>
            ))}
        </div>
    );
}
