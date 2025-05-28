// resources/js/Components/Sidebar.tsx
import React, { useState } from 'react';
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

// Perbaiki: Hapus children dari SidebarProps
interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    className?: string;
}

// Navigation items untuk admin
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

export default function Sidebar({ isOpen = true, onClose, className = '' }: SidebarProps): JSX.Element {
    const pageProps = usePage<PageProps>().props;
    const { auth } = pageProps;
    const { url } = usePage();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    // Check if user is admin dengan null safety
    const isAdmin = auth?.user?.roles?.some(role => role.name === 'admin') || false;

    const toggleExpanded = (itemName: string): void => {
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

    return (
        <div className={`flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white ${className}`}>
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

                    {/* Close button untuk mobile */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="ml-auto md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
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

// Navigation Item Component (sama seperti sebelumnya)
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

// Mobile Sidebar Component - PERBAIKAN UTAMA
interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps): JSX.Element {
    if (!isOpen) return <></>;

    return (
        <div className="fixed inset-0 flex z-40 md:hidden">
            <div
                className="fixed inset-0 bg-gray-600 bg-opacity-75"
                onClick={onClose}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                        onClick={onClose}
                        className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        aria-label="Close sidebar"
                    >
                        <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                </div>
                {/* PERBAIKAN: Hapus children prop yang tidak diperlukan */}
                <Sidebar onClose={onClose} />
            </div>
        </div>
    );
}
