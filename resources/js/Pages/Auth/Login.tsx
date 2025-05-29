import React, { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200">
                <div className="w-full max-w-md p-8 rounded-3xl border border-amber-300 shadow-2xl bg-white/90 backdrop-blur-md animate-fade-in
                    transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(255,193,7,0.2)]">
                    <div className="flex flex-col items-center mb-8">
                        <div className="h-16 w-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg mb-3 animate-bounce-slow">
                            <LockClosedIcon className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-amber-900 mb-1 tracking-tight drop-shadow">Selamat Datang Kembali</h2>
                        <p className="text-amber-700 text-sm">Silakan login ke akun Anda</p>
                    </div>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600 animate-fade-in">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <div className="relative mt-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400">
                                    <EnvelopeIcon className="h-5 w-5" />
                                </span>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full pl-10"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <div className="relative mt-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400">
                                    <LockClosedIcon className="h-5 w-5" />
                                </span>
                                <TextInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className="block w-full pl-10 pr-10"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-700 transition"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData('remember', e.target.checked)
                                    }
                                />
                                <span className="ms-2 text-sm text-amber-700">Ingat saya</span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-amber-600 hover:text-amber-800 underline transition"
                                >
                                    Lupa password?
                                </Link>
                            )}
                        </div>

                        <div>
                            <PrimaryButton
                                className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 shadow-lg hover:shadow-xl hover:from-amber-700 hover:to-yellow-600 text-lg font-bold py-3 tracking-wide transition-all duration-200"
                                disabled={processing}
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                        </svg>
                                        Memproses...
                                    </span>
                                ) : (
                                    'Log in'
                                )}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
            <style>
                {`
                .animate-fade-in {
                    animation: fadeIn 0.7s;
                }
                .animate-bounce-slow {
                    animation: bounce 2s infinite;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(24px);}
                    to { opacity: 1; transform: translateY(0);}
                }
                `}
            </style>
        </>
    );
}
