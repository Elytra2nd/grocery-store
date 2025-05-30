import React, { useState, FormEvent } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    EyeIcon,
    PencilIcon,
    UserIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    UserGroupIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import Pagination from '@/Components/Pagination';

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
        last_page_url?: string;
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
            return { level: 'medium', color: 'bg-orange-100 text-orange-800', label: 'Aktif' };
        } else if (ordersCount >= 1 && daysSinceLogin <= 30) {
            return { level: 'low', color: 'bg-yellow-100 text-yellow-800', label: 'Cukup Aktif' };
        } else {
            return { level: 'inactive', color: 'bg-gray-100 text-gray-800', label: 'Kurang Aktif' };
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pelanggan Aktif" />

            <div className="py-8 min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="md:flex md:items-center md:justify-between mb-6">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3 animate-pulse" />
                                <div>
                                    <h2 className="text-2xl font-bold leading-7 text-amber-900 sm:text-3xl">
                                        Pelanggan Aktif
                                    </h2>
                                    <p className="text-sm text-amber-700">
                                        Kelola pelanggan yang aktif menggunakan platform
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                            <button
                                onClick={() => router.reload()}
                                className="inline-flex items-center px-4 py-2 border border-amber-300 rounded-md shadow-sm text-sm font-medium text-amber-700 bg-white hover:bg-amber-100 transition-all duration-150"
                            >
                                <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
                                Refresh
                            </button>
                            <Link
                                href="/admin/users"
                                className="inline-flex items-center px-4 py-2 border border-amber-300 rounded-md shadow-sm text-sm font-medium text-amber-700 bg-white hover:bg-amber-100 transition-all duration-150"
                            >
                                Semua Pelanggan
                            </Link>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg animate-fade-in-up">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                                {flash.success}
                            </div>
                        </div>
                    )}

                    {flash.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg animate-fade-in-up">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                                {flash.error}
                            </div>
                        </div>
                    )}

                    {/* Statistik Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        <StatCard title="Total Aktif" value={formatNumber(safeStatistics.total_active)} color="green" icon="👥" />
                        <StatCard title="Baru Bulan Ini" value={formatNumber(safeStatistics.new_this_month)} color="orange" icon="🆕" />
                        <StatCard title="Pernah Belanja" value={formatNumber(safeStatistics.with_orders)} color="amber" icon="🛒" />
                        <StatCard title="Total Belanja" value={formatCurrency(safeStatistics.total_spent)} color="yellow" icon="💰" />
                        <StatCard title="Rata-rata Order" value={formatNumber(safeStatistics.average_orders)} color="lime" icon="📊" />
                        <StatCard title="Aktif 30 Hari" value={formatNumber(safeStatistics.last_30_days)} color="indigo" icon="📅" />
                    </div>

                    {/* Filter */}
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
                                ...users,
                                last_page_url: users.last_page_url || users.first_page_url
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

// StatCard - Diperbaiki untuk lebih compact
function StatCard({ title, value, color, icon }: { title: string; value: string; color: string; icon: string }) {
    const colorClasses: Record<string, string> = {
        green: 'bg-green-500',
        orange: 'bg-orange-500',
        amber: 'bg-amber-500',
        yellow: 'bg-yellow-500',
        lime: 'bg-lime-500',
        indigo: 'bg-indigo-500',
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="p-4 flex items-center">
                <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-sm">{icon}</span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                    <dt className="text-xs font-medium text-amber-700 truncate">{title}</dt>
                    <dd className="text-sm font-semibold text-amber-900 truncate">{value}</dd>
                </div>
            </div>
        </div>
    );
}

// FilterForm
function FilterForm({ onSubmit, filters }: { onSubmit: (e: FormEvent<HTMLFormElement>) => void; filters: UserFilters }) {
    return (
        <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-amber-900">
                                Pencarian
                            </label>
                            <input
                                type="text"
                                name="search"
                                defaultValue={filters.search || ''}
                                placeholder="Nama atau email pelanggan..."
                                className="mt-1 block w-full border-amber-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-amber-900">
                                Level Aktivitas
                            </label>
                            <select
                                name="activity_level"
                                defaultValue={filters.activity_level || ''}
                                className="mt-1 block w-full border-amber-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            >
                                <option value="">Semua Level</option>
                                <option value="high">Sangat Aktif</option>
                                <option value="medium">Aktif</option>
                                <option value="low">Cukup Aktif</option>
                                <option value="inactive">Kurang Aktif</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-amber-900">
                                Dari Tanggal
                            </label>
                            <input
                                type="date"
                                name="date_from"
                                defaultValue={filters.date_from || ''}
                                className="mt-1 block w-full border-amber-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-amber-900">
                                Sampai Tanggal
                            </label>
                            <input
                                type="date"
                                name="date_to"
                                defaultValue={filters.date_to || ''}
                                className="mt-1 block w-full border-amber-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-150"
                        >
                            <FunnelIcon className="-ml-1 mr-2 h-4 w-4" />
                            Filter
                        </button>
                        <Link
                            href="/admin/users/active"
                            className="inline-flex items-center px-4 py-2 border border-amber-300 text-sm font-medium rounded-md text-amber-700 bg-white hover:bg-amber-100 transition-all duration-150"
                        >
                            Reset
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

// BulkActions
function BulkActions({ selectedCount, bulkAction, setBulkAction, onExecute }: {
    selectedCount: number;
    bulkAction: string;
    setBulkAction: (action: string) => void;
    onExecute: () => void;
}) {
    return (
        <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-3 sm:px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-sm text-amber-900">
                            {selectedCount} pelanggan dipilih
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <select
                            value={bulkAction}
                            onChange={(e) => setBulkAction(e.target.value)}
                            className="border-amber-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition-all duration-150"
                        >
                            Jalankan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ActiveUsersTable - DIPERBAIKI untuk layout yang konsisten
function ActiveUsersTable({
    users,
    selectedUsers,
    onToggleSelection,
    onToggleSelectAll,
    formatCurrency,
    getActivityLevel
}: {
    users: User[];
    selectedUsers: number[];
    onToggleSelection: (id: number) => void;
    onToggleSelectAll: () => void;
    formatCurrency: (amount: number | null | undefined) => string;
    getActivityLevel: (user: User) => { level: string; color: string; label: string };
}): JSX.Element {
    if (!users || users.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-12 text-center">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-amber-300 animate-pulse" />
                    <h3 className="mt-2 text-sm font-medium text-amber-900">Tidak ada pelanggan aktif</h3>
                    <p className="mt-1 text-sm text-amber-700">
                        Belum ada pelanggan yang aktif menggunakan platform.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {/* Container dengan kontrol scroll yang lebih baik */}
            <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-amber-100" style={{ tableLayout: 'fixed', width: '100%' }}>
                        <thead className="bg-green-50 sticky top-0 z-10">
                            <tr>
                                <th className="w-12 px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length === users.length && users.length > 0}
                                        onChange={onToggleSelectAll}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-amber-300 rounded"
                                    />
                                </th>
                                <th className="w-1/4 min-w-[280px] px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                                    Pelanggan
                                </th>
                                <th className="w-1/5 min-w-[220px] px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                                    Kontak
                                </th>
                                <th className="w-32 px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                                    Aktivitas
                                </th>
                                <th className="w-40 px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                                    Statistik Belanja
                                </th>
                                <th className="w-36 px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                                    Terakhir Login
                                </th>
                                <th className="w-24 px-4 py-3 text-right text-xs font-medium text-amber-700 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-amber-50">
                            {users.map((user) => {
                                const activity = getActivityLevel(user);
                                return (
                                    <tr key={user.id} className="hover:bg-green-50 transition-colors duration-150">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => onToggleSelection(user.id)}
                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-amber-300 rounded"
                                            />
                                        </td>
                                        <td className="px-4 py-4">
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
                                                <div className="ml-4 min-w-0 flex-1">
                                                    <div className="text-sm font-medium text-amber-900 truncate">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm text-amber-700">
                                                        ID: {user.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-amber-900 truncate" title={user.email}>
                                                {user.email}
                                            </div>
                                            <div className="text-sm text-amber-700 truncate">
                                                {user.phone || 'Tidak ada nomor'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.color}`}>
                                                {activity.label}
                                            </span>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {user.orders_count || 0} pesanan
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-amber-900">
                                                {formatCurrency(user.total_spent)}
                                            </div>
                                            <div className="text-sm text-amber-700 truncate">
                                                {user.last_order_date ?
                                                    `Terakhir: ${new Date(user.last_order_date).toLocaleDateString('id-ID')}` :
                                                    'Belum pernah belanja'
                                                }
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-amber-700">
                                            {user.last_login_at ? (
                                                <div>
                                                    <div>{new Date(user.last_login_at).toLocaleDateString('id-ID')}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(user.last_login_at).toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                            ) : (
                                                'Belum pernah login'
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-1">
                                                <Link
                                                    href={`/admin/users/${user.id}`}
                                                    className="text-green-600 hover:text-green-900 p-2 rounded-md hover:bg-green-100 transition-all duration-150"
                                                    title="Lihat Detail"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/users/${user.id}/edit`}
                                                    className="text-amber-700 hover:text-amber-900 p-2 rounded-md hover:bg-amber-100 transition-all duration-150"
                                                    title="Edit Pelanggan"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
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
        </div>
    );
}

// BulkActionModal
function BulkActionModal({ action, selectedCount, onConfirm, onCancel }: {
    action: string;
    selectedCount: number;
    onConfirm: () => void;
    onCancel: () => void;
}) {
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white animate-fade-in-up">
                <div className="mt-3 text-center">
                    <h3 className="text-lg font-medium text-amber-900">
                        Konfirmasi Aksi
                    </h3>
                    <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-amber-700">
                            Apakah Anda yakin ingin {getActionText(action)} {selectedCount} pelanggan yang dipilih?
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
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-150"
                        >
                            Ya, Lanjutkan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
