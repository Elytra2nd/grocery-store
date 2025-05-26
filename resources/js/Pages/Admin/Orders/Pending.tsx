// resources/js/Pages/Admin/Orders/Pending.tsx
import React, { useState, FormEvent } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Order, PageProps, PaginatedData, OrderFilters } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import {
    EyeIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Props extends PageProps {
    orders: PaginatedData<Order>;
    statistics: {
        count: number;
        total_amount: number;
        today_count: number;
        average_amount: number;
    };
    filters: OrderFilters;
}

export default function PendingOrders({ orders, statistics, filters }: Props): JSX.Element {
    const pageProps = usePage<PageProps>().props;
    const flash = pageProps.flash ?? {};
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
    const [bulkAction, setBulkAction] = useState<string>('');

    // Safe fallbacks dengan null checking yang lebih robust
    const safeOrders = orders?.data || [];
    const safeStatistics = {
        count: statistics?.count || 0,
        total_amount: statistics?.total_amount || 0,
        today_count: statistics?.today_count || 0,
        average_amount: statistics?.average_amount || 0,
    };
    const safeFilters = filters || {};

    // Helper function untuk format currency dengan null safety
    const formatCurrency = (amount: number | null | undefined): string => {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return 'Rp 0';
        }
        return `Rp ${Number(amount).toLocaleString('id-ID')}`;
    };

    // Helper function untuk format number dengan null safety
    const formatNumber = (value: number | null | undefined): string => {
        if (value === null || value === undefined || isNaN(value)) {
            return '0';
        }
        return Number(value).toLocaleString('id-ID');
    };

    const handleSearch = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchParams = Object.fromEntries(formData) as unknown as OrderFilters;
        router.get('/admin/orders/status/pending', searchParams as Record<string, any>, {
            preserveState: true,
            replace: true,
        });
    };

    const handleQuickAction = (orderId: number, action: 'approve' | 'reject'): void => {
        const order = safeOrders.find(o => o.id === orderId);
        if (!order) return;

        const confirmMessage = action === 'approve'
            ? `Konfirmasi pesanan #${order.order_number}?`
            : `Tolak pesanan #${order.order_number}?`;

        if (confirm(confirmMessage)) {
            router.patch(`/admin/orders/${orderId}/status`, {
                status: action === 'approve' ? 'processing' : 'cancelled',
                notes: action === 'approve' ? 'Pesanan dikonfirmasi' : 'Pesanan ditolak'
            });
        }
    };

    const handleBulkAction = (): void => {
        if (selectedOrders.length === 0 || !bulkAction) return;

        router.post('/admin/orders/bulk-action', {
            action: bulkAction,
            order_ids: selectedOrders,
        }, {
            onSuccess: () => {
                setSelectedOrders([]);
                setBulkAction('');
                setShowBulkModal(false);
            }
        });
    };

    const toggleOrderSelection = (orderId: number): void => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const toggleSelectAll = (): void => {
        if (selectedOrders.length === safeOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(safeOrders.map(order => order.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pesanan Menunggu Konfirmasi" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="md:flex md:items-center md:justify-between mb-6">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                                <ClockIcon className="h-8 w-8 text-yellow-500 mr-3" />
                                <div>
                                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                                        Pesanan Menunggu Konfirmasi
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Kelola pesanan yang memerlukan konfirmasi
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                            <button
                                onClick={() => router.reload()}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
                                Refresh
                            </button>
                            <Link
                                href="/admin/orders"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Semua Pesanan
                            </Link>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center">
                                <CheckIcon className="h-5 w-5 text-green-400 mr-2" />
                                {flash.success}
                            </div>
                        </div>
                    )}

                    {flash.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                                {flash.error}
                            </div>
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            title="Total Pending"
                            value={formatNumber(safeStatistics.count)}
                            color="yellow"
                            icon="📋"
                        />
                        <StatCard
                            title="Hari Ini"
                            value={formatNumber(safeStatistics.today_count)}
                            color="blue"
                            icon="📅"
                        />
                        <StatCard
                            title="Total Nilai"
                            value={formatCurrency(safeStatistics.total_amount)}
                            color="green"
                            icon="💰"
                        />
                        <StatCard
                            title="Rata-rata"
                            value={formatCurrency(safeStatistics.average_amount)}
                            color="purple"
                            icon="📊"
                        />
                    </div>

                    {/* Filters */}
                    <FilterForm
                        onSubmit={handleSearch}
                        filters={safeFilters}
                    />

                    {/* Bulk Actions */}
                    {selectedOrders.length > 0 && (
                        <BulkActions
                            selectedCount={selectedOrders.length}
                            bulkAction={bulkAction}
                            setBulkAction={setBulkAction}
                            onExecute={() => setShowBulkModal(true)}
                        />
                    )}

                    {/* Orders Table */}
                    <PendingOrdersTable
                        orders={safeOrders}
                        selectedOrders={selectedOrders}
                        onToggleSelection={toggleOrderSelection}
                        onToggleSelectAll={toggleSelectAll}
                        onQuickAction={handleQuickAction}
                        formatCurrency={formatCurrency}
                    />

                    {/* Pagination */}
                    {orders?.links && (
                        <Pagination links={orders.links} meta={orders} />
                    )}
                </div>
            </div>

            {/* Bulk Action Modal */}
            {showBulkModal && (
                <BulkActionModal
                    action={bulkAction}
                    selectedCount={selectedOrders.length}
                    onConfirm={handleBulkAction}
                    onCancel={() => setShowBulkModal(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}

// StatCard component
interface StatCardProps {
    title: string;
    value: string;
    color: 'yellow' | 'blue' | 'green' | 'purple';
    icon: string;
}

function StatCard({ title, value, color, icon }: StatCardProps): JSX.Element {
    const colorClasses = {
        yellow: 'bg-yellow-500',
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className={`w-8 h-8 ${colorClasses[color]} rounded-md flex items-center justify-center`}>
                            <span className="text-white text-lg">{icon}</span>
                        </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {title}
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                                {value}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}

// FilterForm component
interface FilterFormProps {
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    filters: OrderFilters;
}

function FilterForm({ onSubmit, filters }: FilterFormProps): JSX.Element {
    return (
        <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Pencarian
                            </label>
                            <input
                                type="text"
                                name="search"
                                defaultValue={filters.search || ''}
                                placeholder="Nomor pesanan atau nama pelanggan..."
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Dari Tanggal
                            </label>
                            <input
                                type="date"
                                name="date_from"
                                defaultValue={filters.date_from || ''}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Sampai Tanggal
                            </label>
                            <input
                                type="date"
                                name="date_to"
                                defaultValue={filters.date_to || ''}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                            <FunnelIcon className="-ml-1 mr-2 h-4 w-4" />
                            Filter
                        </button>

                        <Link
                            href="/admin/orders/status/pending"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Reset
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

// BulkActions component
interface BulkActionsProps {
    selectedCount: number;
    bulkAction: string;
    setBulkAction: (action: string) => void;
    onExecute: () => void;
}

function BulkActions({ selectedCount, bulkAction, setBulkAction, onExecute }: BulkActionsProps): JSX.Element {
    return (
        <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-3 sm:px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-700">
                            {selectedCount} pesanan dipilih
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <select
                            value={bulkAction}
                            onChange={(e) => setBulkAction(e.target.value)}
                            className="border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                        >
                            <option value="">Pilih Aksi</option>
                            <option value="approve_all">Konfirmasi Semua</option>
                            <option value="reject_all">Tolak Semua</option>
                            <option value="export">Export</option>
                        </select>
                        <button
                            onClick={onExecute}
                            disabled={!bulkAction}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-400"
                        >
                            Jalankan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// PendingOrdersTable component
interface PendingOrdersTableProps {
    orders: Order[];
    selectedOrders: number[];
    onToggleSelection: (id: number) => void;
    onToggleSelectAll: () => void;
    onQuickAction: (orderId: number, action: 'approve' | 'reject') => void;
    formatCurrency: (amount: number | null | undefined) => string;
}

function PendingOrdersTable({
    orders,
    selectedOrders,
    onToggleSelection,
    onToggleSelectAll,
    onQuickAction,
    formatCurrency
}: PendingOrdersTableProps): JSX.Element {
    if (!orders || orders.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-12 text-center">
                    <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada pesanan pending</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Semua pesanan sudah dikonfirmasi atau tidak ada pesanan baru.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-yellow-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="checkbox"
                                    checked={selectedOrders.length === orders.length && orders.length > 0}
                                    onChange={onToggleSelectAll}
                                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pesanan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pelanggan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Waktu
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi Cepat
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Detail
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-yellow-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.includes(order.id)}
                                        onChange={() => onToggleSelection(order.id)}
                                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        #{order.order_number}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {order.order_items?.length || 0} item
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {order.user?.name || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {order.user?.email || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                    {formatCurrency(order.total_amount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>{new Date(order.created_at).toLocaleDateString('id-ID')}</div>
                                    <div className="text-xs text-gray-400">
                                        {new Date(order.created_at).toLocaleTimeString('id-ID')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => onQuickAction(order.id, 'approve')}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            title="Konfirmasi Pesanan"
                                        >
                                            <CheckIcon className="h-4 w-4 mr-1" />
                                            Konfirmasi
                                        </button>
                                        <button
                                            onClick={() => onQuickAction(order.id, 'reject')}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            title="Tolak Pesanan"
                                        >
                                            <XMarkIcon className="h-4 w-4 mr-1" />
                                            Tolak
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors duration-150"
                                            title="Lihat Detail"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </Link>
                                        <Link
                                            href={`/admin/orders/${order.id}/edit`}
                                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors duration-150"
                                            title="Edit Pesanan"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// BulkActionModal component
interface BulkActionModalProps {
    action: string;
    selectedCount: number;
    onConfirm: () => void;
    onCancel: () => void;
}

function BulkActionModal({ action, selectedCount, onConfirm, onCancel }: BulkActionModalProps): JSX.Element {
    const getActionText = (action: string): string => {
        switch (action) {
            case 'approve_all': return 'mengkonfirmasi';
            case 'reject_all': return 'menolak';
            case 'export': return 'mengekspor';
            default: return action;
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <h3 className="text-lg font-medium text-gray-900">
                        Konfirmasi Aksi
                    </h3>
                    <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-gray-500">
                            Apakah Anda yakin ingin {getActionText(action)} {selectedCount} pesanan yang dipilih?
                        </p>
                    </div>
                    <div className="flex justify-center space-x-4 px-4 py-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                        >
                            Ya, Lanjutkan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
