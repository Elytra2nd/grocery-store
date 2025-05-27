// resources/js/Pages/Admin/Users/Edit.tsx
import React, { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// Define User interface
interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    active: boolean;
}

// Define UserFormData interface
interface UserFormData {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    active: boolean;
    _method?: string;
}

// Fixed Props interface
interface Props extends PageProps {
    user: User;
}

export default function Edit({ user }: Props): JSX.Element {
    // Fixed useForm with proper UserFormData
    const { data, setData, put, processing, errors } = useForm<UserFormData>({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        active: user.active || false,
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        // Remove empty password fields if not changing password
        const submitData = { ...data };
        if (!submitData.password) {
            delete submitData.password;
            delete submitData.password_confirmation;
        }

        put(`/admin/users/${user.id}`, {
            data: submitData,
            onSuccess: () => {
                console.log('User updated successfully');
            },
            onError: (errors) => {
                console.error('Update failed:', errors);
            }
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit User: ${user.name}`} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="bg-white rounded-2xl shadow-xl border border-white/20 p-6 backdrop-blur-sm">
                            <div className="flex items-center mb-4">
                                <Link
                                    href="/admin/users"
                                    className="mr-4 inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-colors duration-150 group"
                                >
                                    <ArrowLeftIcon className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform duration-150" />
                                    Kembali ke Daftar User
                                </Link>
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                Edit User: {user.name}
                            </h1>
                            <p className="text-slate-600 mt-2">
                                Update informasi pengguna sistem
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-white rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm">
                                    <div className="px-6 py-8">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            Informasi User
                                        </h3>

                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Nama Lengkap
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                                    placeholder="Masukkan nama lengkap"
                                                    required
                                                />
                                                {errors.name && (
                                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {errors.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                                    placeholder="contoh@email.com"
                                                    required
                                                />
                                                {errors.email && (
                                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Password Baru (Opsional)
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={data.password || ''}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                                        placeholder="Kosongkan jika tidak ingin mengubah"
                                                    />
                                                    {errors.password && (
                                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            {errors.password}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Konfirmasi Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={data.password_confirmation || ''}
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                                        placeholder="Ulangi password baru"
                                                    />
                                                    {errors.password_confirmation && (
                                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            {errors.password_confirmation}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                                                <input
                                                    type="checkbox"
                                                    id="active"
                                                    checked={data.active}
                                                    onChange={(e) => setData('active', e.target.checked)}
                                                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded transition-colors duration-200"
                                                />
                                                <label htmlFor="active" className="text-sm font-medium text-slate-700 cursor-pointer">
                                                    User Aktif
                                                </label>
                                                <span className="text-xs text-slate-500 ml-2">
                                                    User aktif dapat login ke sistem
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex justify-end space-x-4">
                                    <Link
                                        href="/admin/users"
                                        className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 shadow-sm text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 px-6 py-3 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Simpan Perubahan
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* User Info */}
                            <div className="bg-white rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm">
                                <div className="px-6 py-8">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        Info User
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <span className="text-sm font-medium text-slate-600">ID User:</span>
                                            <span className="text-sm font-bold text-slate-900">#{user.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <span className="text-sm font-medium text-slate-600">Status Email:</span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                                user.email_verified_at
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {user.email_verified_at ? 'Terverifikasi' : 'Belum Verifikasi'}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <span className="text-sm font-medium text-slate-600 block mb-1">Terdaftar:</span>
                                            <span className="text-sm text-slate-900">{formatDate(user.created_at)}</span>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <span className="text-sm font-medium text-slate-600 block mb-1">Terakhir Update:</span>
                                            <span className="text-sm text-slate-900">{formatDate(user.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm">
                                <div className="px-6 py-8">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        Aksi Cepat
                                    </h3>
                                    <div className="space-y-3">
                                        <Link
                                            href={`/admin/users/${user.id}`}
                                            className="w-full inline-flex justify-center items-center gap-2 px-4 py-3 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 hover:scale-105"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Lihat Detail User
                                        </Link>
                                        {!user.email_verified_at && (
                                            <button
                                                type="button"
                                                className="w-full inline-flex justify-center items-center gap-2 px-4 py-3 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 hover:scale-105"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                Kirim Verifikasi Email
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
