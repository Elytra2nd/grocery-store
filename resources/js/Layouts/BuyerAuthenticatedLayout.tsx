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
    PlusIcon,
    ChatBubbleLeftRightIcon,
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

// DIPERBAIKI: Buyer Navigation dengan route yang sesuai
const buyerNavigation: NavigationItem[] = [
    {
        name: 'Dashboard',
        href: '/dashboard',
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
    const [searchOpen, setSearchOpen] = useState<boolean>(false);

    const handleLogout = (): void => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
            {/* Floating Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-32 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Main Navigation Bar */}
            <MainNavigationBar
                user={auth.user}
                userMenuOpen={userMenuOpen}
                setUserMenuOpen={setUserMenuOpen}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                searchOpen={searchOpen}
                setSearchOpen={setSearchOpen}
                onLogout={handleLogout}
                navigation={buyerNavigation}
            />

            {/* DITAMBAHKAN: Enhanced Header Section */}
            {header && (
                <div className="relative z-40 bg-white/70 backdrop-blur-md shadow-lg border-b border-amber-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-8">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    {header}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Decorative bottom border */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400"></div>
                </div>
            )}

            {/* Main content */}
            <main className="relative z-0">
                <FlashMessages flash={flash} />
                {children}
            </main>
        </div>
    );
}


// Main Navigation Bar Component - ENHANCED
interface MainNavigationBarProps {
    user: PageProps['auth']['user'];
    userMenuOpen: boolean;
    setUserMenuOpen: (open: boolean) => void;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    searchOpen: boolean;
    setSearchOpen: (open: boolean) => void;
    onLogout: () => void;
    navigation: NavigationItem[];
}

function MainNavigationBar({
    user,
    userMenuOpen,
    setUserMenuOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    searchOpen,
    setSearchOpen,
    onLogout,
    navigation
}: MainNavigationBarProps): JSX.Element {
    const { url } = usePage();

    // Check if current route is active
    const isActiveRoute = (href: string): boolean => {
        if (href === '/dashboard') {
            return url === '/dashboard' || url === '/';
        }
        return url.startsWith(href);
    };

    return (
        <div className="relative z-50 bg-white/80 backdrop-blur-md shadow-lg border-b border-amber-200/50 top-0">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex items-center space-x-2 group">
                            <div className="h-10 w-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-amber-500/30 group-hover:rotate-12">
                                <span className="text-white font-bold text-lg">🌾</span>
                            </div>
                            <span className="text-2xl font-bold text-amber-700 tracking-wide drop-shadow-sm transition-colors duration-300 group-hover:text-amber-600">
                                Fresh Market
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Menu - ENHANCED */}
                    <nav className="hidden md:flex space-x-6">
                        {navigation.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = isActiveRoute(item.href);

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-300 relative group rounded-lg ${
                                        isActive
                                            ? 'text-amber-600 bg-amber-100/70 shadow-sm scale-105'
                                            : 'text-amber-700 hover:text-amber-600 hover:bg-amber-100/50 hover:scale-105'
                                    }`}
                                >
                                    <IconComponent className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                                    <span className="relative z-10">{item.name}</span>
                                    {!isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 origin-center"></div>
                                    )}
                                    {item.badge && (
                                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                                            {item.badge}
                                        </span>
                                    )}
                                    {isActive && (
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Side Actions - ENHANCED */}
                    <div className="flex items-center space-x-4">

                        {/* Cart with Badge */}
                        <Link
                            href="/cart"
                            className="relative p-3 text-amber-700 hover:text-amber-600 transition-all duration-300 rounded-xl hover:bg-amber-100/50 group"
                        >
                            <ShoppingCartIcon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                            <span className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                            </span>
                        </Link>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-amber-700 hover:text-amber-600 transition-all duration-300 rounded-xl hover:bg-amber-100/50"
                        >
                            {mobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" />
                            )}
                        </button>

                        {/* Enhanced User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className={`flex items-center space-x-2 p-2 text-amber-700 hover:text-amber-600 transition-all duration-300 rounded-xl hover:bg-amber-100/50 group ${userMenuOpen ? 'bg-amber-100/70 scale-105' : ''}`}
                            >
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-amber-500/30">
                                    <span className="text-sm font-medium text-white">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'B'}
                                    </span>
                                </div>
                                <span className="hidden lg:block text-sm font-medium transition-colors duration-300">
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

                {/* DITAMBAHKAN: Search Bar */}
                {searchOpen && (
                    <div className="border-t border-amber-200 bg-white/90 backdrop-blur-md py-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cari produk grocery..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 focus:ring-4 transition-all duration-300"
                                autoFocus
                            />
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-500" />
                        </div>
                    </div>
                )}

                {/* Mobile Navigation Menu - ENHANCED */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-amber-200 bg-white/90 backdrop-blur-md">
                        <div className="px-4 py-4 space-y-2">
                            {navigation.map((item) => {
                                const IconComponent = item.icon;
                                const isActive = isActiveRoute(item.href);

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-all duration-300 rounded-lg ${
                                            isActive
                                                ? 'text-amber-600 bg-amber-100/70 shadow-sm scale-105'
                                                : 'text-amber-700 hover:text-amber-600 hover:bg-amber-100/50'
                                        }`}
                                    >
                                        <IconComponent className="h-5 w-5" />
                                        <span>{item.name}</span>
                                        {item.badge && (
                                            <span className="ml-auto bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Enhanced User Dropdown Menu Component
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

            <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-xl shadow-xl bg-white/95 backdrop-blur-md ring-1 ring-amber-200 border border-amber-200 focus:outline-none z-20 animate-fade-in overflow-hidden">
                {/* User Info Header */}
                <div className="px-4 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                            <span className="text-lg font-bold text-white">
                                {user?.name?.charAt(0)?.toUpperCase() || 'B'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-amber-900">{user?.name || 'User'}</p>
                            <p className="text-sm text-amber-700">{user?.email || 'user@example.com'}</p>
                            <p className="text-xs text-amber-600 mt-1 bg-amber-100 px-2 py-1 rounded-full inline-block">
                                🛒 Akun Pembeli
                            </p>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                    <Link
                        href="/profile"
                        className="flex items-center px-4 py-3 text-sm text-amber-700 hover:bg-amber-100/70 hover:text-amber-600 transition-all duration-300 group"
                        onClick={onClose}
                    >
                        <UserCircleIcon className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110" />
                        <div>
                            <div className="font-medium">Pengaturan Profil</div>
                            <div className="text-xs text-gray-500">Kelola profil Anda</div>
                        </div>
                    </Link>
                </div>

                {/* Logout Section */}
                <div className="border-t border-amber-200 py-2 bg-gradient-to-r from-red-50 to-orange-50">
                    <button
                        onClick={() => {
                            onClose();
                            onLogout();
                        }}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-all duration-300 group"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110" />
                        <div>
                            <div className="font-medium">Sign out</div>
                            <div className="text-xs text-red-500">Keluar dari akun</div>
                        </div>
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </>
    );
}

// Enhanced Flash Messages Component
interface FlashMessagesProps {
    flash?: PageProps['flash'];
}

function FlashMessages({ flash }: FlashMessagesProps): JSX.Element {
    const [visible, setVisible] = useState<Record<string, boolean>>({
        success: true,
        error: true
    });

    React.useEffect(() => {
        if (flash?.success || flash?.error) {
            const timer = setTimeout(() => {
                setVisible({ success: false, error: false });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!flash || (!flash.success && !flash.error)) {
        return <></>;
    }

    return (
        <div className="relative z-50 p-4">
            {flash.success && visible.success && (
                <div className="mb-4 bg-green-50/90 backdrop-blur-md border border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-lg animate-slide-down relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10"></div>
                    <div className="relative flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-semibold">Berhasil!</p>
                            <p className="text-sm">{flash.success}</p>
                        </div>
                        <button
                            onClick={() => setVisible(prev => ({ ...prev, success: false }))}
                            className="ml-3 text-green-600 hover:text-green-800 transition-colors duration-200 p-1 rounded-lg hover:bg-green-100"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}

            {flash.error && visible.error && (
                <div className="mb-4 bg-red-50/90 backdrop-blur-md border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-lg animate-slide-down relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10"></div>
                    <div className="relative flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-semibold">Error!</p>
                            <p className="text-sm">{flash.error}</p>
                        </div>
                        <button
                            onClick={() => setVisible(prev => ({ ...prev, error: false }))}
                            className="ml-3 text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-lg hover:bg-red-100"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .animate-slide-down {
                    animation: slide-down 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
