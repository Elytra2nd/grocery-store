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
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">

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
        <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-amber-200/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="h-10 w-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-amber-500/30">
                                <span className="text-white font-bold text-lg">🌾</span>
                            </div>
                            <span className="text-2xl font-bold text-amber-700 tracking-wide drop-shadow-sm transition-colors duration-300 group-hover:text-amber-600">
                                Fresh Market
                            </span>
                        </Link>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="hidden md:flex space-x-6">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-amber-700 hover:text-amber-600 px-4 py-2 text-sm font-medium transition-all duration-300 relative group rounded-lg hover:bg-amber-100/50"
                            >
                                <span className="relative z-10">{item.name}</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 origin-center"></div>
                                {item.badge && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Cart */}
                        <Link
                            href="/cart"
                            className="relative p-3 text-amber-700 hover:text-amber-600 transition-all duration-300 rounded-xl hover:bg-amber-100/50 group"
                        >
                            <ShoppingCartIcon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                        </Link>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className={`flex items-center space-x-2 p-2 text-amber-700 hover:text-amber-600 transition-all duration-300 rounded-xl hover:bg-amber-100/50 group ${userMenuOpen ? 'bg-amber-100/70' : ''}`}
                            >
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-amber-500/30">
                                    <span className="text-sm font-medium text-white">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'B'}
                                    </span>
                                </div>
                                <span className="hidden md:block text-sm font-medium transition-colors duration-300">
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

            <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-xl bg-white/90 backdrop-blur-md ring-1 ring-amber-200 border border-amber-200 focus:outline-none z-20 animate-fade-in">
                <div className="px-4 py-4 border-b border-amber-200">
                    <p className="text-sm font-medium text-amber-900">{user?.name || 'User'}</p>
                    <p className="text-sm text-amber-700">{user?.email || 'user@example.com'}</p>
                    <p className="text-xs text-amber-600 mt-1 bg-amber-100 px-2 py-1 rounded-full inline-block">Buyer Account</p>
                </div>

                <div className="py-2">
                    <Link
                        href={route('buyer.profile.edit')}
                        className="flex items-center px-4 py-3 text-sm text-amber-700 hover:bg-amber-100/70 hover:text-amber-600 transition-all duration-300 group"
                        onClick={onClose}
                    >
                        <UserCircleIcon className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110" />
                        Profile Settings
                    </Link>

                    <Link
                        href={route('buyer.settings.index')}
                        className="flex items-center px-4 py-3 text-sm text-amber-700 hover:bg-amber-100/70 hover:text-amber-600 transition-all duration-300 group"
                        onClick={onClose}
                    >
                        <CogIcon className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110" />
                        Account Settings
                    </Link>
                </div>

                <div className="border-t border-amber-200 py-2">
                    <button
                        onClick={() => {
                            onClose();
                            onLogout();
                        }}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-amber-700 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110" />
                        Sign out
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
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
                <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-md animate-slide-down">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
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
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-md animate-slide-down">
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

            <style>{`
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-slide-down {
                    animation: slide-down 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
