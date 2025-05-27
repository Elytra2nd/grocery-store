// resources/js/Layouts/AuthenticatedLayout.tsx
import React, { useState, ReactNode } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

import { PageProps } from '@/types';
import {
    Bars3Icon,
    BellIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    CogIcon,
    CubeIcon,
    HomeIcon,
    ShoppingCartIcon,
    UsersIcon,
    ChartBarIcon,
    ShoppingBagIcon,
    XMarkIcon,
    DocumentChartBarIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

// Autumn Modern Minimalist Palette
const autumn = {
    burnt: 'bg-[#a14e3e]',     // burnt orange
    amber: 'bg-[#f9d282]',     // cozy amber
    olive: 'bg-[#7d835a]',     // muted olive
    brown: 'bg-[#5d4035]',     // bark brown
    cream: 'bg-[#e9e4db]',     // soft cream
    black: 'bg-[#18181b]',     // rich black
    accent: 'bg-[#c19a5b]',    // warm gold
    text: 'text-[#5d4035]',    // brown text
    textDark: 'text-[#18181b]',
    textLight: 'text-[#e9e4db]',
    border: 'border-[#c19a5b]',
};

interface NavigationItem {
    name: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    badge?: number;
    children?: NavigationSubItem[];
}

interface NavigationSubItem {
    name: string;
    href: string;
}

interface AuthenticatedLayoutProps {
    children: ReactNode;
    header?: ReactNode;
}

// Get order_count from pageProps if available
function getPesananBadge(pageProps: PageProps): number {
    const count = (pageProps as any)?.order_count ?? (pageProps as any)?.orders_count;
    return typeof count === 'number' ? count : 0;
}
const adminNavigation = (pesananBadge: number): NavigationItem[] => [
    {
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: HomeIcon
    },
    {
        name: 'Produk',
        href: '/admin/products',
        icon: CubeIcon,
        children: [
            { name: 'Semua Produk', href: '/admin/products' },
            { name: 'Tambah Produk', href: '/admin/products/create' },
            { name: 'Kategori', href: '/admin/categories' },
            { name: 'Stok Rendah', href: '/admin/products/low-stock' },
        ]
    },
    {
        name: 'Pesanan',
        href: '/admin/orders',
        icon: ShoppingCartIcon,
        badge: pesananBadge,
        children: [
            { name: 'Semua Pesanan', href: '/admin/orders' },
            { name: 'Pesanan Baru', href: '/admin/orders/pending' },
        ]
    },
    {
        name: 'Pelanggan',
        href: '/admin/users',
        icon: UsersIcon,
        children: [
            { name: 'Semua Pelanggan', href: '/admin/users' },
            { name: 'Pelanggan Aktif', href: '/admin/users/active' },
        ]
    },
    {
        name: 'Laporan',
        href: '/admin/reports',
        icon: ChartBarIcon,
        children: [
            { name: 'Dashboard Laporan', href: '/admin/reports' },
            { name: 'Laporan Penjualan', href: '/admin/reports/sales' },
            { name: 'Laporan Produk', href: '/admin/reports/products' },
            { name: 'Laporan Pelanggan', href: '/admin/reports/customers' },
        ]
    },
    {
        name: 'Pengaturan',
        href: '/admin/settings',
        icon: CogIcon,
        children: [
            { name: 'Pengaturan Umum', href: '/admin/settings/general' },
            { name: 'Pengaturan Toko', href: '/admin/settings/store' },
            { name: 'Pengaturan Pembayaran', href: '/admin/settings/payment' },
            { name: 'Pengaturan Pengiriman', href: '/admin/settings/shipping' },
        ]
    },
];

export default function AuthenticatedLayout({ children, header }: AuthenticatedLayoutProps): JSX.Element {
    const pageProps = usePage<PageProps>().props;
    // Check if user is admin dengan null safety
    const isAdmin = pageProps.auth?.user?.roles?.some((role: { name: string }) => role.name === 'admin') || false;
    const pesananBadge = getPesananBadge(pageProps);
    const navigation = isAdmin ? adminNavigation(pesananBadge) : [];

    // Add sidebarOpen and userMenuOpen state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = (): void => {
        router.post('/logout');
    };

    // Admin layout
    const flash = pageProps.flash;

    if (isAdmin) {
        return (
            <div className="h-screen flex overflow-hidden bg-[#e9e4db] font-sans">
                {/* Mobile sidebar */}
                <MobileSidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    navigation={navigation}
                />

                {/* Desktop sidebar */}
                <div className="hidden md:flex md:flex-shrink-0">
                    <div className="flex flex-col w-64">
                        <AdminSidebar navigation={navigation} />
                    </div>
                </div>

                {/* Main content */}
                <div className="flex flex-col w-0 flex-1 overflow-hidden">
                    {/* Top navigation */}
                    <AdminTopNavigation
                        setSidebarOpen={setSidebarOpen}
                        user={pageProps.auth?.user}
                        userMenuOpen={userMenuOpen}
                        setUserMenuOpen={setUserMenuOpen}
                        onLogout={handleLogout}
                    />

                    {/* Main content area */}
                    <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-[#e9e4db]">
                        <FlashMessages flash={flash} />
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    // User layout (original Breeze layout)
    return (
        <div className="min-h-screen bg-[#e9e4db]">
            <nav className="bg-[#e9e4db] border-b border-[#c19a5b]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/">
                                    <div className="h-8 w-8 bg-gradient-to-r from-[#a14e3e] to-[#c19a5b] rounded-lg flex items-center justify-center">
                                        <ShoppingBagIcon className="h-5 w-5 text-[#e9e4db]" />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            {header && (
                <header className="bg-[#e9e4db] shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}
            <main>
                <FlashMessages flash={flash} />
                {children}
            </main>
        </div>
    );
}

// === ADMIN COMPONENTS ===

function MobileSidebar({
    sidebarOpen,
    setSidebarOpen,
    navigation,
}: {
    sidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    navigation: NavigationItem[];
}): JSX.Element {
    if (!sidebarOpen) return <></>;
    return (
        <div className="fixed inset-0 flex z-40 md:hidden">
            <div
                className="fixed inset-0 bg-[#a14e3e] bg-opacity-70 transition-opacity duration-300"
                onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#e9e4db] shadow-xl transition-transform duration-300 animate-slide-in-left">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                        onClick={() => setSidebarOpen((v: boolean) => !v)}
                        className="p-2 rounded focus:outline-none hover:bg-gray-200"
                        aria-label="Toggle sidebar"
                    >
                        <Bars3Icon className="h-6 w-6 text-gray-600" />
                    </button>
                </div>
                <AdminSidebar navigation={navigation} />
            </div>
        </div>
    );
}

function AdminSidebar({ navigation }: { navigation: NavigationItem[] }): JSX.Element {
    const { url } = usePage();
    const [expandedItems, setExpandedItems] = useState<string[]>(['Laporan']);
    const toggleExpanded = (itemName: string): void => {
        setExpandedItems(prev =>
            prev.includes(itemName)
                ? prev.filter(name => name !== itemName)
                : [...prev, itemName]
        );
    };
    return (
        <div className="flex-1 flex flex-col min-h-0 border-r border-[#c19a5b] bg-[#e9e4db]">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4 mb-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-gradient-to-r from-[#a14e3e] to-[#c19a5b] rounded-xl flex items-center justify-center shadow-lg">
                                <ShoppingBagIcon className="h-6 w-6 text-[#e9e4db]" />
                            </div>
                        </div>
                        <div className="ml-3">
                            <h1 className="text-xl font-bold text-[#5d4035]">Grocery Admin</h1>
                            <p className="text-xs text-[#a14e3e]">Management System</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 px-2 space-y-1">
                    {navigation.map((item) => (
                        <NavigationItem
                            key={item.name}
                            item={item}
                            currentUrl={url}
                            isExpanded={expandedItems.includes(item.name)}
                            onToggleExpanded={toggleExpanded}
                        />
                    ))}
                </nav>
                <div className="flex-shrink-0 flex border-t border-[#c19a5b] p-4">
                    <div className="flex-shrink-0 w-full group block">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-[#a14e3e]">Grocery Store Admin</p>
                                <p className="text-xs text-[#c19a5b]">v1.0.0</p>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="h-2 w-2 bg-[#f9d282] rounded-full animate-pulse"></div>
                                <span className="text-xs text-[#a14e3e]">Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NavigationItem({ item, currentUrl, isExpanded, onToggleExpanded }: { item: NavigationItem; currentUrl: string; isExpanded: boolean; onToggleExpanded: (itemName: string) => void }): JSX.Element {
    const isActive = currentUrl.startsWith(item.href);
    const hasChildren = item.children && item.children.length > 0;
    // Badge autumn style + animasi bounce jika badge > 0
    const badgeColor = "bg-[#f9d282] text-[#a14e3e] ring-2 ring-[#a14e3e] animate-bounce";
    if (!hasChildren) {
        return (
            <Link
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out ${
                    isActive
                        ? 'bg-gradient-to-r from-[#a14e3e] to-[#c19a5b] text-[#e9e4db] shadow-md'
                        : 'text-[#5d4035] hover:bg-[#f9d282] hover:text-[#a14e3e]'
                }`}
            >
                <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                        isActive ? 'text-[#e9e4db]' : 'text-[#a14e3e] group-hover:text-[#7d835a]'
                    }`}
                />
                <span className="flex-1">{item.name}</span>
                {item.badge !== undefined && item.badge > 0 && (
                    <span
                        className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}
                        style={{
                            fontFamily: 'Inter, ui-sans-serif, system-ui',
                            letterSpacing: '0.02em'
                        }}
                    >
                        {item.badge}
                    </span>
                )}
            </Link>
        );
    }
    return (
        <div>
            <button
                onClick={() => onToggleExpanded(item.name)}
                className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out ${
                    isActive
                        ? 'bg-gradient-to-r from-[#a14e3e] to-[#c19a5b] text-[#e9e4db] shadow-md'
                        : 'text-[#5d4035] hover:bg-[#f9d282] hover:text-[#a14e3e]'
                }`}
            >
                <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                        isActive ? 'text-[#e9e4db]' : 'text-[#a14e3e] group-hover:text-[#7d835a]'
                    }`}
                />
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge !== undefined && item.badge > 0 && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mr-2 ${badgeColor}`}>
                        {item.badge}
                    </span>
                )}
                <svg
                    className={`h-4 w-4 transition-transform duration-200 ${
                        isExpanded ? 'transform rotate-90' : ''
                    } ${isActive ? 'text-[#e9e4db]' : 'text-[#a14e3e]'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
            {isExpanded && (
                <div className="mt-1 ml-8 space-y-1 animate-fade-in">
                    {item.children?.map((subItem) => {
                        const isSubActive = currentUrl.startsWith(subItem.href);
                        return (
                            <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`group flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-150 ease-in-out ${
                                    isSubActive
                                        ? 'bg-[#f9d282] text-[#a14e3e] border-r-2 border-[#a14e3e]'
                                        : 'text-[#5d4035] hover:bg-[#f9d282] hover:text-[#a14e3e]'
                                }`}
                            >
                                <span className={`mr-3 h-1.5 w-1.5 rounded-full ${
                                    isSubActive ? 'bg-[#a14e3e]' : 'bg-[#c19a5b]'
                                }`}></span>
                                {subItem.name}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function AdminTopNavigation({
    setSidebarOpen,
    user,
    userMenuOpen,
    setUserMenuOpen,
    onLogout
}: {
    setSidebarOpen: (open: boolean) => void;
    user?: PageProps['auth']['user'];
    userMenuOpen: boolean;
    setUserMenuOpen: (open: boolean) => void;
    onLogout: () => void;
}): JSX.Element {
    return (
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-[#e9e4db] border-b border-[#c19a5b]">
            <button
                onClick={() => setSidebarOpen(true)}
                className="px-4 border-r border-[#c19a5b] text-[#a14e3e] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#a14e3e] md:hidden"
                aria-label="Open sidebar"
            >
                <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex-1 px-4 flex justify-between items-center">
                <div className="flex-1 flex" />
                <div className="ml-4 flex items-center md:ml-6 space-x-4">
                    <button
                        type="button"
                        className="relative bg-[#e9e4db] p-1 rounded-full text-[#a14e3e] hover:text-[#c19a5b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a14e3e]"
                        aria-label="View notifications"
                    >
                        <BellIcon className="h-6 w-6" />
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#f9d282] ring-2 ring-[#a14e3e] animate-ping"></span>
                    </button>
                    <div className="ml-3 relative">
                        <div>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="max-w-xs bg-[#e9e4db] flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a14e3e]"
                                aria-expanded={userMenuOpen}
                                aria-haspopup="true"
                            >
                                <span className="sr-only">Open user menu</span>
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#a14e3e] to-[#c19a5b] flex items-center justify-center">
                                    <span className="text-sm font-medium text-[#e9e4db]">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <span className="ml-2 text-[#a14e3e] text-sm font-medium">
                                    {user?.name || 'User'}
                                </span>
                            </button>
                        </div>
                        {userMenuOpen && (
                            <UserDropdownMenu
                                user={user}
                                onLogout={onLogout}
                                onClose={() => setUserMenuOpen(false)}
                                isAdmin={true}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function UserDropdownMenu({ user, onLogout, onClose, isAdmin }: { user?: PageProps['auth']['user']; onLogout: () => void; onClose: () => void; isAdmin: boolean }): JSX.Element {
    return (
        <>
            <div className="fixed inset-0 z-10" onClick={onClose} />
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-[#f9d282] ring-1 ring-[#a14e3e] ring-opacity-60 focus:outline-none z-20 animate-fade-in">
                <div className="px-4 py-3 border-b border-[#a14e3e]">
                    <p className="text-sm font-medium text-[#a14e3e]">{user?.name || 'User'}</p>
                    <p className="text-sm text-[#7d835a]">{user?.email || 'user@example.com'}</p>
                </div>
                <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-[#a14e3e] hover:bg-[#e9e4db]"
                    onClick={onClose}
                >
                    <UserCircleIcon className="h-4 w-4 mr-3" />
                    Profile Settings
                </Link>
                {isAdmin && (
                    <Link
                        href="/admin/settings"
                        className="flex items-center px-4 py-2 text-sm text-[#a14e3e] hover:bg-[#e9e4db]"
                        onClick={onClose}
                    >
                        <CogIcon className="h-4 w-4 mr-3" />
                        Admin Settings
                    </Link>
                )}
                <div className="border-t border-[#a14e3e]">
                    <button
                        onClick={() => {
                            onClose();
                            onLogout();
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-[#a14e3e] hover:bg-[#e9e4db]"
                    >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                        Sign out
                    </button>
                </div>
            </div>
        </>
    );
}

function FlashMessages({ flash }: { flash?: PageProps['flash'] }): JSX.Element {
    if (!flash || (!flash.success && !flash.error)) {
        return <></>;
    }
    return (
        <div className="p-4">
            {flash.success && (
                <div className="mb-4 bg-[#f9d282] border border-[#a14e3e] text-[#a14e3e] px-4 py-3 rounded-lg relative animate-fade-in">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-[#a14e3e]" viewBox="0 0 20 20" fill="currentColor">
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
                <div className="mb-4 bg-[#a14e3e] border border-[#c19a5b] text-[#e9e4db] px-4 py-3 rounded-lg relative animate-fade-in">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-[#e9e4db]" viewBox="0 0 20 20" fill="currentColor">
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

/* Tambahkan animasi tailwind di tailwind.config.js:

*/

