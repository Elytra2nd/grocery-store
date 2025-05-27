// resources/js/Components/Breadcrumb.tsx
import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

// Mapping path segment ke label yang lebih ramah
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
    // Tambahkan sesuai kebutuhan
};

function getBreadcrumbs(pathname: string) {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = segments.map((seg, idx) => {
        const url = '/' + segments.slice(0, idx + 1).join('/');
        const label = labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
        return { url, label };
    });
    return breadcrumbs;
}

export default function Breadcrumb() {
    // Ambil path dari window.location.pathname (SSR safe)
    let pathname = '/';
    if (typeof window !== 'undefined') {
        pathname = window.location.pathname;
    } else {
        // fallback Inertia page.url (untuk SSR)
        const page = usePage();
        pathname = (page as any)?.url || '/';
    }

    const breadcrumbs = getBreadcrumbs(pathname);

    return (
        <nav className="flex items-center text-sm text-amber-700 mb-4" aria-label="Breadcrumb">
            <Link href="/admin/dashboard" className="flex items-center hover:underline">
                <HomeIcon className="h-4 w-4 mr-1 text-amber-700" />
                Dashboard
            </Link>
            {breadcrumbs.map((item, idx) => (
                <span key={item.url} className="flex items-center">
                    <ChevronRightIcon className="h-4 w-4 mx-1 text-amber-500" />
                    {idx === breadcrumbs.length - 1 ? (
                        <span className="font-semibold">{item.label}</span>
                    ) : (
                        <Link href={item.url} className="hover:underline">{item.label}</Link>
                    )}
                </span>
            ))}
        </nav>
    );
}
