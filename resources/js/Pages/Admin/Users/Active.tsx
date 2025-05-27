import React, { useState, FormEvent } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import {
    EyeIcon,
    PencilIcon,
    UserIcon,
    CheckCircleIcon,
    ShoppingCartIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    ArrowPathIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    is_active: boolean;
    email_verified_at?: string;
    created_at: string;
    last_login_at?: string;
    orders_count?: number;
    total_spent?: number;
    last_order_date?: string;
}

interface UserFilters {
    search?: string;
    date_from?: string;
    date_to?: string;
    activity_level?: string;
    sort_by?: string;
    sort_order?: string;
}

interface Props extends PageProps {
    users: {
        path: string;
        prev_page_url: string | null;
        next_page_url: string | null;
        first_page_url: string;
        data: User[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    statistics: {
        total_active: number;
        new_this_month: number;
        with_orders: number;
        total_spent: number;
        average_orders: number;
        last_30_days: number;
    };
    filters: UserFilters;
}

export default function ActiveUsers({ users, statistics, filters }: Props): JSX.Element {
    const pageProps = usePage<PageProps>().props;
    const flash = pageProps.flash ?? {};
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
    const [bulkAction, setBulkAction] = useState<string>('');

    // Safe fallbacks
    const safeUsers = users?.data || [];
    const safeStatistics = statistics || {
        total_active: 0,
        new_this_month: 0,
        with_orders: 0,
        total_spent: 0,
        average_orders: 0,
        last_30_days: 0,
    };
    const safeFilters = filters || {};

    const formatCurrency = (amount: number | null | undefined): string => {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return 'Rp 0';
        }
        return `Rp ${Number(amount).toLocaleString('id-ID')}`;
    };

    const formatNumber = (value: number | null | undefined): string => {
        if (value === null || value === undefined || isNaN(value)) {
            return '0';
        }
        return Number(value).toLocaleString('id-ID');
    };

    const handleSearch = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchParams = Object.fromEntries(formData) as UserFilters;
        router.get('/admin/users/active', searchParams as Record<string, any>, {
            preserveState: true,
            replace: true,
        });
    };

    const handleBulkAction = (): void => {
        if (selectedUsers.length === 0 || !bulkAction) return;

        router.post('/admin/users/bulk-action', {
            action: bulkAction,
            user_ids: selectedUsers,
        }, {
            onSuccess: () => {
                setSelectedUsers([]);
                setBulkAction('');
                setShowBulkModal(false);
            }
        });
    };

    const toggleUserSelection = (userId: number): void => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const toggleSelectAll = (): void => {
        if (selectedUsers.length === safeUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(safeUsers.map(user => user.id));
        }
    };

    const getActivityLevel = (user: User): { level: string; color: string; label: string } => {
        const ordersCount = user.orders_count || 0;
        const lastLogin = user.last_login_at ? new Date(user.last_login_at) : null;
        const daysSinceLogin = lastLogin ? Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)) : 999;
        if (ordersCount >= 10 && daysSinceLogin <= 7) {
            return { level: 'high', color: 'bg-green-100 text-green-800', label: 'Sangat Aktif' };
        } else if (ordersCount >= 5 && daysSinceLogin <= 14) {
            return { level: 'medium', color: 'bg-blue-100 text-blue-800', label: 'Aktif' };
        } else if (ordersCount >= 1 && daysSinceLogin <= 30) {
            return { level: 'low', color: 'bg-yellow-100 text-yellow-800', label: 'Cukup Aktif' };
        } else {
            return { level: 'inactive', color: 'bg-gray-100 text-gray-800', label: 'Kurang Aktif' };
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pelanggan Aktif" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="md:flex md:items-center md:justify-between mb-6">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
                                <div>
                                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                                        Pelanggan Aktif
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Kelola pelanggan yang aktif menggunakan platform
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
                                href="/admin/users"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Semua Pelanggan
                            </Link>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                                {flash.success}
                            </div>
                        </div>
                    )}

                    {flash.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                                {flash.error}
                            </div>
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        <StatCard title="Total Aktif" value={formatNumber(safeStatistics.total_active)} color="green" icon="👥" />
                        <StatCard title="Baru Bulan Ini" value={formatNumber(safeStatistics.new_this_month)} color="blue" icon="🆕" />
                        <StatCard title="Pernah Belanja" value={formatNumber(safeStatistics.with_orders)} color="purple" icon="🛒" />
                        <StatCard title="Total Belanja" value={formatCurrency(safeStatistics.total_spent)} color="emerald" icon="💰" />
                        <StatCard title="Rata-rata Order" value={formatNumber(safeStatistics.average_orders)} color="yellow" icon="📊" />
                        <StatCard title="Aktif 30 Hari" value={formatNumber(safeStatistics.last_30_days)} color="indigo" icon="📅" />
                    </div>

                    {/* Filters */}
                    <FilterForm onSubmit={handleSearch} filters={safeFilters} />

                    {/* Bulk Actions */}
                    {selectedUsers.length > 0 && (
                        <BulkActions
                            selectedCount={selectedUsers.length}
                            bulkAction={bulkAction}
                            setBulkAction={setBulkAction}
                            onExecute={() => setShowBulkModal(true)}
                        />
                    )}

                    {/* Users Table */}
                    <ActiveUsersTable
                        users={safeUsers}
                        selectedUsers={selectedUsers}
                        onToggleSelection={toggleUserSelection}
                        onToggleSelectAll={toggleSelectAll}
                        formatCurrency={formatCurrency}
                        getActivityLevel={getActivityLevel}
                    />

                    {/* Pagination */}
                    {users?.links && (
                        <Pagination
                            links={users.links}
                            meta={{
                                current_page: users.current_page,
                                last_page: users.last_page,
                                per_page: users.per_page,
                                total: users.total,
                                from: users.from,
                                to: users.to,
                                first_page_url: users.first_page_url,
                                last_page_url: users.first_page_url, // Ganti jika ada users.last_page_url
                                next_page_url: users.next_page_url,
                                prev_page_url: users.prev_page_url,
                                path: users.path,
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Bulk Action Modal */}
            {showBulkModal && (
                <BulkActionModal
                    action={bulkAction}
                    selectedCount={selectedUsers.length}
                    onConfirm={handleBulkAction}
                    onCancel={() => setShowBulkModal(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}

// StatCard Component
interface StatCardProps {
    title: string;
    value: string;
    color: 'green' | 'blue' | 'purple' | 'emerald' | 'yellow' | 'indigo';
    icon: string;
}

function StatCard({ title, value, color, icon }: StatCardProps): JSX.Element {
    const colorClasses = {
        green: 'bg-green-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        emerald: 'bg-emerald-500',
        yellow: 'bg-yellow-500',
        indigo: 'bg-indigo-500',
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

// FilterForm Component
interface FilterFormProps {
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    filters: UserFilters;
}

function FilterForm({ onSubmit, filters }: FilterFormProps): JSX.Element {
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
                                placeholder="Nama atau email pelanggan..."
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Level Aktivitas
                            </label>
                            <select
                                name="activity_level"
                                defaultValue={filters.activity_level || ''}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            >
                                <option value="">Semua Level</option>
                                <option value="high">Sangat Aktif</option>
                                <option value="medium">Aktif</option>
                                <option value="low">Cukup Aktif</option>
                                <option value="inactive">Kurang Aktif</option>
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
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <FunnelIcon className="-ml-1 mr-2 h-4 w-4" />
                            Filter
                        </button>
                        <Link
                            href="/admin/users/active"
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

// BulkActions Component
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
                            {selectedCount} pelanggan dipilih
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <select
                            value={bulkAction}
                            onChange={(e) => setBulkAction(e.target.value)}
                            className="border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        >
                            <option value="">Pilih Aksi</option>
                            <option value="send_notification">Kirim Notifikasi</option>
                            <option value="send_newsletter">Kirim Newsletter</option>
                            <option value="export">Export Data</option>
                            <option value="deactivate">Nonaktifkan</option>
                        </select>
                        <button
                            onClick={onExecute}
                            disabled={!bulkAction}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                        >
                            Jalankan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ActiveUsersTable Component
interface ActiveUsersTableProps {
    users: User[];
    selectedUsers: number[];
    onToggleSelection: (id: number) => void;
    onToggleSelectAll: () => void;
    formatCurrency: (amount: number | null | undefined) => string;
    getActivityLevel: (user: User) => { level: string; color: string; label: string };
}

function ActiveUsersTable({
    users,
    selectedUsers,
    onToggleSelection,
    onToggleSelectAll,
    formatCurrency,
    getActivityLevel
}: ActiveUsersTableProps): JSX.Element {
    if (!users || users.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-12 text-center">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada pelanggan aktif</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Belum ada pelanggan yang aktif menggunakan platform.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.length === users.length && users.length > 0}
                                    onChange={onToggleSelectAll}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pelanggan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kontak
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aktivitas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statistik Belanja
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Terakhir Login
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => {
                            const activity = getActivityLevel(user);
                            return (
                                <tr key={user.id} className="hover:bg-green-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => onToggleSelection(user.id)}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {user.avatar ? (
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        src={`/storage/avatars/${user.avatar}`}
                                                        alt={user.name}
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                        <UserIcon className="h-6 w-6 text-green-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {user.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                        <div className="text-sm text-gray-500">
                                            {user.phone || 'Tidak ada nomor'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.color}`}>
                                            {activity.label}
                                        </span>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {user.orders_count || 0} pesanan
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatCurrency(user.total_spent)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {user.last_order_date ?
                                                `Terakhir: ${new Date(user.last_order_date).toLocaleDateString('id-ID')}` :
                                                'Belum pernah belanja'
                                            }
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.last_login_at ? (
                                            <div>
                                                <div>{new Date(user.last_login_at).toLocaleDateString('id-ID')}</div>
                                                <div className="text-xs text-gray-400">
                                                    {new Date(user.last_login_at).toLocaleTimeString('id-ID')}
                                                </div>
                                            </div>
                                        ) : (
                                            'Belum pernah login'
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link
                                                href={`/admin/users/${user.id}`}
                                                className="text-green-600 hover:text-green-900 p-1 rounded transition-colors duration-150"
                                                title="Lihat Detail"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </Link>
                                            <Link
                                                href={`/admin/users/${user.id}/edit`}
                                                className="text-green-600 hover:text-green-900 p-1 rounded transition-colors duration-150"
                                                title="Edit Pelanggan"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// BulkActionModal Component
interface BulkActionModalProps {
    action: string;
    selectedCount: number;
    onConfirm: () => void;
    onCancel: () => void;
}

function BulkActionModal({ action, selectedCount, onConfirm, onCancel }: BulkActionModalProps): JSX.Element {
    const getActionText = (action: string): string => {
        switch (action) {
            case 'send_notification': return 'mengirim notifikasi ke';
            case 'send_newsletter': return 'mengirim newsletter ke';
            case 'export': return 'mengekspor data';
            case 'deactivate': return 'menonaktifkan';
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
                            Apakah Anda yakin ingin {getActionText(action)} {selectedCount} pelanggan yang dipilih?
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
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Ya, Lanjutkan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
