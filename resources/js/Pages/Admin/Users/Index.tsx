// resources/js/Pages/Admin/Users/Index.tsx
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus user ini?')) {
            destroy(route('admin.users.destroy', id));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen User" />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Daftar User</h2>
                    <Link
                        href={route('admin.users.new')}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
                    >
                        + Tambah User
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100 text-left text-sm text-gray-600 uppercase tracking-wider">
                                <th className="px-4 py-2 border">ID</th>
                                <th className="px-4 py-2 border">Nama</th>
                                <th className="px-4 py-2 border">Email</th>
                                <th className="px-4 py-2 border">Status</th>
                                <th className="px-4 py-2 border">Status Email</th>
                                <th className="px-4 py-2 border">Terdaftar</th>
                                <th className="px-4 py-2 border text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4">
                                        Tidak ada user.
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((user) => (
                                    <tr key={user.id} className="text-sm border-t hover:bg-gray-50">
                                        <td className="px-4 py-2 border font-medium">{user.id}</td>
                                        <td className="px-4 py-2 border">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                                    <span className="text-indigo-600 font-semibold text-xs">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                {user.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 border">{user.email}</td>
                                        <td className="px-4 py-2 border">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    user.active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {user.active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 border">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    user.email_verified_at
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                            >
                                                {user.email_verified_at ? 'Terverifikasi' : 'Belum Verifikasi'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="px-4 py-2 border text-center space-x-2">
                                            <Link
                                                href={route('admin.users.edit', user.id)}
                                                className="inline-flex items-center px-3 py-1 bg-yellow-400 text-white text-xs rounded hover:bg-yellow-500"
                                            >
                                                Edit
                                            </Link>
                                            {user.id !== auth.user.id && (
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                                >
                                                    Hapus
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                            Menampilkan {((users.current_page - 1) * users.per_page) + 1} sampai{' '}
                            {Math.min(users.current_page * users.per_page, users.total)} dari {users.total} user
                        </div>
                        <div className="flex space-x-1">
                            {users.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-2 text-sm rounded ${
                                        link.active
                                            ? 'bg-indigo-600 text-white'
                                            : link.url
                                            ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
