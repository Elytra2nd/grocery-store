// resources/js/Pages/Welcome.tsx
import { Link, Head } from '@inertiajs/react';
import { PageProps } from '@/types';

interface WelcomeProps extends PageProps<{
    canLogin: boolean;
    canRegister: boolean;
    laravelVersion: string;
    phpVersion: string;
}> {}

export default function Welcome({
    auth,
    canLogin,
    canRegister,
    laravelVersion,
    phpVersion
}: WelcomeProps) {
    // Safe route usage dengan multiple fallbacks
    const getDashboardUrl = () => {
        try {
            if (typeof window !== 'undefined' && window.route) {
                const url = window.route('dashboard');
                return url && url !== '/' ? url : '/dashboard';
            }
            return '/dashboard';
        } catch (error) {
            console.error('Error getting dashboard URL:', error);
            return '/dashboard';
        }
    };

    const getLoginUrl = () => {
        try {
            if (typeof window !== 'undefined' && window.route) {
                const url = window.route('login');
                return url && url !== '/' ? url : '/login';
            }
            return '/login';
        } catch (error) {
            console.error('Error getting login URL:', error);
            return '/login';
        }
    };

    const getRegisterUrl = () => {
        try {
            if (typeof window !== 'undefined' && window.route) {
                const url = window.route('register');
                return url && url !== '/' ? url : '/register';
            }
            return '/register';
        } catch (error) {
            console.error('Error getting register URL:', error);
            return '/register';
        }
    };

    return (
        <>
            <Head title="Welcome" />
            <div className="relative sm:flex sm:justify-center sm:items-center min-h-screen bg-dots-darker bg-center bg-gray-100 selection:bg-red-500 selection:text-white">
                <div className="sm:fixed sm:top-0 sm:right-0 p-6 text-right z-10">
                    {auth.user ? (
                        <Link
                            href={getDashboardUrl()}
                            className="font-semibold text-gray-600 hover:text-gray-900 focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            {canLogin && (
                                <Link
                                    href={getLoginUrl()}
                                    className="font-semibold text-gray-600 hover:text-gray-900 focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                                >
                                    Log in
                                </Link>
                            )}

                            {canRegister && (
                                <Link
                                    href={getRegisterUrl()}
                                    className="ml-4 font-semibold text-gray-600 hover:text-gray-900 focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                                >
                                    Register
                                </Link>
                            )}
                        </>
                    )}
                </div>

                <div className="max-w-7xl mx-auto p-6 lg:p-8">
                    <div className="flex justify-center">
                        <h1 className="text-6xl font-bold text-gray-900">
                            Welcome to Grocery Store
                        </h1>
                    </div>

                    <div className="mt-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            <div className="scale-100 p-6 bg-white from-gray-700/50 via-transparent rounded-lg shadow-2xl shadow-gray-500/20 flex motion-safe:hover:scale-[1.01] transition-all duration-250 focus:outline focus:outline-2 focus:outline-red-500">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Laravel v{laravelVersion}
                                    </h2>
                                    <p className="mt-4 text-gray-500 text-sm leading-relaxed">
                                        Laravel has wonderful documentation covering every aspect of the framework.
                                    </p>
                                </div>
                            </div>

                            <div className="scale-100 p-6 bg-white from-gray-700/50 via-transparent rounded-lg shadow-2xl shadow-gray-500/20 flex motion-safe:hover:scale-[1.01] transition-all duration-250 focus:outline focus:outline-2 focus:outline-red-500">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        PHP v{phpVersion}
                                    </h2>
                                    <p className="mt-4 text-gray-500 text-sm leading-relaxed">
                                        PHP is a popular general-purpose scripting language that is especially suited to web development.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
