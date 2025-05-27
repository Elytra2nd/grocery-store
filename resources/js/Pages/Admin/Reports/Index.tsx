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
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
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
    // Safe fallbacks
    const safeStatistics = statistics || {
        total_sales: 0,
        monthly_sales: 0,
        total_orders: 0,
        monthly_orders: 0,
        total_customers: 0,
        active_products: 0,
    };

    const formatCurrency = (amount: number): string => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    const formatNumber = (value: number): string => {
        return value.toLocaleString('id-ID');
    };

    const calculateGrowth = (current: number, previous: number): number => {
        if (previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Dashboard" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Dashboard Laporan
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Overview performa bisnis dan analisis penjualan
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            title="Total Penjualan"
                            value={formatCurrency(safeStatistics.total_sales)}
                            icon={CurrencyDollarIcon}
                            color="green"
                            trend={12.5}
                        />
                        <StatCard
                            title="Penjualan Bulan Ini"
                            value={formatCurrency(safeStatistics.monthly_sales)}
                            icon={ChartBarIcon}
                            color="blue"
                            trend={8.2}
                        />
                        <StatCard
                            title="Total Pesanan"
                            value={formatNumber(safeStatistics.total_orders)}
                            icon={ShoppingCartIcon}
                            color="purple"
                            trend={-2.1}
                        />
                        <StatCard
                            title="Pesanan Bulan Ini"
                            value={formatNumber(safeStatistics.monthly_orders)}
                            icon={DocumentChartBarIcon}
                            color="indigo"
                            trend={15.3}
                        />
                        <StatCard
                            title="Total Pelanggan"
                            value={formatNumber(safeStatistics.total_customers)}
                            icon={UsersIcon}
                            color="yellow"
                            trend={5.7}
                        />
                        <StatCard
                            title="Produk Aktif"
                            value={formatNumber(safeStatistics.active_products)}
                            icon={CubeIcon}
                            color="emerald"
                            trend={3.2}
                        />
                    </div>

                    {/* Report Navigation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <ReportCard
                            title="Laporan Penjualan"
                            description="Analisis penjualan harian, mingguan, dan bulanan"
                            icon={ChartBarIcon}
                            href="/admin/reports/sales"
                            color="blue"
                        />
                        <ReportCard
                            title="Laporan Produk"
                            description="Performa produk dan analisis inventori"
                            icon={CubeIcon}
                            href="/admin/reports/products"
                            color="green"
                        />
                        <ReportCard
                            title="Laporan Pelanggan"
                            description="Analisis perilaku dan segmentasi pelanggan"
                            icon={UsersIcon}
                            href="/admin/reports/customers"
                            color="purple"
                        />
                        <ReportCard
                            title="Laporan Keuangan"
                            description="Analisis pendapatan dan profitabilitas"
                            icon={CurrencyDollarIcon}
                            href="/admin/reports/financial"
                            color="yellow"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Sales Trend Chart */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Tren Penjualan (12 Bulan Terakhir)
                                </h3>
                            </div>
                            <div className="p-6">
                                {salesTrend.length > 0 ? (
                                    <SalesTrendChart data={salesTrend} />
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Data tren penjualan tidak tersedia
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Produk Terlaris
                                </h3>
                            </div>
                            <div className="p-6">
                                {topProducts.length > 0 ? (
                                    <TopProductsList products={topProducts} />
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
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

// StatCard Component
interface StatCardProps {
    title: string;
    value: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: 'green' | 'blue' | 'purple' | 'indigo' | 'yellow' | 'emerald';
    trend?: number;
}

function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps): JSX.Element {
    const colorClasses = {
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        indigo: 'bg-indigo-500',
        yellow: 'bg-yellow-500',
        emerald: 'bg-emerald-500',
    };

    const trendColor = trend && trend > 0 ? 'text-green-600' : 'text-red-600';
    const TrendIcon = trend && trend > 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className={`w-10 h-10 ${colorClasses[color]} rounded-md flex items-center justify-center`}>
                            <Icon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {title}
                            </dt>
                            <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900">
                                    {value}
                                </div>
                                {trend !== undefined && (
                                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${trendColor}`}>
                                        <TrendIcon className="self-center flex-shrink-0 h-4 w-4" />
                                        <span className="ml-1">
                                            {Math.abs(trend).toFixed(1)}%
                                        </span>
                                    </div>
                                )}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ReportCard Component
interface ReportCardProps {
    title: string;
    description: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    href: string;
    color: 'blue' | 'green' | 'purple' | 'yellow';
}

function ReportCard({ title, description, icon: Icon, href, color }: ReportCardProps): JSX.Element {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
        green: 'bg-green-50 text-green-600 hover:bg-green-100',
        purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
        yellow: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
    };

    return (
        <Link
            href={href}
            className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
        >
            <div className="p-6">
                <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-4 transition-colors duration-200`}>
                    <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {title}
                </h3>
                <p className="text-sm text-gray-600">
                    {description}
                </p>
            </div>
        </Link>
    );
}

// SalesTrendChart Component (Simple Bar Chart)
interface SalesTrendChartProps {
    data: SalesTrend[];
}

function SalesTrendChart({ data }: SalesTrendChartProps): JSX.Element {
    const maxSales = Math.max(...data.map(item => item.sales));

    return (
        <div className="space-y-4">
            {data.slice(-6).map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                    <div className="w-16 text-sm text-gray-600 font-medium">
                        {item.month}
                    </div>
                    <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-4 relative">
                            <div
                                className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                                style={{ width: `${(item.sales / maxSales) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div className="w-24 text-sm text-gray-900 font-medium text-right">
                        Rp {item.sales.toLocaleString('id-ID')}
                    </div>
                </div>
            ))}
        </div>
    );
}

// TopProductsList Component
interface TopProductsListProps {
    products: TopProduct[];
}

function TopProductsList({ products }: TopProductsListProps): JSX.Element {
    return (
        <div className="space-y-4">
            {products.slice(0, 5).map((item, index) => (
                <div key={item.product_id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            {index === 0 && <TrophyIcon className="h-5 w-5 text-yellow-600" />}
                            {index !== 0 && (
                                <span className="text-sm font-medium text-yellow-600">
                                    {index + 1}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product?.name || 'Produk Tidak Ditemukan'}
                        </p>
                        <p className="text-sm text-gray-500">
                            {item.total_sold} terjual
                        </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                        Rp {item.total_revenue.toLocaleString('id-ID')}
                    </div>
                </div>
            ))}
        </div>
    );
}
