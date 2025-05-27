// resources/js/Pages/Admin/Users/New.tsx
import React, { useState, FormEvent } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import {
    EyeIcon,
    PencilIcon,
    UserIcon,
    SparklesIcon,
    CalendarIcon,
    EnvelopeIcon,
    PhoneIcon,
    FunnelIcon,
    DocumentArrowDownIcon,
    ArrowPathIcon,
    UserGroupIcon,
    GiftIcon
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
    first_order_date?: string;
    registration_source?: string;
}

interface UserFilters {
    search?: string;
    date_from?: string;
    date_to?: string;
    registration_source?: string;
    has_ordered?: string;
    sort_by?: string;
    sort_order?: string;
}

interface Props extends PageProps {
    users: {
        data: User[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        first_page_url: string;
        last_page_url: string;
        next_page_url: string | null;
        path: string;
        prev_page_url: string | null;
    };
    statistics: {
        total_new: number;
        today: number;
        this_week: number;
        this_month: number;
        with_orders: number;
        without_orders: number;
        conversion_rate: number;
    };
    filters: UserFilters;
}

export default function NewUsers({ users, statistics, filters }: Props): JSX.Element {
    const pageProps = usePage<PageProps>().props;
    const flash = pageProps.flash ?? {};
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
    const [bulkAction, setBulkAction] = useState<string>('');

    // Safe fallbacks
    const safeUsers = users?.data || [];
    const safeStatistics = statistics || {
        total_new: 0,
        today: 0,
        this_week: 0,
        this_month: 0,
        with_orders: 0,
        without_orders: 0,
        conversion_rate: 0,
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
        router.get('/admin/users/new', searchParams as Record<string, any>, {
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

    const getDaysSinceRegistration = (createdAt: string): number => {
        const registrationDate = new Date(createdAt);
        const now = new Date();
        return Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getRegistrationBadge = (days: number): { color: string; label: string } => {
        if (days <= 1) {
            return { color: 'bg-green-100 text-green-800', label: 'Hari ini' };
        } else if (days <= 7) {
            return { color: 'bg-blue-100 text-blue-800', label: 'Minggu ini' };
        } else if (days <= 30) {
            return { color: 'bg-purple-100 text-purple-800', label: 'Bulan ini' };
        } else {
            return { color: 'bg-gray-100 text-gray-800', label: `${days} hari lalu` };
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pelanggan Baru" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="md:flex md:items-center md:justify-between mb-6">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                                <SparklesIcon className="h-8 w-8 text-blue-500 mr-3" />
                                <div>
                                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                                        Pelanggan Baru
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Kelola pelanggan yang baru bergabung dengan platform
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
                                <SparklesIcon className="h-5 w-5 text-green-400 mr-2" />
                                {flash.success}
                            </div>
                        </div>
                    )}

                    {flash.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            <div className="flex items-center">
                                <SparklesIcon className="h-5 w-5 text-red-400 mr-2" />
                                {flash.error}
                            </div>
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                        <StatCard
                            title="Total Baru"
                            value={formatNumber(safeStatistics.total_new)}
                            color="blue"
                            icon="👥"
                        />
                        <StatCard
                            title="Hari Ini"
                            value={formatNumber(safeStatistics.today)}
                            color="green"
                            icon="🆕"
                        />
                        <StatCard
                            title="Minggu Ini"
                            value={formatNumber(safeStatistics.this_week)}
                            color="purple"
                            icon="📅"
                        />
                        <StatCard
                            title="Bulan Ini"
                            value={formatNumber(safeStatistics.this_month)}
                            color="indigo"
                            icon="📊"
                        />
                        <StatCard
                            title="Sudah Belanja"
                            value={formatNumber(safeStatistics.with_orders)}
                            color="emerald"
                            icon="🛒"
                        />
                        <StatCard
                            title="Belum Belanja"
                            value={formatNumber(safeStatistics.without_orders)}
                            color="yellow"
                            icon="⏳"
                        />
                        <StatCard
                            title="Konversi"
                            value={`${safeStatistics.conversion_rate.toFixed(1)}%`}
                            color="pink"
                            icon="📈"
                        />
                    </div>

                    {/* Filters */}
                    <FilterForm
                        onSubmit={handleSearch}
                        filters={safeFilters}
                    />

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
                    <NewUsersTable
                        users={safeUsers}
                        selectedUsers={selectedUsers}
                        onToggleSelection={toggleUserSelection}
                        onToggleSelectAll={toggleSelectAll}
                        formatCurrency={formatCurrency}
                        getDaysSinceRegistration={getDaysSinceRegistration}
                        getRegistrationBadge={getRegistrationBadge}
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
                                // Add the following properties to match PaginationMeta
                                first_page_url: users.first_page_url,
                                last_page_url: users.last_page_url,
                                next_page_url: users.next_page_url,
                                path: users.path,
                                prev_page_url: users.prev_page_url,
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
    color: 'blue' | 'green' | 'purple' | 'indigo' | 'emerald' | 'yellow' | 'pink';
    icon: string;
}

function StatCard({ title, value, color, icon }: StatCardProps): JSX.Element {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        indigo: 'bg-indigo-500',
        emerald: 'bg-emerald-500',
        yellow: 'bg-yellow-500',
        pink: 'bg-pink-500',
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
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Pencarian
                            </label>
                            <input
                                type="text"
                                name="search"
                                defaultValue={filters.search || ''}
                                placeholder="Nama atau email pelanggan..."
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Status Pembelian
                            </label>
                            <select
                                name="has_ordered"
                                defaultValue={filters.has_ordered || ''}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">Semua Status</option>
                                <option value="yes">Sudah Belanja</option>
                                <option value="no">Belum Belanja</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Sumber Registrasi
                            </label>
                            <select
                                name="registration_source"
                                defaultValue={filters.registration_source || ''}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">Semua Sumber</option>
                                <option value="website">Website</option>
                                <option value="mobile">Mobile App</option>
                                <option value="social">Social Media</option>
                                <option value="referral">Referral</option>
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
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FunnelIcon className="-ml-1 mr-2 h-4 w-4" />
                            Filter
                        </button>

                        <Link
                            href="/admin/users/new"
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
                            {selectedCount} pelanggan baru dipilih
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <select
                            value={bulkAction}
                            onChange={(e) => setBulkAction(e.target.value)}
                            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="">Pilih Aksi</option>
                            <option value="send_welcome">Kirim Welcome Email</option>
                            <option value="send_discount">Kirim Diskon Welcome</option>
                            <option value="add_to_newsletter">Tambah ke Newsletter</option>
                            <option value="export">Export Data</option>
                        </select>
                        <button
                            onClick={onExecute}
                            disabled={!bulkAction}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                        >
                            Jalankan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// NewUsersTable Component
interface NewUsersTableProps {
    users: User[];
    selectedUsers: number[];
    onToggleSelection: (id: number) => void;
    onToggleSelectAll: () => void;
    formatCurrency: (amount: number | null | undefined) => string;
    getDaysSinceRegistration: (createdAt: string) => number;
    getRegistrationBadge: (days: number) => { color: string; label: string };
}

function NewUsersTable({
    users,
    selectedUsers,
    onToggleSelection,
    onToggleSelectAll,
    formatCurrency,
    getDaysSinceRegistration,
    getRegistrationBadge
}: NewUsersTableProps): JSX.Element {
    if (!users || users.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-12 text-center">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada pelanggan baru</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Belum ada pelanggan baru yang mendaftar.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.length === users.length && users.length > 0}
                                    onChange={onToggleSelectAll}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pelanggan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kontak
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tanggal Daftar
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status Pembelian
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email Verified
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => {
                            const daysSince = getDaysSinceRegistration(user.created_at);
                            const badge = getRegistrationBadge(daysSince);

                            return (
                                <tr key={user.id} className="hover:bg-blue-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => onToggleSelection(user.id)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <UserIcon className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                                    {user.name}
                                                    {daysSince <= 1 && (
                                                        <SparklesIcon className="h-4 w-4 text-yellow-500 ml-2" title="Pelanggan baru hari ini" />
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {user.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                            {user.email}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                                            {user.phone || 'Tidak ada nomor'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(user.created_at).toLocaleDateString('id-ID')}
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                                            {badge.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.orders_count && user.orders_count > 0 ? (
                                            <div>
                                                <div className="text-sm font-medium text-green-900">
                                                    {user.orders_count} pesanan
                                                </div>
                                                <div className="text-sm text-green-600">
                                                    {formatCurrency(user.total_spent)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Pertama: {user.first_order_date ?
                                                        new Date(user.first_order_date).toLocaleDateString('id-ID') :
                                                        'N/A'
                                                    }
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    <GiftIcon className="h-3 w-3 mr-1" />
                                                    Belum belanja
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.email_verified_at ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Unverified
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link
                                                href={`/admin/users/${user.id}`}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors duration-150"
                                                title="Lihat Detail"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </Link>
                                            <Link
                                                href={`/admin/users/${user.id}/edit`}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors duration-150"
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
            case 'send_welcome': return 'mengirim welcome email ke';
            case 'send_discount': return 'mengirim diskon welcome ke';
            case 'add_to_newsletter': return 'menambahkan ke newsletter';
            case 'export': return 'mengekspor data';
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
                            Apakah Anda yakin ingin {getActionText(action)} {selectedCount} pelanggan baru yang dipilih?
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Ya, Lanjutkan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
