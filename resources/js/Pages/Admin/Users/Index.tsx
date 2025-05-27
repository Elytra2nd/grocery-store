// resources/js/Pages/Admin/Users/Index.tsx
import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    active: boolean;
}

interface Props extends PageProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
}

export default function Index({ auth, users }: Props): JSX.Element {
    const { delete: destroy } = useForm();

    const handleDelete = (user: User): void => {
        if (confirm(`Apakah Anda yakin ingin menghapus user "${user.name}"?`)) {
            router.delete(`/admin/users/${user.id}`);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getInitials = (name: string) => {
        const words = name.trim().split(' ').filter(word => word.length > 0);

        if (words.length === 0) {
            return '';
        } else if (words.length === 1) {
            // Jika hanya ada satu kata, ambil huruf pertama saja
            return words[0].charAt(0).toUpperCase();
        } else {
            // Ambil huruf pertama dari kata pertama dan kata terakhir
            const firstInitial = words[0].charAt(0).toUpperCase();
            const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
            return firstInitial + lastInitial;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen User" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="bg-white rounded-2xl shadow-xl border border-white/20 p-8 backdrop-blur-sm">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                        Manajemen User
                                    </h1>
                                    <p className="text-slate-600 mt-2">
                                        Kelola semua pengguna sistem dengan mudah
                                    </p>
                                    <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            {users.data.filter(u => u.active).length} Aktif
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                            {users.total} Total User
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href='/admin/users/create'
                                    className="group relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Tambah User Baru
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-white/20 overflow-hidden backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead>
                                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Email Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Terdaftar
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-600 font-medium">Belum ada user</p>
                                                        <p className="text-slate-400 text-sm mt-1">Tambahkan user pertama untuk memulai</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user, index) => (
                                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                                                <span className="text-white font-bold text-sm">
                                                                    {getInitials(user.name)}
                                                                </span>
                                                            </div>
                                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user.active ? 'bg-green-500' : 'bg-slate-400'
                                                                }`}></div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-semibold text-slate-900 truncate">
                                                                    {user.name}
                                                                </p>
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-500 truncate">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${user.active
                                                            ? 'bg-green-100 text-green-800 ring-1 ring-green-600/20'
                                                            : 'bg-red-100 text-red-800 ring-1 ring-red-600/20'
                                                        }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-green-600' : 'bg-red-600'
                                                            }`}></div>
                                                        {user.active ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${user.email_verified_at
                                                            ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20'
                                                            : 'bg-amber-100 text-amber-800 ring-1 ring-amber-600/20'
                                                        }`}>
                                                        {user.email_verified_at ? (
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                        {user.email_verified_at ? 'Terverifikasi' : 'Belum Verifikasi'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-900 font-medium">
                                                        {formatDate(user.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            href={`/admin/users/${user.id}/edit`}
                                                            className="group inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-150 shadow-md hover:shadow-lg"
                                                        >
                                                            <svg className="w-3 h-3 group-hover:rotate-12 transition-transform duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Edit
                                                        </Link>
                                                        {user.id !== auth.user.id && (
                                                            <button
                                                                onClick={() => handleDelete(user)}
                                                                className="group inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-medium rounded-lg hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-150 shadow-md hover:shadow-lg"
                                                            >
                                                                <svg className="w-3 h-3 group-hover:scale-110 transition-transform duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Hapus
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Enhanced Pagination */}
                        {users.last_page > 1 && (
                            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-sm text-slate-600">
                                        <span className="font-medium">
                                            {((users.current_page - 1) * users.per_page) + 1}
                                        </span>
                                        {' '}-{' '}
                                        <span className="font-medium">
                                            {Math.min(users.current_page * users.per_page, users.total)}
                                        </span>
                                        {' '}dari{' '}
                                        <span className="font-medium">{users.total}</span>
                                        {' '}user
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {users.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${link.active
                                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                                                        : link.url
                                                            ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:scale-105'
                                                            : 'text-slate-400 cursor-not-allowed'
                                                    }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
