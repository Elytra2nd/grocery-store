// resources/js/Components/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    HomeIcon,
    CubeIcon,
    ShoppingCartIcon,
    UsersIcon,
    ChartBarIcon,
    CogIcon,
    ShoppingBagIcon,
    XMarkIcon,
    ChevronRightIcon,
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
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    className?: string;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

// --- NAVIGATION DATA ---
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
            { name: 'Kategori', href: '/categories' },
            { name: 'Stok Rendah', href: '/admin/products/low-stock' },
        ]
    },
    {
        name: 'Pesanan',
        href: '/admin/orders',
        icon: ShoppingCartIcon,
        // badge will be set dynamically in the Sidebar component
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
        ]
    },
    {
        name: 'Laporan',
        href: '/admin/reports',
        icon: ChartBarIcon,
        children: [
            { name: 'Laporan Umum', href: '/admin/reports/index' },
            { name: 'Laporan Penjualan', href: '/admin/reports/sales' },
            { name: 'Laporan Produk', href: '/admin/reports/products' },
            { name: 'Laporan Pelanggan', href: '/admin/reports/customers' },
            { name: 'Laporan Keuangan', href: '/admin/reports/financial' },
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

// --- SIDEBAR UTAMA (DESKTOP) ---
export default function Sidebar({
    isOpen = true,
    onClose,
    className = '',
    isCollapsed = false,
    onToggleCollapse
}: SidebarProps): JSX.Element {
    const pageProps = usePage<PageProps>().props;
    const { auth } = pageProps;
    const { url } = usePage();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    // Check if user is admin
    const isAdmin = auth?.user?.roles?.some(role => role.name === 'admin') || false;

    // Toggle submenu
    const toggleExpanded = (itemName: string): void => {
        if (isCollapsed) return;
        setExpandedItems(prev =>
            prev.includes(itemName)
                ? prev.filter(name => name !== itemName)
                : [...prev, itemName]
        );
    };

    // Jika bukan admin, return empty
    if (!isAdmin) return <></>;

    // Sidebar classes untuk animasi collapse/expand
    const sidebarClasses = `
        flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${className}
    `;

    // Clone adminNavigation and inject badge dynamically for "Pesanan"
    const navigationWithBadge = adminNavigation.map(item =>
        item.name === 'Pesanan'
            ? { ...item, badge: typeof pageProps.order_count === 'number' ? pageProps.order_count : 0 }
            : item
    );

    return (
        <div className={sidebarClasses}>
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                {/* Logo & Collapse */}
                <div className="flex items-center flex-shrink-0 px-4 mb-5">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <button
                                onClick={onToggleCollapse}
                                className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200"
                            >
                                <ShoppingBagIcon className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        {!isCollapsed && (
                            <div className="ml-3 transition-opacity duration-200">
                                <h1 className="text-xl font-bold text-gray-900">Grocery Admin</h1>
                                <p className="text-xs text-gray-500">Management System</p>
                            </div>
                        )}
                    </div>
                    {/* Close button untuk mobile */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="ml-auto md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-150"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    )}
                </div>
                {/* Navigation */}
                <nav className="flex-1 px-2 bg-white space-y-1">
                    {navigationWithBadge.map((item) => (
                        <NavigationItem
                            key={item.name}
                            item={item}
                            currentUrl={url}
                            isExpanded={expandedItems.includes(item.name)}
                            onToggleExpanded={toggleExpanded}
                            isCollapsed={isCollapsed}
                            hoveredItem={hoveredItem}
                            setHoveredItem={setHoveredItem}
                        />
                    ))}
                </nav>
                {/* Footer */}
                {!isCollapsed && (
                    <div className="flex-shrink-0 flex border-t border-gray-200 p-4 transition-opacity duration-200">
                        <div className="flex-shrink-0 w-full group block">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">
                                        Grocery Store Admin
                                    </p>
                                    <p className="text-xs text-gray-400">v1.0.0</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-gray-500">Online</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- NAVIGATION ITEM (with submenu, badge, tooltip, animasi) ---
interface NavigationItemProps {
    item: NavigationItem;
    currentUrl: string;
    isExpanded: boolean;
    onToggleExpanded: (itemName: string) => void;
    isCollapsed: boolean;
    hoveredItem: string | null;
    setHoveredItem: (item: string | null) => void;
}

function NavigationItem({
    item,
    currentUrl,
    isExpanded,
    onToggleExpanded,
    isCollapsed,
    hoveredItem,
    setHoveredItem
}: NavigationItemProps): JSX.Element {
    const isActive = currentUrl.startsWith(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isHovered = hoveredItem === item.name;

    if (!hasChildren) {
        return (
            <div className="relative">
                <Link
                    href={item.href}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out ${
                        isActive
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <item.icon
                        className={`flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                        } ${isCollapsed ? '' : 'mr-3'}`}
                    />
                    {!isCollapsed && (
                        <>
                            <span className="flex-1">{item.name}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-600 text-white ml-2 animate-bounce`}>
                                    {item.badge}
                                </span>
                            )}
                        </>
                    )}
                </Link>
                {/* Tooltip for collapsed state */}
                {isCollapsed && isHovered && (
                    <div className="absolute left-full ml-2 top-0 z-50 px-2 py-1 bg-gray-900 text-white text-sm rounded-md shadow-lg whitespace-nowrap animate-fadeIn">
                        {item.name}
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-600 text-white">
                                {item.badge}
                            </span>
                        )}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => onToggleExpanded(item.name)}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out ${
                    isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                } ${isCollapsed ? 'justify-center' : ''}`}
            >
                <item.icon
                    className={`flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                    } ${isCollapsed ? '' : 'mr-3'}`}
                />
                {!isCollapsed && (
                    <>
                        <span className="flex-1 text-left">{item.name}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-2 bg-amber-600 text-white animate-bounce`}>
                                {item.badge}
                            </span>
                        )}
                        <ChevronRightIcon
                            className={`h-4 w-4 transition-transform duration-200 ${
                                isExpanded ? 'transform rotate-90' : ''
                            } ${isActive ? 'text-white' : 'text-gray-400'}`}
                        />
                    </>
                )}
            </button>
            {/* Submenu */}
            {!isCollapsed && isExpanded && (
                <div className="mt-1 ml-8 space-y-1 animate-fadeIn">
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
                                <span className={`mr-3 h-1.5 w-1.5 rounded-full transition-colors duration-150 ${
                                    isSubActive ? 'bg-indigo-500' : 'bg-gray-300 group-hover:bg-gray-400'
                                }`}></span>
                                {subItem.name}
                            </Link>
                        );
                    })}
                </div>
            )}
            {/* Tooltip for collapsed state with children */}
            {isCollapsed && isHovered && (
                <div className="absolute left-full ml-2 top-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg min-w-48 animate-fadeIn">
                    <div className="p-2">
                        <div className="font-medium text-gray-900 mb-2 flex items-center">
                            {item.name}
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-600 text-white">
                                    {item.badge}
                                </span>
                            )}
                        </div>
                        <div className="space-y-1">
                            {item.children?.map((subItem) => {
                                const isSubActive = currentUrl.startsWith(subItem.href);
                                return (
                                    <Link
                                        key={subItem.name}
                                        href={subItem.href}
                                        className={`block px-2 py-1 text-sm rounded transition-colors duration-150 ${
                                            isSubActive
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {subItem.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="absolute left-0 top-4 transform -translate-x-1 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
                </div>
            )}
        </div>
    );
}

// --- MOBILE SIDEBAR DENGAN SLIDE IN/OUT ANIMASI ---
interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps): JSX.Element {
    // Sidebar selalu ada, tapi posisinya di luar layar jika tidak open
    return (
        <div className="fixed inset-0 z-40 md:hidden">
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            {/* Sidebar */}
            <div
                className={`
                    fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
                style={{ zIndex: 50 }}
            >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                        onClick={onClose}
                        className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        aria-label="Close sidebar"
                    >
                        <XMarkIcon className="h-6 w-6 text-gray-600" />
                    </button>
                </div>
                <Sidebar onClose={onClose} />
            </div>
        </div>
    );
}
