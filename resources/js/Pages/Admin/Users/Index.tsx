import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { TrashIcon } from '@heroicons/react/24/outline';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    active: boolean;
    roles: { name: string }[];
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
    auth: any;
}

// DITAMBAHKAN: Delete Modal Component dengan Animasi
interface DeleteModalProps {
    show: boolean;
    user: User | null;
    isLoading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function DeleteModal({ show, user, isLoading, onConfirm, onCancel }: DeleteModalProps): JSX.Element {
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
                                Konfirmasi Hapus User
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
                            Apakah Anda yakin ingin menghapus user:
                        </p>
                        <div
                            className={`p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-l-4 border-amber-400 transition-all duration-500 delay-300 ${
                                isModalAnimating && !isClosing
                                    ? 'scale-100 opacity-100'
                                    : 'scale-95 opacity-0'
                            }`}
                        >
                            <p className="text-sm font-semibold text-gray-900 flex items-center">
                                <span className="text-lg mr-2">👤</span>
                                "{user?.name}"
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                Email: {user?.email}
                            </p>
                            <p className="text-xs text-gray-600">
                                Status: {user?.active ? 'Aktif' : 'Nonaktif'}
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
                                    : 'border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 hover:from-amber-100 hover:to-yellow-100 hover:border-amber-400 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500'
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

function getInitials(name: string): string {
    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length === 0) return '';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words[0].charAt(0).toUpperCase() + words[words.length - 1].charAt(0).toUpperCase();
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

export default function Index({ auth, users }: Props): JSX.Element {
    const { delete: destroy } = useForm();

    // DITAMBAHKAN: State untuk delete modal
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // DIPERBAIKI: Handle delete dengan modal
    const handleDelete = (user: User): void => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    // DITAMBAHKAN: Confirm delete function
    const confirmDeleteUser = (): void => {
        if (!userToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/users/${userToDelete.id}`, {
            onSuccess: () => {
                setIsDeleting(false);
                setShowDeleteModal(false);
                setUserToDelete(null);
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
            setUserToDelete(null);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen User" />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-8 backdrop-blur-sm">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-600 bg-clip-text text-transparent">
                                        Manajemen User
                                    </h1>
                                    <p className="text-amber-700 mt-2">
                                        Kelola semua pengguna sistem dengan mudah
                                    </p>
                                    <div className="flex items-center gap-4 mt-4 text-sm text-amber-800">
                                        <span className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            {users.data.filter(u => u.active).length} Aktif
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                            {users.total} Total User
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href='/admin/users/create'
                                    className="group relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                    <div className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-amber-100">
                                <thead>
                                    <tr className="bg-gradient-to-r from-amber-50 to-orange-50">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">
                                            Email Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">
                                            Terdaftar
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-amber-700 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-amber-50">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-amber-700 font-medium">Belum ada user</p>
                                                        <p className="text-amber-400 text-sm mt-1">Tambahkan user pertama untuk memulai</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-amber-50/60 transition-colors duration-150">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-lg">
                                                                <span className="text-white font-bold text-sm">
                                                                    {getInitials(user.name)}
                                                                </span>
                                                            </div>
                                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user.active ? 'bg-green-500' : 'bg-amber-400'}`}></div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-semibold text-amber-900 truncate">
                                                                    {user.name}
                                                                </p>
                                                            </div>
                                                            <p className="text-sm text-amber-700 truncate">
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
                                                        <div className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-green-600' : 'bg-red-600'}`}></div>
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
                                                    <div className="text-sm text-amber-900 font-medium">
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
                            <div className="bg-amber-50 border-t border-amber-200 px-6 py-4">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-sm text-amber-700">
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
                                                        ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg transform scale-105'
                                                        : link.url
                                                            ? 'text-amber-700 hover:bg-amber-100 hover:text-amber-900 hover:scale-105'
                                                            : 'text-amber-300 cursor-not-allowed'
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

            {/* DITAMBAHKAN: Enhanced Delete Confirmation Modal dengan Animasi */}
            <DeleteModal
                show={showDeleteModal}
                user={userToDelete}
                isLoading={isDeleting}
                onConfirm={confirmDeleteUser}
                onCancel={closeDeleteModal}
            />
        </AuthenticatedLayout>
    );
}
