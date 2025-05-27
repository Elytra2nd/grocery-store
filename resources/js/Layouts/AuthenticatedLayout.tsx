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
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';

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

// Navigation items untuk admin - DIPERBARUI DENGAN MENU LAPORAN LENGKAP
const adminNavigation: NavigationItem[] = [
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
        badge: 5,
        children: [
            { name: 'Semua Pesanan', href: '/admin/orders' },
            { name: 'Pesanan Baru', href: '/admin/orders/pending' },
            { name: 'Sedang Diproses', href: '/admin/orders/processing' },
            { name: 'Dikirim', href: '/admin/orders/shipped' },
            { name: 'Selesai', href: '/admin/orders/completed' },
        ]
    },
    {
        name: 'Pelanggan',
        href: '/admin/users',
        icon: UsersIcon,
        children: [
            { name: 'Semua Pelanggan', href: '/admin/users' },
            { name: 'Pelanggan Aktif', href: '/admin/users/active' },
            { name: 'Pelanggan Baru', href: '/admin/users/new' },
            { name: 'Tambah Pelanggan', href: '/admin/users/create' },
        ]
    },
    // MENU LAPORAN YANG DIPERBARUI DAN LENGKAP
    {
        name: 'Laporan',
        href: '/admin/reports',
        icon: ChartBarIcon,
        children: [
            { name: 'Dashboard Laporan', href: '/admin/reports' },
            { name: 'Laporan Penjualan', href: '/admin/reports/sales' },
            { name: 'Laporan Produk', href: '/admin/reports/products' },
            { name: 'Laporan Pelanggan', href: '/admin/reports/customers' },
            { name: 'Laporan Keuangan', href: '/admin/reports/financial' },
            { name: 'Laporan Inventori', href: '/admin/reports/inventory' },
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

const userNavigation: NavigationItem[] = [
];

export default function AuthenticatedLayout({ children, header }: AuthenticatedLayoutProps): JSX.Element {
    const pageProps = usePage<PageProps>().props;
    const { auth, flash } = pageProps;
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

    // Check if user is admin dengan null safety
    const isAdmin = auth?.user?.roles?.some(role => role.name === 'admin') || false;

    const navigation = isAdmin ? adminNavigation : userNavigation;

    const handleLogout = (): void => {
        router.post('/logout');
    };

    // Admin layout
    if (isAdmin) {
        return (
            <div className="h-screen flex overflow-hidden bg-gray-100">
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
                        user={auth?.user}
                        userMenuOpen={userMenuOpen}
                        setUserMenuOpen={setUserMenuOpen}
                        onLogout={handleLogout}
                    />

                    {/* Main content area */}
                    <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                        <FlashMessages flash={flash} />
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    // User layout (original Breeze layout)
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/">
                                    <div className="h-8 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                        <ShoppingBagIcon className="h-5 w-5 text-white" />
                                    </div>
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                {userNavigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            <div className="ml-3 relative">
                                <div>
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-sm font-medium text-white">
                                                {auth?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <span className="ml-2 text-gray-700 text-sm font-medium">
                                            {auth?.user?.name || 'User'}
                                        </span>
                                    </button>
                                </div>

                                {userMenuOpen && (
                                    <UserDropdownMenu
                                        user={auth?.user}
                                        onLogout={handleLogout}
                                        onClose={() => setUserMenuOpen(false)}
                                        isAdmin={false}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                            >
                                <Bars3Icon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
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

// Admin Components
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
                className="fixed inset-0 bg-gray-600 bg-opacity-75"
                onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        aria-label="Close sidebar"
                    >
                        <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                </div>
                <AdminSidebar navigation={navigation} />
            </div>
        </div>
    );
}

interface AdminSidebarProps {
    navigation: NavigationItem[];
}

function AdminSidebar({ navigation }: AdminSidebarProps): JSX.Element {
    const { url } = usePage();
    const [expandedItems, setExpandedItems] = useState<string[]>(['Laporan']); // DEFAULT EXPAND LAPORAN

    const toggleExpanded = (itemName: string): void => {
        setExpandedItems(prev =>
            prev.includes(itemName)
                ? prev.filter(name => name !== itemName)
                : [...prev, itemName]
        );
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                {/* Logo */}
                <div className="flex items-center flex-shrink-0 px-4 mb-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <ShoppingBagIcon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <div className="ml-3">
                            <h1 className="text-xl font-bold text-gray-900">Grocery Admin</h1>
                            <p className="text-xs text-gray-500">Management System</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 bg-white space-y-1">
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

                {/* Footer */}
                <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                    <div className="flex-shrink-0 w-full group block">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500">
                                    Grocery Store Admin
                                </p>
                                <p className="text-xs text-gray-400">v1.0.0</p>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                                <span className="text-xs text-gray-500">Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface NavigationItemProps {
    item: NavigationItem;
    currentUrl: string;
    isExpanded: boolean;
    onToggleExpanded: (itemName: string) => void;
}

function NavigationItem({ item, currentUrl, isExpanded, onToggleExpanded }: NavigationItemProps): JSX.Element {
    const isActive = currentUrl.startsWith(item.href);
    const hasChildren = item.children && item.children.length > 0;

    if (!hasChildren) {
        return (
            <Link
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out ${
                    isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
                <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        isActive
                            ? 'bg-white bg-opacity-20 text-white'
                            : 'bg-red-100 text-red-800'
                    }`}>
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
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
                <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                />
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${
                        isActive
                            ? 'bg-white bg-opacity-20 text-white'
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {item.badge}
                    </span>
                )}
                <svg
                    className={`h-4 w-4 transition-transform duration-200 ${
                        isExpanded ? 'transform rotate-90' : ''
                    } ${isActive ? 'text-white' : 'text-gray-400'}`}
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
                <div className="mt-1 ml-8 space-y-1">
                    {item.children?.map((subItem) => {
                        const isSubActive = currentUrl.startsWith(subItem.href);
                        return (
                            <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`group flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-150 ease-in-out ${
                                    isSubActive
                                        ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <span className={`mr-3 h-1.5 w-1.5 rounded-full ${
                                    isSubActive ? 'bg-indigo-500' : 'bg-gray-300'
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

interface AdminTopNavigationProps {
    setSidebarOpen: (open: boolean) => void;
    user?: PageProps['auth']['user'];
    userMenuOpen: boolean;
    setUserMenuOpen: (open: boolean) => void;
    onLogout: () => void;
}

function AdminTopNavigation({
    setSidebarOpen,
    user,
    userMenuOpen,
    setUserMenuOpen,
    onLogout
}: AdminTopNavigationProps): JSX.Element {
    return (
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
            <button
                onClick={() => setSidebarOpen(true)}
                className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
                aria-label="Open sidebar"
            >
                <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="flex-1 px-4 flex justify-between items-center">
                <div className="flex-1 flex">
                    <div className="w-full flex md:ml-0">
                        {/* Search bar dapat ditambahkan di sini */}
                    </div>
                </div>

                <div className="ml-4 flex items-center md:ml-6 space-x-4">
                    <button
                        type="button"
                        className="relative bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        aria-label="View notifications"
                    >
                        <BellIcon className="h-6 w-6" />
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                    </button>

                    <div className="ml-3 relative">
                        <div>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                aria-expanded={userMenuOpen}
                                aria-haspopup="true"
                            >
                                <span className="sr-only">Open user menu</span>
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <span className="ml-2 text-gray-700 text-sm font-medium">
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

interface UserDropdownMenuProps {
    user?: PageProps['auth']['user'];
    onLogout: () => void;
    onClose: () => void;
    isAdmin: boolean;
}

function UserDropdownMenu({ user, onLogout, onClose, isAdmin }: UserDropdownMenuProps): JSX.Element {
    return (
        <>
            <div
                className="fixed inset-0 z-10"
                onClick={onClose}
            />

            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>

                <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={onClose}
                >
                    <UserCircleIcon className="h-4 w-4 mr-3" />
                    Profile Settings
                </Link>

                {isAdmin && (
                    <Link
                        href="/admin/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={onClose}
                    >
                        <CogIcon className="h-4 w-4 mr-3" />
                        Admin Settings
                    </Link>
                )}

                <div className="border-t border-gray-200">
                    <button
                        onClick={() => {
                            onClose();
                            onLogout();
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                        Sign out
                    </button>
                </div>
            </div>
        </>
    );
}

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
                <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg relative">
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
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg relative">
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
