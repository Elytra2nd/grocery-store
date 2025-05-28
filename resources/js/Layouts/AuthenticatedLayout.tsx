import React, { useState, ReactNode } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Bars3Icon,
    XMarkIcon,
    ChevronRightIcon,
    HomeIcon,
    CubeIcon,
    ShoppingCartIcon,
    UsersIcon,
    ChartBarIcon,
    CogIcon,
    ShoppingBagIcon,
    BellIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

// --- Breadcrumb Component ---
function Breadcrumb() {
    const labelMap: Record<string, string> = {
        admin: 'Dashboard',
        products: 'Produk',
        orders: 'Pesanan',
        users: 'Pelanggan',
        reports: 'Laporan',
        settings: 'Pengaturan',
        create: 'Tambah',
        edit: 'Edit',
        active: 'Aktif',
        pending: 'Baru',
        completed: 'Selesai',
        categories: 'Kategori',
        sales: 'Penjualan',
        customers: 'Pelanggan',
        financial: 'Keuangan',
        inventory: 'Inventori',
    };
    let pathname = '/';
    if (typeof window !== 'undefined') {
        pathname = window.location.pathname;
    } else {
        const page = usePage();
        pathname = (page as any)?.url || '/';
    }
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = segments.map((seg, idx) => {
        const url = '/' + segments.slice(0, idx + 1).join('/');
        const label = labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
        return { url, label };
    });
    return (
        <nav className="flex items-center text-sm text-amber-700 mb-4 animate-fade-in" aria-label="Breadcrumb">
            <Link href="/admin/dashboard" className="flex items-center hover:underline font-semibold transition-colors duration-200">
                <HomeIcon className="h-4 w-4 mr-1 text-amber-700" />
                Dashboard
            </Link>
            {breadcrumbs.map((item, idx) => (
                <span key={item.url} className="flex items-center">
                    <ChevronRightIcon className="h-4 w-4 mx-1 text-amber-500" />
                    {idx === breadcrumbs.length - 1 ? (
                        <span className="font-semibold text-amber-900">{item.label}</span>
                    ) : (
                        <Link href={item.url} className="hover:underline text-amber-700 transition-colors duration-200">{item.label}</Link>
                    )}
                </span>
            ))}
        </nav>
    );
}

// --- Sidebar Navigation Data ---
const adminNavigation = (pesananBadge: number) => [
    {
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: HomeIcon,
    },
    {
        name: 'Produk',
        href: '/admin/products',
        icon: CubeIcon,
        children: [
            { name: 'Semua Produk', href: '/admin/products' },
            { name: 'Tambah Produk', href: '/admin/products/create' },
            { name: 'Stok Rendah', href: '/admin/products/low-stock' },
        ]
    },
    {
        name: 'Kategori',
        href: '/admin/categories',
        icon: CubeIcon,
        children: [
            { name: 'Semua Kategori', href: '/admin/categories' },
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
            { name: 'pelanggan aktif', href: '/admin/users/active' },
        ]
    },
    {
        name: 'Laporan',
        href: '/admin/reports',
        icon: ChartBarIcon,
        children: [
            {name: 'Semua Laporan', href: '/admin/reports' },
            { name: 'Penjualan', href: '/admin/reports/sales' },
            { name: 'pelanggan', href: '/admin/reports/customers' },
            { name: 'produk', href: '/admin/reports/products' },
            { name: 'Keuangan', href: '/admin/reports/financial' },
        ]
    },
    {
        name: 'Pengaturan',
        href: '/admin/settings',
        icon: CogIcon,
    }
];

// --- Desktop Sidebar ---
type SidebarProps = {
    collapsed: boolean;
    onToggle: () => void;
    navigation: any[];
    onAnyNavigate?: () => void;
};

function Sidebar({ collapsed, onToggle, navigation, onAnyNavigate }: SidebarProps) {
    const { url } = usePage();
    const [expanded, setExpanded] = useState<string | null>(null);

    const handleMainClick = (item: any) => {
        if (item.children) {
            setExpanded(expanded === item.name ? null : item.name);
        } else {
            setExpanded(null);
            if (onAnyNavigate) onAnyNavigate();
        }
    };

    const handleChevronClick = (e: React.MouseEvent<HTMLButtonElement>, item: any) => {
        e.preventDefault();
        setExpanded(expanded === item.name ? null : item.name);
    };

    return (
        <div className={`transition-all duration-300 bg-[#fffbea] border-r border-amber-200 shadow-sm
            ${collapsed ? 'w-16' : 'w-64'} flex flex-col min-h-0`}>
            <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center">
                    <div className="h-8 w-8 bg-gradient-to-r from-amber-700 to-amber-400 rounded-lg flex items-center justify-center">
                        <ShoppingBagIcon className="h-5 w-5 text-white" />
                    </div>
                    {!collapsed && <span className="ml-3 font-bold text-amber-800 text-lg">Grocery Admin</span>}
                </div>
                <button
                    onClick={onToggle}
                    className="ml-2 p-2 rounded-full hover:bg-amber-100 transition"
                    aria-label="Toggle sidebar"
                >
                    {collapsed ? <Bars3Icon className="h-6 w-6 text-amber-700" /> : <XMarkIcon className="h-6 w-6 text-amber-700" />}
                </button>
            </div>
            <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                    const isActive = url.startsWith(item.href);
                    const hasChildren = !!item.children;
                    return (
                        <div key={item.name}>
                            <Link
                                href={item.href}
                                className={`group flex items-center px-3 py-2 rounded-md text-base font-medium transition-all ${
                                    isActive
                                        ? 'bg-amber-100 text-amber-900'
                                        : 'text-amber-700 hover:bg-amber-50 hover:text-amber-900'
                                } ${collapsed ? 'justify-center' : ''}`}
                                onClick={e => {
                                    handleMainClick(item);
                                    if (hasChildren) e.preventDefault();
                                }}
                            >
                                <item.icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
                                {!collapsed && <span className="flex-1">{item.name}</span>}
                                {item.badge !== undefined && item.badge > 0 && !collapsed && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-600 text-white animate-bounce">
                                        {item.badge}
                                    </span>
                                )}
                                {hasChildren && !collapsed && (
                                    <button
                                        tabIndex={-1}
                                        type="button"
                                        onClick={e => handleChevronClick(e, item)}
                                        className="ml-2 p-1 rounded hover:bg-amber-200 transition"
                                    >
                                        <ChevronRightIcon className={`h-4 w-4 transition-transform ${expanded === item.name ? 'rotate-90' : ''}`} />
                                    </button>
                                )}
                            </Link>
                            {item.children && expanded === item.name && !collapsed && (
                                <div className="ml-8 mt-1 space-y-1 transition-all duration-300 ease-in-out overflow-hidden animate-fadeIn">
                                    {item.children.map((sub: { name: string; href: string }) => (
                                        <Link
                                            key={sub.name}
                                            href={sub.href}
                                            className={`block px-2 py-1 rounded text-sm ${
                                                url.startsWith(sub.href)
                                                    ? 'bg-amber-200 text-amber-900'
                                                    : 'text-amber-700 hover:bg-amber-50'
                                            }`}
                                            onClick={onAnyNavigate}
                                        >
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}

// --- Mobile Sidebar ---
type MobileSidebarProps = {
    open: boolean;
    onClose: () => void;
    navigation: any[];
};

function MobileSidebar({ open, onClose, navigation }: MobileSidebarProps) {
    const handleAnyNavigate = () => {
        onClose();
    };
    return (
        <div className="fixed inset-0 z-40 md:hidden">
            <div
                className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div
                className={`
                    fixed left-0 top-0 bottom-0 w-64 bg-[#fffbea] shadow-xl
                    transform transition-transform duration-300 ease-in-out
                    ${open ? 'translate-x-0' : '-translate-x-full'}
                `}
                style={{ zIndex: 50 }}
            >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                        onClick={onClose}
                        className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-700"
                        aria-label="Close sidebar"
                    >
                        <XMarkIcon className="h-6 w-6 text-amber-700" />
                    </button>
                </div>
                <Sidebar collapsed={false} onToggle={() => {}} navigation={navigation} onAnyNavigate={handleAnyNavigate} />
            </div>
        </div>
    );
}

// --- User Dropdown & Flash Messages ---
type UserType = {
    name?: string;
    email?: string;
    [key: string]: any;
};

function UserDropdownMenu({
    user,
    onLogout,
    onClose,
    isAdmin,
}: {
    user?: UserType;
    onLogout: () => void;
    onClose: () => void;
    isAdmin: boolean;
}) {
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

function FlashMessages({ flash }: { flash?: { success?: string; error?: string } }) {
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

// --- Layout Main ---
type AuthenticatedUser = {
    name?: string;
    email?: string;
    roles?: string[]; // FIXED: Changed from { name: string }[] to string[]
    [key: string]: any;
};

type PageProps = {
    auth?: {
        user?: AuthenticatedUser;
    };
    order_count?: number;
    flash?: { success?: string; error?: string };
    [key: string]: any;
};

export default function AuthenticatedLayout({ children, header }: { children: ReactNode; header?: ReactNode }) {
    const pageProps = usePage<PageProps>().props;
    const pesananBadge = pageProps?.order_count ?? 0;
    const navigation = adminNavigation(pesananBadge);

    // FIXED: Updated admin check to handle string array
    const isAdmin = pageProps.auth?.user?.roles?.includes('admin') || false;

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = (): void => {
        router.post('/logout');
    };

    if (isAdmin) {
        return (
            <div className="min-h-screen flex bg-[#fffbea]">
                {/* Mobile sidebar */}
                <MobileSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} navigation={navigation} />

                {/* Desktop sidebar */}
                <div className={`hidden md:flex transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
                    <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} navigation={navigation} />
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col">
                    {/* Topbar */}
                    <div className="flex items-center h-16 px-4 shadow-sm bg-[#fffbea] border-b border-amber-200">
                        <button
                            className="md:hidden p-2 rounded-full hover:bg-amber-100 transition"
                            onClick={() => setMobileSidebarOpen(true)}
                            aria-label="Open sidebar"
                        >
                            <Bars3Icon className="h-6 w-6 text-amber-700" />
                        </button>
                        <button
                            className="hidden md:inline-flex p-2 rounded-full hover:bg-amber-100 transition"
                            onClick={() => setSidebarCollapsed(v => !v)}
                            aria-label="Toggle sidebar"
                        >
                            {sidebarCollapsed ? <Bars3Icon className="h-6 w-6 text-amber-700" /> : <XMarkIcon className="h-6 w-6 text-amber-700" />}
                        </button>
                        {header && <div className="ml-4 flex-1">{header}</div>}

                        {/* User Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="ml-2 flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a14e3e]"
                            >
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#a14e3e] to-[#c19a5b] flex items-center justify-center">
                                    <span className="text-sm font-medium text-[#e9e4db]">
                                        {pageProps.auth?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <span className="ml-2 text-[#a14e3e] text-sm font-medium">
                                    {pageProps.auth?.user?.name || 'User'}
                                </span>
                            </button>
                            {userMenuOpen && (
                                <UserDropdownMenu
                                    user={pageProps.auth?.user}
                                    onLogout={handleLogout}
                                    onClose={() => setUserMenuOpen(false)}
                                    isAdmin={isAdmin}
                                />
                            )}
                        </div>
                    </div>

                    {/* Breadcrumb */}
                    <div className="px-6 pt-4">
                        <Breadcrumb />
                    </div>

                    <main className="flex-1 p-6">
                        <FlashMessages flash={pageProps.flash as { success?: string; error?: string }} />
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
                <FlashMessages flash={pageProps.flash as { success?: string; error?: string }} />
                {children}
            </main>
        </div>
    );
}
