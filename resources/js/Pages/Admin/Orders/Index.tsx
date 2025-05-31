import React, { useState, FormEvent } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Order, PageProps, PaginatedData, OrderStatistics, OrderFilters } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    EyeIcon,
    PencilIcon,
    TrashIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ShoppingCartIcon,
    TruckIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

interface Props extends PageProps {
    orders: PaginatedData<Order>;
    statistics: OrderStatistics;
    filters: OrderFilters;
    statuses: Record<string, string>;
}

// DITAMBAHKAN: Delete Modal Component dengan Animasi
interface DeleteModalProps {
    show: boolean;
    order: Order | null;
    isLoading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function DeleteModal({ show, order, isLoading, onConfirm, onCancel }: DeleteModalProps): JSX.Element {
    const [isModalAnimating, setIsModalAnimating] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    React.useEffect(() => {
        if (show) {
            setIsModalAnimating(true);
            setIsClosing(false);
        } else {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setIsModalAnimating(false);
                setIsClosing(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [show]);

    const handleCancel = () => {
        if (!isLoading) {
            setIsClosing(true);
            setTimeout(() => {
                onCancel();
            }, 300);
        }
    };

    if (!show && !isClosing) return <></>;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${
                isModalAnimating && !isClosing
                    ? 'opacity-100 backdrop-blur-sm'
                    : 'opacity-0'
            }`}
            style={{
                background: isModalAnimating && !isClosing
                    ? 'rgba(0, 0, 0, 0.5)'
                    : 'rgba(0, 0, 0, 0)'
            }}
        >
            {/* Background overlay dengan animasi */}
            <div
                className={`fixed inset-0 transition-opacity duration-300 ease-in-out ${
                    isModalAnimating && !isClosing ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={handleCancel}
            />

            {/* Modal panel dengan ukuran yang lebih kecil dan centered */}
            <div
                className={`relative bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-out w-full max-w-md mx-auto ${
                    isModalAnimating && !isClosing
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-8 scale-95'
                }`}
                style={{
                    boxShadow: isModalAnimating && !isClosing
                        ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        : 'none'
                }}
            >
                {/* Header dengan padding yang disesuaikan */}
                <div className="p-6">
                    <div className="flex items-center">
                        <div
                            className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full transition-all duration-500 delay-100 ${
                                isModalAnimating && !isClosing
                                    ? 'bg-red-100 scale-100'
                                    : 'bg-red-50 scale-75'
                            }`}
                        >
                            <TrashIcon
                                className={`transition-all duration-500 delay-200 ${
                                    isModalAnimating && !isClosing
                                        ? 'h-6 w-6 text-red-600 scale-100'
                                        : 'h-5 w-5 text-red-400 scale-75'
                                }`}
                            />
                        </div>
                        <div className="ml-4 flex-1">
                            <h3
                                className={`text-lg font-bold leading-6 transition-all duration-500 delay-150 ${
                                    isModalAnimating && !isClosing
                                        ? 'text-gray-900 translate-y-0 opacity-100'
                                        : 'text-gray-700 translate-y-2 opacity-0'
                                }`}
                            >
                                Konfirmasi Hapus Pesanan
                            </h3>
                        </div>
                    </div>

                    <div
                        className={`mt-4 transition-all duration-500 delay-200 ${
                            isModalAnimating && !isClosing
                                ? 'translate-y-0 opacity-100'
                                : 'translate-y-4 opacity-0'
                        }`}
                    >
                        <p className="text-sm text-gray-500 mb-3">
                            Apakah Anda yakin ingin menghapus pesanan:
                        </p>
                        <div
                            className={`p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400 transition-all duration-500 delay-300 ${
                                isModalAnimating && !isClosing
                                    ? 'scale-100 opacity-100'
                                    : 'scale-95 opacity-0'
                            }`}
                        >
                            <p className="text-sm font-semibold text-gray-900 flex items-center">
                                <span className="text-lg mr-2">📋</span>
                                "#{order?.order_number}"
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                Pelanggan: {order?.user?.name || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600">
                                Total: Rp {(order?.total_amount || 0).toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div
                            className={`mt-3 p-2 bg-red-50 rounded-lg border border-red-200 transition-all duration-500 delay-400 ${
                                isModalAnimating && !isClosing
                                    ? 'scale-100 opacity-100'
                                    : 'scale-95 opacity-0'
                            }`}
                        >
                            <p className="text-xs text-red-600 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Tindakan ini tidak dapat dibatalkan!
                            </p>
                        </div>
                    </div>

                    {/* Action buttons dengan ukuran yang disesuaikan */}
                    <div
                        className={`mt-6 flex gap-3 transition-all duration-500 delay-500 ${
                            isModalAnimating && !isClosing
                                ? 'translate-y-0 opacity-100'
                                : 'translate-y-6 opacity-0'
                        }`}
                    >
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-300 ${
                                isLoading
                                    ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-400 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            }`}
                        >
                            <div className="flex items-center justify-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Batal</span>
                            </div>
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-transparent transition-all duration-300 ${
                                isLoading
                                    ? 'bg-red-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500'
                            } text-white`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                    </svg>
                                    <span>Menghapus...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-1">
                                    <TrashIcon className="w-4 h-4" />
                                    <span>Ya, Hapus</span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OrdersIndex({
    orders,
    statistics,
    filters,
    statuses
}: Props): JSX.Element {
    const pageProps = usePage<PageProps>().props;
    const flash = pageProps.flash ?? {};
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [bulkAction, setBulkAction] = useState<string>('');
    const [showBulkModal, setShowBulkModal] = useState<boolean>(false);

    // DITAMBAHKAN: State untuk delete modal
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Safe fallbacks untuk data yang mungkin undefined
    const safeOrders = orders?.data || [];
    const safeStatistics = statistics || {
        total_orders: 0,
        pending_orders: 0,
        processing_orders: 0,
        shipped_orders: 0,
        delivered_orders: 0,
        cancelled_orders: 0,
        total_revenue: 0,
        today_orders: 0,
        today_revenue: 0,
    };
    const safeStatuses = statuses || {};
    const safeFilters = filters || {};

    const handleSearch = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchParams = Object.fromEntries(formData) as unknown as OrderFilters;
        router.get('/admin/orders', searchParams as Record<string, any>, {
            preserveState: true,
            replace: true,
        });
    };

    const handleBulkAction = (): void => {
        if (selectedOrders.length === 0 || !bulkAction) return;

        const actionData: Record<string, any> = {
            action: bulkAction.startsWith('update_status_') ? 'update_status' : bulkAction,
            order_ids: selectedOrders,
        };

        if (bulkAction.startsWith('update_status_')) {
            actionData.status = bulkAction.replace('update_status_', '');
        }

        router.post('/admin/orders/bulk-action', actionData, {
            onSuccess: () => {
                setSelectedOrders([]);
                setBulkAction('');
                setShowBulkModal(false);
            },
            onError: (errors) => {
                console.error('Bulk action failed:', errors);
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

    // DIPERBAIKI: Handle delete dengan modal
    const handleDelete = (order: Order): void => {
        setOrderToDelete(order);
        setShowDeleteModal(true);
    };

    // DITAMBAHKAN: Confirm delete function
    const confirmDeleteOrder = (): void => {
        if (!orderToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/orders/${orderToDelete.id}`, {
            onSuccess: () => {
                setIsDeleting(false);
                setShowDeleteModal(false);
                setOrderToDelete(null);
                // Remove from selected orders if it was selected
                setSelectedOrders(prev => prev.filter(id => id !== orderToDelete.id));
            },
            onError: () => {
                setIsDeleting(false);
            }
        });
    };

    // DITAMBAHKAN: Close delete modal function
    const closeDeleteModal = (): void => {
        if (!isDeleting) {
            setShowDeleteModal(false);
            setOrderToDelete(null);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-amber-900 leading-tight">
                    Pesanan
                </h2>
            }
        >
            <Head title="Kelola Pesanan" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="md:flex md:items-center md:justify-between mb-6">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                                Kelola Pesanan
                            </h2>
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                            <Link
                                href="/admin/orders/create"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                Buat Pesanan
                            </Link>
                            <button
                                onClick={() => router.get('/admin/orders/export')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium">{flash.success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {flash.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium">{flash.error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            title="Total Pesanan"
                            value={safeStatistics.total_orders}
                            icon={ShoppingCartIcon}
                            color="blue"
                        />
                        <StatCard
                            title="Menunggu Konfirmasi"
                            value={safeStatistics.pending_orders}
                            icon={ClockIcon}
                            color="yellow"
                        />
                        <StatCard
                            title="Sedang Dikirim"
                            value={safeStatistics.shipped_orders}
                            icon={TruckIcon}
                            color="indigo"
                        />
                        <StatCard
                            title="Total Pendapatan"
                            value={`Rp ${safeStatistics.total_revenue.toLocaleString('id-ID')}`}
                            icon={CurrencyDollarIcon}
                            color="green"
                        />
                    </div>

                    {/* Filters */}
                    <FilterForm
                        onSubmit={handleSearch}
                        statuses={safeStatuses}
                        filters={safeFilters}
                    />

                    {/* Bulk Actions */}
                    {selectedOrders.length > 0 && (
                        <BulkActions
                            selectedCount={selectedOrders.length}
                            bulkAction={bulkAction}
                            setBulkAction={setBulkAction}
                            onExecute={() => setShowBulkModal(true)}
                            statuses={safeStatuses}
                        />
                    )}

                    {/* Orders Table */}
                    <OrdersTable
                        orders={safeOrders}
                        selectedOrders={selectedOrders}
                        onToggleSelection={toggleOrderSelection}
                        onToggleSelectAll={toggleSelectAll}
                        onDelete={handleDelete}
                        statuses={safeStatuses}
                    />

                    {/* Pagination */}
                    {orders?.links && (
                        <Pagination
                            links={orders.links}
                            meta={orders}
                        />
                    )}
                </div>
            </div>

            {/* DITAMBAHKAN: Enhanced Delete Confirmation Modal dengan Animasi */}
            <DeleteModal
                show={showDeleteModal}
                order={orderToDelete}
                isLoading={isDeleting}
                onConfirm={confirmDeleteOrder}
                onCancel={closeDeleteModal}
            />

            {/* Bulk Action Confirmation Modal */}
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

// Sub-components dengan perbaikan (tetap sama seperti kode asli)
interface StatCardProps {
    title: string;
    value: string | number;
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
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className={`w-8 h-8 ${colorClasses[color]} rounded-md flex items-center justify-center`}>
                            <Icon className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {title}
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                                {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface FilterFormProps {
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    statuses: Record<string, string>;
    filters: OrderFilters;
}

function FilterForm({ onSubmit, statuses, filters }: FilterFormProps): JSX.Element {
    return (
        <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Pencarian
                            </label>
                            <input
                                type="text"
                                name="search"
                                defaultValue={filters.search || ''}
                                placeholder="Nomor pesanan atau nama pelanggan..."
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <select
                                name="status"
                                defaultValue={filters.status || ''}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">Semua Status</option>
                                {Object.entries(statuses).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Dari Tanggal
                            </label>
                            <input
                                type="date"
                                name="date_from"
                                defaultValue={filters.date_from || ''}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <FunnelIcon className="-ml-1 mr-2 h-4 w-4" />
                            Filter
                        </button>

                        <Link
                            href="/admin/orders"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Reset
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface BulkActionsProps {
    selectedCount: number;
    bulkAction: string;
    setBulkAction: (action: string) => void;
    onExecute: () => void;
    statuses: Record<string, string>;
}

function BulkActions({ selectedCount, bulkAction, setBulkAction, onExecute, statuses }: BulkActionsProps): JSX.Element {
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
                            className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Pilih Aksi</option>
                            <optgroup label="Update Status">
                                {Object.entries(statuses).map(([key, label]) => (
                                    <option key={`status_${key}`} value={`update_status_${key}`}>
                                        Ubah ke {label}
                                    </option>
                                ))}
                            </optgroup>
                            <option value="export">Export</option>
                            <option value="delete">Hapus</option>
                        </select>
                        <button
                            onClick={onExecute}
                            disabled={!bulkAction}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Jalankan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface OrdersTableProps {
    orders: Order[];
    selectedOrders: number[];
    onToggleSelection: (id: number) => void;
    onToggleSelectAll: () => void;
    onDelete: (order: Order) => void;
    statuses: Record<string, string>;
}

function OrdersTable({
    orders,
    selectedOrders,
    onToggleSelection,
    onToggleSelectAll,
    onDelete,
    statuses
}: OrdersTableProps): JSX.Element {
    const getStatusBadgeClass = (status: string): string => {
        const statusClasses = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800';
    };

    // Handle empty orders
    if (!orders || orders.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-12 text-center">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <ShoppingCartIcon />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada pesanan</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Belum ada pesanan yang dibuat.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/admin/orders/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Buat Pesanan
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="checkbox"
                                    checked={selectedOrders.length === orders.length && orders.length > 0}
                                    onChange={onToggleSelectAll}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tanggal
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.includes(order.id)}
                                        onChange={() => onToggleSelection(order.id)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
                                    Rp {(order.total_amount || 0).toLocaleString('id-ID')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                                        {statuses[order.status] || order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors duration-150"
                                            title="Lihat Detail"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </Link>
                                        <Link
                                            href={`/admin/orders/${order.id}/edit`}
                                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors duration-150"
                                            title="Edit Pesanan"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </Link>
                                        {order.status === 'cancelled' && (
                                            <button
                                                onClick={() => onDelete(order)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded transition-colors duration-150"
                                                title="Hapus Pesanan"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        )}
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

interface PaginationProps {
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    meta: PaginatedData<any>;
}

function Pagination({ links, meta }: PaginationProps): JSX.Element {
    return (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
            <div className="flex-1 flex justify-between sm:hidden">
                {meta.prev_page_url && (
                    <Link
                        href={meta.prev_page_url}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Previous
                    </Link>
                )}
                {meta.next_page_url && (
                    <Link
                        href={meta.next_page_url}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Next
                    </Link>
                )}
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{meta.from || 0}</span>
                        {' '}to{' '}
                        <span className="font-medium">{meta.to || 0}</span>
                        {' '}of{' '}
                        <span className="font-medium">{meta.total || 0}</span>
                        {' '}results
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        {links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${link.active
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    } ${index === 0 ? 'rounded-l-md' : ''
                                    } ${index === links.length - 1 ? 'rounded-r-md' : ''
                                    }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}

interface BulkActionModalProps {
    action: string;
    selectedCount: number;
    onConfirm: () => void;
    onCancel: () => void;
}

function BulkActionModal({ action, selectedCount, onConfirm, onCancel }: BulkActionModalProps): JSX.Element {
    const getActionText = (action: string): string => {
        if (action.startsWith('update_status_')) {
            const status = action.replace('update_status_', '');
            return `mengubah status menjadi ${status}`;
        }

        switch (action) {
            case 'export': return 'mengekspor';
            case 'delete': return 'menghapus';
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
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-150"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-150"
                        >
                            Ya, Lanjutkan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
