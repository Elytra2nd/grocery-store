// resources/js/Pages/Admin/Users/Create.tsx
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface Props extends PageProps {
    roles: string[];
}

type UserFormData = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
    phone: string;
    address: string;
    avatar: File | null;
    is_active: boolean;
    [key: string]: any;
};

export default function UsersCreate({ roles }: Props): JSX.Element {
    const { data, setData, post, processing, errors } = useForm<UserFormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        phone: '',
        address: '',
        avatar: null,
        is_active: true,
    }) as {
        data: UserFormData;
        setData: (key: string, value: any) => void;
        post: (url: string, options?: object) => void;
        processing: boolean;
        errors: Record<string, string>;
    };

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState<boolean>(false);

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0] || null;
        setData('avatar', file);

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setAvatarPreview(e.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setAvatarPreview(null);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        // PERBAIKAN: Gunakan URL langsung
        post('/admin/users', {
            forceFormData: true,
            onSuccess: () => {
                // Redirect ke index setelah berhasil
                window.location.href = '/admin/users';
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-amber-900 leading-tight">
                    Pelanggan
                </h2>
            }
        >
            <Head title="Tambah User" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center">
                            {/* PERBAIKAN: URL yang benar untuk kembali */}
                            <Link
                                href="/admin/users"
                                className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-150"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                                Kembali
                            </Link>
                        </div>
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                            Tambah User Baru
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Lengkapi informasi user yang akan ditambahkan ke sistem
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <UserInfoSection
                            data={data}
                            setData={setData}
                            errors={errors}
                            roles={roles}
                            showPassword={showPassword}
                            showPasswordConfirmation={showPasswordConfirmation}
                            setShowPassword={setShowPassword}
                            setShowPasswordConfirmation={setShowPasswordConfirmation}
                        />

                        <AvatarUploadSection
                            avatarPreview={avatarPreview}
                            onAvatarChange={handleAvatarChange}
                            error={errors.avatar}
                        />

                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                            {/* PERBAIKAN: URL yang benar untuk tombol Batal */}
                            <Link
                                href="/admin/users"
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan User'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// PERBAIKAN: UserInfoSection dengan roles dropdown yang benar
interface UserInfoSectionProps {
    data: UserFormData;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
    roles: string[];
    showPassword: boolean;
    showPasswordConfirmation: boolean;
    setShowPassword: (show: boolean) => void;
    setShowPasswordConfirmation: (show: boolean) => void;
}

function UserInfoSection({
    data,
    setData,
    errors,
    roles,
    showPassword,
    showPasswordConfirmation,
    setShowPassword,
    setShowPasswordConfirmation
}: UserInfoSectionProps): JSX.Element {
    return (
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Informasi User
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Masukkan detail user yang akan ditambahkan ke sistem.
                    </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                    }`}
                                placeholder="Contoh: John Doe"
                                required
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                    }`}
                                placeholder="john@example.com"
                                required
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Nomor Telepon
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                    }`}
                                placeholder="08123456789"
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                        }`}
                                    placeholder="Minimal 8 karakter"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <EyeIcon className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                Konfirmasi Password <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.password_confirmation ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                        }`}
                                    placeholder="Ulangi password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                >
                                    {showPasswordConfirmation ? (
                                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <EyeIcon className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                            )}
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.role ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                    }`}
                                required
                            >
                                <option value="">Pilih Role</option>
                                {/* PERBAIKAN: Tambahkan options untuk roles */}
                                {roles && roles.length > 0 ? (
                                    roles.map((role) => (
                                        <option key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="admin">Admin</option>
                                        <option value="buyer">Buyer</option>
                                    </>
                                )}
                            </select>
                            {errors.role && (
                                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                            )}
                        </div>

                        <div className="col-span-6">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Alamat
                            </label>
                            <textarea
                                id="address"
                                rows={3}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                    }`}
                                placeholder="Alamat lengkap user..."
                            />
                            {errors.address && (
                                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                            )}
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Status User
                            </label>
                            <div className="mt-1">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">
                                        User Aktif (dapat login ke sistem)
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// AvatarUploadSection tetap sama
interface AvatarUploadSectionProps {
    avatarPreview: string | null;
    onAvatarChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

function AvatarUploadSection({ avatarPreview, onAvatarChange, error }: AvatarUploadSectionProps): JSX.Element {
    return (
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Foto Profil
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Upload foto profil user dengan format JPG, PNG, atau GIF. Maksimal 2MB.
                    </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${error ? 'border-red-300' : 'border-gray-300'
                        }`}>
                        <div className="space-y-1 text-center">
                            {avatarPreview ? (
                                <div className="mb-4">
                                    <img
                                        src={avatarPreview}
                                        alt="Preview"
                                        className="mx-auto h-32 w-32 object-cover rounded-full shadow-md"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        Preview foto profil
                                    </p>
                                </div>
                            ) : (
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 48 48"
                                >
                                    <path
                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                            <div className="flex text-sm text-gray-600">
                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                    <span>{avatarPreview ? 'Ganti foto' : 'Upload foto'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={onAvatarChange}
                                        className="sr-only"
                                    />
                                </label>
                                <p className="pl-1">atau drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                                PNG, JPG, GIF hingga 2MB
                            </p>
                        </div>
                    </div>
                    {error && (
                        <p className="mt-1 text-sm text-red-600">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
