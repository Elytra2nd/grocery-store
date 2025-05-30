// resources/js/Pages/Profile/Edit.tsx
import BuyerAuthenticatedLayout from '@/Layouts/BuyerAuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { UserCircleIcon, CogIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface ProfileEditProps extends PageProps<{
    mustVerifyEmail: boolean;
    status?: string;
}> { }

export default function Edit({ mustVerifyEmail, status }: ProfileEditProps) {
    return (
        <BuyerAuthenticatedLayout
            header={
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 rounded-2xl animate-gradient-shift"></div>
                    <div className="relative px-6 py-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg mb-4 animate-float">
                            <UserCircleIcon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                            Pengaturan Profil
                        </h1>
                        <p className="text-amber-600 mt-2 font-medium">
                            Kelola informasi akun dan keamanan Anda
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Profile Information Card */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse-slow"></div>
                        <div className="relative bg-white/80 backdrop-blur-md shadow-xl rounded-2xl border border-amber-200/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/20 hover:border-amber-300/70 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500"></div>

                            <div className="p-6 sm:p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                                        <UserCircleIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-amber-900">Informasi Profil</h2>
                                        <p className="text-amber-600 text-sm">Perbarui detail akun dan alamat email Anda</p>
                                    </div>
                                </div>

                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-xl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password Update Card */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse-slow"></div>
                        <div className="relative bg-white/80 backdrop-blur-md shadow-xl rounded-2xl border border-amber-200/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20 hover:border-yellow-300/70 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500"></div>

                            <div className="p-6 sm:p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl shadow-lg">
                                        <ShieldCheckIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-amber-900">Keamanan Password</h2>
                                        <p className="text-amber-600 text-sm">Pastikan akun Anda menggunakan password yang kuat</p>
                                    </div>
                                </div>

                                <UpdatePasswordForm className="max-w-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Delete Account Card */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse-slow"></div>
                        <div className="relative bg-white/80 backdrop-blur-md shadow-xl rounded-2xl border border-red-200/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 hover:border-red-300/70 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>

                            <div className="p-6 sm:p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg">
                                        <CogIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-red-900">Hapus Akun</h2>
                                        <p className="text-red-600 text-sm">Hapus akun Anda secara permanen dengan hati-hati</p>
                                    </div>
                                </div>

                                <DeleteUserForm className="max-w-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style>{`
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-6px); }
                }

                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }

                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-gradient-shift {
                    background-size: 200% 200%;
                    animation: gradient-shift 8s ease infinite;
                }

                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }

                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }

                .animate-slide-up {
                    animation: slide-up 0.6s ease-out forwards;
                    opacity: 0;
                }

                /* Smooth transitions for all interactive elements */
                * {
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Custom scrollbar styling */
                ::-webkit-scrollbar {
                    width: 8px;
                }

                ::-webkit-scrollbar-track {
                    background: rgba(245, 158, 11, 0.1);
                    border-radius: 10px;
                }

                ::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #f59e0b, #ea580c);
                    border-radius: 10px;
                }

                ::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #d97706, #dc2626);
                }
            `}</style>
        </BuyerAuthenticatedLayout>
    );
}
