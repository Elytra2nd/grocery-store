import React, { useState, ReactNode } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    Bars3Icon,
    BellIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    CogIcon,
    HomeIcon,
    ShoppingCartIcon,
    ShoppingBagIcon,
    XMarkIcon,
    HeartIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
    name: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    badge?: number;
}

interface BuyerAuthenticatedLayoutProps {
    children: ReactNode;
    header?: ReactNode;
}

// Buyer Navigation
const buyerNavigation: NavigationItem[] = [
    {
        name: 'Dashboard',
        href: '/buyer/dashboard',
        icon: HomeIcon
    },
    {
        name: 'Produk',
        href: '/products',
        icon: ShoppingCartIcon,
    },
    {
        name: 'Pesanan Saya',
        href: '/orders',
        icon: ShoppingBagIcon,
    },
];

export default function BuyerAuthenticatedLayout({ children, header }: BuyerAuthenticatedLayoutProps): JSX.Element {
    const { auth, flash } = usePage<PageProps>().props;
    const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

    const handleLogout = (): void => {
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">

            {/* Main Navigation Bar */}
            <MainNavigationBar
                user={auth.user}
                userMenuOpen={userMenuOpen}
                setUserMenuOpen={setUserMenuOpen}
                onLogout={handleLogout}
                navigation={buyerNavigation}
            />

            {/* Main content */}
            <main className="relative z-0">
                <FlashMessages flash={flash} />
                {header && (
                    <header className="px-6 py-6">
                        {header}
                    </header>
                )}
                {children}
            </main>
        </div>
    );
}

// Main Navigation Bar Component
interface MainNavigationBarProps {
    user: PageProps['auth']['user'];
    userMenuOpen: boolean;
    setUserMenuOpen: (open: boolean) => void;
    onLogout: () => void;
    navigation: NavigationItem[];
}

function MainNavigationBar({
    user,
    userMenuOpen,
    setUserMenuOpen,
    onLogout,
    navigation
}: MainNavigationBarProps): JSX.Element {
    return (
        <div className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="h-10 w-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">🌱</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-800">Neo-Forest</span>
                        </Link>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="hidden md:flex space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors relative"
                            >
                                {item.name}
                                {item.badge && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Search Bar */}
                        <div className="relative hidden md:block">
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>

                        {/* Cart */}
                        <Link
                            href="/cart/index"

                            className="relative p-2 text-gray-700 hover:text-emerald-600 transition-colors"
                        >
                            <ShoppingCartIcon className="h-6 w-6" />
                            <span className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            </span>
                        </Link>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center space-x-2 p-2 text-gray-700 hover:text-emerald-600 transition-colors"
                            >
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'B'}
                                    </span>
                                </div>
                                <span className="hidden md:block text-sm font-medium">
                                    {user?.name || 'Buyer'}
                                </span>
                            </button>

                            {userMenuOpen && (
                                <UserDropdownMenu
                                    user={user}
                                    onLogout={onLogout}
                                    onClose={() => setUserMenuOpen(false)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// User Dropdown Menu Component
interface UserDropdownMenuProps {
    user: PageProps['auth']['user'];
    onLogout: () => void;
    onClose: () => void;
}

function UserDropdownMenu({ user, onLogout, onClose }: UserDropdownMenuProps): JSX.Element {
    return (
        <>
            <div
                className="fixed inset-0 z-10"
                onClick={onClose}
            />

            <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-xl bg-white ring-1 ring-gray-200 border border-gray-200 focus:outline-none z-20">
                <div className="px-4 py-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                    <p className="text-xs text-gray-400 mt-1">Buyer Account</p>
                </div>

                <div className="py-2">
                    <Link
                        href={route('buyer.profile.edit')}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={onClose}
                    >
                        <UserCircleIcon className="h-5 w-5 mr-3" />
                        Profile Settings
                    </Link>

                    <Link
                        href={route('buyer.settings.index')}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={onClose}
                    >
                        <CogIcon className="h-5 w-5 mr-3" />
                        Account Settings
                    </Link>
                </div>

                <div className="border-t border-gray-200 py-2">
                    <button
                        onClick={() => {
                            onClose();
                            onLogout();
                        }}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                        Sign out
                    </button>
                </div>
            </div>
        </>
    );
}

// Flash Messages Component
interface FlashMessagesProps {
    flash?: PageProps['flash'];
}

function FlashMessages({ flash }: FlashMessagesProps): JSX.Element {
    if (!flash || (!flash.success && !flash.error)) {
        return <></>;
    }

    return (
        <div className="p-4">
            {flash.success && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">{flash.success}</p>
                        </div>
                    </div>
                </div>
            )}

            {flash.error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">{flash.error}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
