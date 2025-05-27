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

// Navigation items untuk admin dengan perbaikan
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
            { name: 'Kategori', href: '/admin/products/categories' },
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
        ]
    },
    {
        name: 'Laporan',
        href: '/admin/reports',
        icon: ChartBarIcon,
        children: [
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

    // Check if user is admin dengan null safety
    const isAdmin = auth?.user?.roles?.some(role => role.name === 'admin') || false;

    // Auto-collapse on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768 && onToggleCollapse && !isCollapsed) {
                onToggleCollapse();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isCollapsed, onToggleCollapse]);

    const toggleExpanded = (itemName: string): void => {
        if (isCollapsed) return; // Don't expand in collapsed mode

        setExpandedItems(prev =>
            prev.includes(itemName)
                ? prev.filter(name => name !== itemName)
                : [...prev, itemName]
        );
    };

    // Jika bukan admin, return empty component
    if (!isAdmin) {
        return <></>;
    }

    const sidebarClasses = `
        flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${className}
    `;

    return (
        <div className={sidebarClasses}>
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                {/* Logo */}
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
                    {adminNavigation.map((item) => (
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

// Navigation Item Component dengan perbaikan
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
                            {item.badge && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    isActive
                                        ? 'bg-white bg-opacity-20 text-white'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {item.badge}
                                </span>
                            )}
                        </>
                    )}
                </Link>

                {/* Tooltip for collapsed state */}
                {isCollapsed && isHovered && (
                    <div className="absolute left-full ml-2 top-0 z-50 px-2 py-1 bg-gray-900 text-white text-sm rounded-md shadow-lg whitespace-nowrap">
                        {item.name}
                        {item.badge && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
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
                        {item.badge && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${
                                isActive
                                    ? 'bg-white bg-opacity-20 text-white'
                                    : 'bg-red-100 text-red-800'
                            }`}>
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
                <div className="absolute left-full ml-2 top-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg min-w-48">
                    <div className="p-2">
                        <div className="font-medium text-gray-900 mb-2 flex items-center">
                            {item.name}
                            {item.badge && (
                                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
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

// Mobile Sidebar Component dengan perbaikan
interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps): JSX.Element {
    if (!isOpen) return <></>;

    return (
        <div className="fixed inset-0 flex z-40 md:hidden">
            <div
                className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300"
                onClick={onClose}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform duration-300 ease-in-out">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                        onClick={onClose}
                        className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-150"
                        aria-label="Close sidebar"
                    >
                        <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                </div>
                <Sidebar onClose={onClose} />
            </div>
        </div>
    );
}

// Sidebar Trigger Component dengan perbaikan
interface SidebarTriggerProps {
    onClick: () => void;
    className?: string;
}

export function SidebarTrigger({ onClick, className = '' }: SidebarTriggerProps): JSX.Element {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out ${className}`}
            aria-label="Toggle sidebar"
        >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    );
}
