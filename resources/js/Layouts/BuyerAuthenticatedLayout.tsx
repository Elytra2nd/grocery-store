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
        href: '/buyer/products',
        icon: ShoppingCartIcon,
    },
    {
        name: 'Keranjang',
        href: '/buyer/cart',
        icon: ShoppingCartIcon,
        badge: 3, // Dynamic cart count
    },
    {
        name: 'Pesanan Saya',
        href: '/buyer/orders',
        icon: ShoppingBagIcon,
    },
];

export default function BuyerAuthenticatedLayout({ children, header }: BuyerAuthenticatedLayoutProps): JSX.Element {
    const { auth, flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

    const handleLogout = (): void => {
        router.post(route('logout'));
    };

    return (
        <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Mobile sidebar */}
            <MobileSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                navigation={buyerNavigation}
            />

            {/* Desktop sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <BuyerSidebar navigation={buyerNavigation} />
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                {/* Top navigation */}
                <BuyerTopNavigation
                    setSidebarOpen={setSidebarOpen}
                    user={auth.user}
                    userMenuOpen={userMenuOpen}
                    setUserMenuOpen={setUserMenuOpen}
                    onLogout={handleLogout}
                />

                {/* Main content area */}
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                    <FlashMessages flash={flash} />
                    {header && (
                        <header className="px-6 py-6">
                            {header}
                        </header>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}

// Mobile Sidebar Component
interface MobileSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    navigation: NavigationItem[];
}

function MobileSidebar({ sidebarOpen, setSidebarOpen, navigation }: MobileSidebarProps): JSX.Element {
    if (!sidebarOpen) return <></>;

    return (
        <div className="fixed inset-0 flex z-40 md:hidden">
            <div
                className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800/95 backdrop-blur-md border-r border-gray-700/50">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-400 bg-gray-700/50 hover:bg-gray-600/50"
                        aria-label="Close sidebar"
                    >
                        <XMarkIcon className="h-6 w-6 text-emerald-400" />
                    </button>
                </div>
                <BuyerSidebar navigation={navigation} />
            </div>
        </div>
    );
}

// Buyer Sidebar Component
interface BuyerSidebarProps {
    navigation: NavigationItem[];
}

function BuyerSidebar({ navigation }: BuyerSidebarProps): JSX.Element {
    const { url } = usePage();

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-gray-800/95 backdrop-blur-md border-r border-gray-700/50">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                {/* Logo */}
                <div className="flex items-center flex-shrink-0 px-4 mb-8">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">🛒</span>
                            </div>
                        </div>
                        <div className="ml-3">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent">Neo-Forest Shop</h1>
                            <p className="text-xs text-gray-400">Buyer Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 space-y-1">
                    {navigation.map((item) => {
                        const isActive = url.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-in-out ${isActive
                                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30'
                                        : 'text-gray-300 hover:bg-gray-700/60 hover:text-emerald-300'
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-emerald-400'
                                        }`}
                                />
                                <span className="flex-1">{item.name}</span>
                                {item.badge && (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive
                                            ? 'bg-white bg-opacity-20 text-white'
                                            : 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                                        }`}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="flex-shrink-0 flex border-t border-gray-700/50 p-4">
                    <div className="flex-shrink-0 w-full group block">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-400">
                                    Neo-Forest Shop
                                </p>
                                <p className="text-xs text-gray-500">v1.0.0</p>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                <span className="text-xs text-gray-400">Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Buyer Top Navigation Component
interface BuyerTopNavigationProps {
    setSidebarOpen: (open: boolean) => void;
    user: PageProps['auth']['user'];
    userMenuOpen: boolean;
    setUserMenuOpen: (open: boolean) => void;
    onLogout: () => void;
}

function BuyerTopNavigation({
    setSidebarOpen,
    user,
    userMenuOpen,
    setUserMenuOpen,
    onLogout
}: BuyerTopNavigationProps): JSX.Element {
    return (
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-gray-800/60 backdrop-blur-md border-b border-gray-700/50 shadow-sm">
            <button
                onClick={() => setSidebarOpen(true)}
                className="px-4 border-r border-gray-700/50 text-gray-400 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 md:hidden transition-colors"
                aria-label="Open sidebar"
            >
                <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="flex-1 px-4 flex justify-between items-center">
                <div className="flex-1 flex">
                    <div className="w-full flex md:ml-0">
                        {/* Search bar */}
                        <div className="relative w-full max-w-lg">
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                <div className="ml-4 flex items-center md:ml-6 space-x-4">
                    <Link
                        href="/buyer/cart"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
                    >
                        <ShoppingCartIcon className="h-4 w-4 mr-2" />
                        Keranjang
                    </Link>

                    <button
                        type="button"
                        className="relative bg-gray-700/50 p-2 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300"
                        aria-label="View notifications"
                    >
                        <BellIcon className="h-5 w-5" />
                        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-gray-800 animate-pulse"></span>
                    </button>

                    <div className="ml-3 relative">
                        <div>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="max-w-xs bg-gray-700/50 hover:bg-gray-600/50 flex items-center text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 px-3 py-2 transition-all duration-300"
                                aria-expanded={userMenuOpen}
                                aria-haspopup="true"
                            >
                                <span className="sr-only">Open user menu</span>
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center shadow-md">
                                    <span className="text-sm font-medium text-white">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'B'}
                                    </span>
                                </div>
                                <span className="ml-2 text-gray-300 text-sm font-medium">
                                    {user?.name || 'Buyer'}
                                </span>
                            </button>
                        </div>

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

            <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-xl bg-gray-800/95 backdrop-blur-md ring-1 ring-gray-700/50 border border-gray-700/50 focus:outline-none z-20">
                <div className="px-4 py-4 border-b border-gray-700/50">
                    <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                    <p className="text-sm text-gray-400">{user?.email || 'user@example.com'}</p>
                    <p className="text-xs text-gray-500 mt-1">Buyer Account</p>
                </div>

                <div className="py-2">
                    <Link
                        href={route('buyer.profile.edit')}
                        className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-emerald-300 transition-colors rounded-lg mx-2"
                        onClick={onClose}
                    >
                        <UserCircleIcon className="h-5 w-5 mr-3" />
                        Profile Settings
                    </Link>

                    <Link
                        href={route('buyer.settings.index')}
                        className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-emerald-300 transition-colors rounded-lg mx-2"
                        onClick={onClose}
                    >
                        <CogIcon className="h-5 w-5 mr-3" />
                        Account Settings
                    </Link>
                </div>

                <div className="border-t border-gray-700/50 py-2">
                    <button
                        onClick={() => {
                            onClose();
                            onLogout();
                        }}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-colors rounded-lg mx-2"
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
                <div className="mb-4 bg-emerald-800/60 backdrop-blur-md border border-emerald-700/50 text-emerald-300 px-4 py-3 rounded-xl relative shadow-lg">
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
                <div className="mb-4 bg-red-800/60 backdrop-blur-md border border-red-700/50 text-red-300 px-4 py-3 rounded-xl relative shadow-lg">
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
