import React, { useState, FormEvent } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Product, PageProps, PaginatedData, DashboardStatistics, ProductFilters } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Props extends PageProps {
    products: PaginatedData<Product>;
    categories: Record<number, string>; // {id: name}
    statistics: DashboardStatistics;
    filters: ProductFilters;
}

// DITAMBAHKAN: Enhanced Delete Modal Component dengan Animasi
interface DeleteModalProps {
    show: boolean;
    product: Product | null;
    isLoading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function DeleteModal({ show, product, isLoading, onConfirm, onCancel }: DeleteModalProps): JSX.Element {
    const [isModalAnimating, setIsModalAnimating] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    React.useEffect(() => {
        if (show) {
            setIsModalAnimating(true);
            setIsClosing(false);
        } else {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setIsModalAnimating(false);
                setIsClosing(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [show]);

    const handleCancel = () => {
        if (!isLoading) {
            setIsClosing(true);
            setTimeout(() => {
                onCancel();
            }, 300);
        }
    };

    if (!show && !isClosing) return <></>;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${
                isModalAnimating && !isClosing
                    ? 'opacity-100 backdrop-blur-sm'
                    : 'opacity-0'
            }`}
            style={{
                background: isModalAnimating && !isClosing
                    ? 'rgba(0, 0, 0, 0.5)'
                    : 'rgba(0, 0, 0, 0)'
            }}
        >
            {/* Background overlay dengan animasi */}
            <div
                className={`fixed inset-0 transition-opacity duration-300 ease-in-out ${
                    isModalAnimating && !isClosing ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={handleCancel}
            />

            {/* Modal panel dengan ukuran yang lebih kecil dan centered */}
            <div
                className={`relative bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-out w-full max-w-md mx-auto ${
                    isModalAnimating && !isClosing
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-8 scale-95'
                }`}
                style={{
                    boxShadow: isModalAnimating && !isClosing
                        ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        : 'none'
                }}
            >
                {/* Header dengan padding yang disesuaikan */}
                <div className="p-6">
                    <div className="flex items-center">
                        <div
                            className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full transition-all duration-500 delay-100 ${
                                isModalAnimating && !isClosing
                                    ? 'bg-red-100 scale-100'
                                    : 'bg-red-50 scale-75'
                            }`}
                        >
                            <TrashIcon
                                className={`transition-all duration-500 delay-200 ${
                                    isModalAnimating && !isClosing
                                        ? 'h-6 w-6 text-red-600 scale-100'
                                        : 'h-5 w-5 text-red-400 scale-75'
                                }`}
                            />
                        </div>
                        <div className="ml-4 flex-1">
                            <h3
                                className={`text-lg font-bold leading-6 transition-all duration-500 delay-150 ${
                                    isModalAnimating && !isClosing
                                        ? 'text-gray-900 translate-y-0 opacity-100'
                                        : 'text-gray-700 translate-y-2 opacity-0'
                                }`}
                            >
                                Konfirmasi Hapus
                            </h3>
                        </div>
                    </div>

                    <div
                        className={`mt-4 transition-all duration-500 delay-200 ${
                            isModalAnimating && !isClosing
                                ? 'translate-y-0 opacity-100'
                                : 'translate-y-4 opacity-0'
                        }`}
                    >
                        <p className="text-sm text-gray-500 mb-3">
                            Apakah Anda yakin ingin menghapus produk:
                        </p>
                        <div
                            className={`p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-l-4 border-amber-400 transition-all duration-500 delay-300 ${
                                isModalAnimating && !isClosing
                                    ? 'scale-100 opacity-100'
                                    : 'scale-95 opacity-0'
                            }`}
                        >
                            <p className="text-sm font-semibold text-gray-900 flex items-center">
                                <span className="text-lg mr-2">📦</span>
                                "{product?.name}"
                            </p>
                        </div>
                        <div
                            className={`mt-3 p-2 bg-red-50 rounded-lg border border-red-200 transition-all duration-500 delay-400 ${
                                isModalAnimating && !isClosing
                                    ? 'scale-100 opacity-100'
                                    : 'scale-95 opacity-0'
                            }`}
                        >
                            <p className="text-xs text-red-600 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Tindakan ini tidak dapat dibatalkan!
                            </p>
                        </div>
                    </div>

                    {/* Action buttons dengan ukuran yang disesuaikan */}
                    <div
                        className={`mt-6 flex gap-3 transition-all duration-500 delay-500 ${
                            isModalAnimating && !isClosing
                                ? 'translate-y-0 opacity-100'
                                : 'translate-y-6 opacity-0'
                        }`}
                    >
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-300 ${
                                isLoading
                                    ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 hover:from-amber-100 hover:to-yellow-100 hover:border-amber-400 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500'
                            }`}
                        >
                            <div className="flex items-center justify-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Batal</span>
                            </div>
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-transparent transition-all duration-300 ${
                                isLoading
                                    ? 'bg-red-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500'
                            } text-white`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                    </svg>
                                    <span>Menghapus...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-1">
                                    <TrashIcon className="w-4 h-4" />
                                    <span>Ya, Hapus</span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Pagination Component
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}
interface PaginationProps {
    links: PaginationLink[];
    meta: PaginatedData<any>;
}
function Pagination({ links, meta }: PaginationProps): JSX.Element {
    if (!links || links.length === 0) return <></>;
    return (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
            <div className="flex-1 flex justify-between sm:hidden">
                {meta.prev_page_url && (
                    <Link
                        href={meta.prev_page_url}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Sebelumnya
                    </Link>
                )}
                {meta.next_page_url && (
                    <Link
                        href={meta.next_page_url}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Selanjutnya
                    </Link>
                )}
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Menampilkan{' '}
                        <span className="font-medium">{meta.from || 0}</span>
                        {' '}sampai{' '}
                        <span className="font-medium">{meta.to || 0}</span>
                        {' '}dari{' '}
                        <span className="font-medium">{meta.total || 0}</span>
                        {' '}produk
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        {links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${link.active
                                    ? 'z-10 bg-amber-50 border-amber-500 text-amber-700'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    } ${index === 0 ? 'rounded-l-md' : ''
                                    } ${index === links.length - 1 ? 'rounded-r-md' : ''
                                    }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}

// BulkActionModal Component
interface BulkActionModalProps {
    action: string;
    selectedCount: number;
    onConfirm: () => void;
    onCancel: () => void;
}
function BulkActionModal({ action, selectedCount, onConfirm, onCancel }: BulkActionModalProps): JSX.Element {
    const getActionText = (action: string): string => {
        switch (action) {
            case 'activate': return 'mengaktifkan';
            case 'deactivate': return 'menonaktifkan';
            case 'delete': return 'menghapus';
            default: return action;
        }
    };
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <h3 className="text-lg font-medium text-gray-900">
                        Konfirmasi Aksi
                    </h3>
                    <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-gray-500">
                            Apakah Anda yakin ingin {getActionText(action)} {selectedCount} produk yang dipilih?
                        </p>
                    </div>
                    <div className="flex justify-center space-x-4 px-4 py-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Ya, Lanjutkan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// StatCard
function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
    const colorClasses: Record<string, string> = {
        amber: 'bg-amber-600',
        green: 'bg-green-500',
        yellow: 'bg-yellow-400',
        red: 'bg-red-500',
    };
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4 sm:p-5 flex items-center">
                <div className={`w-8 h-8 ${colorClasses[color]} rounded-md flex items-center justify-center`}>
                    <span className="text-white text-sm font-medium">
                        {title.charAt(0)}
                    </span>
                </div>
                <div className="ml-4 sm:ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                            {title}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                            {value.toLocaleString('id-ID')}
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    );
}

// FilterForm dengan layout yang lebih baik
function FilterForm({ onSubmit, categories, filters }: {
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    categories: Record<number, string>;
    filters: ProductFilters;
}) {
    return (
        <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pencarian
                            </label>
                            <input
                                type="text"
                                name="search"
                                defaultValue={filters.search || ''}
                                placeholder="Cari produk..."
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm"
                            />
                        </div>
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kategori
                            </label>
                            <select
                                name="category_id"
                                defaultValue={filters.category_id || ''}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm"
                            >
                                <option value="">Semua Kategori</option>
                                {Object.entries(categories).map(([id, name]) => (
                                    <option key={id} value={id}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                defaultValue={filters.status || ''}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm"
                            >
                                <option value="">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Tidak Aktif</option>
                            </select>
                        </div>
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stok
                            </label>
                            <select
                                name="stock_status"
                                defaultValue={filters.stock_status || ''}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm"
                            >
                                <option value="">Semua Stok</option>
                                <option value="available">Tersedia</option>
                                <option value="low">Stok Rendah</option>
                                <option value="out">Stok Habis</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                            Filter
                        </button>
                        <Link
                            href="/admin/products"
                            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                            Reset
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

// BulkActions
function BulkActions({ selectedCount, bulkAction, setBulkAction, onExecute }: {
    selectedCount: number;
    bulkAction: string;
    setBulkAction: (action: string) => void;
    onExecute: () => void;
}) {
    return (
        <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-3 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-700">
                            {selectedCount} produk dipilih
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select
                            value={bulkAction}
                            onChange={(e) => setBulkAction(e.target.value)}
                            className="border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm"
                        >
                            <option value="">Pilih Aksi</option>
                            <option value="activate">Aktifkan</option>
                            <option value="deactivate">Nonaktifkan</option>
                            <option value="delete">Hapus</option>
                        </select>
                        <button
                            onClick={onExecute}
                            disabled={!bulkAction}
                            className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-400"
                        >
                            Jalankan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ProductsTable yang lebih compact
function ProductsTable({
    products,
    selectedProducts,
    onToggleSelection,
    onToggleSelectAll,
    onDelete
}: {
    products: Product[];
    selectedProducts: number[];
    onToggleSelection: (id: number) => void;
    onToggleSelectAll: () => void;
    onDelete: (product: Product) => void;
}): JSX.Element {
    if (!products || products.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-12 text-center">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2m0 0V4a2 2 0 012-2h2m0 0V2a2 2 0 012-2h2" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada produk</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Mulai dengan menambahkan produk baru.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/admin/products/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
                        >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Tambah Produk
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-amber-50">
                        <tr>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider w-8">
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.length === products.length && products.length > 0}
                                    onChange={onToggleSelectAll}
                                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                />
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                                Produk
                            </th>
                            <th className="hidden lg:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                                Kategori
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                                Harga
                            </th>
                            <th className="hidden sm:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                                Stok
                            </th>
                            <th className="hidden md:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider w-20">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <ProductRow
                                key={product.id}
                                product={product}
                                isSelected={selectedProducts.includes(product.id)}
                                onToggleSelection={onToggleSelection}
                                onDelete={onDelete}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ProductRow({ product, isSelected, onToggleSelection, onDelete }: {
    product: Product;
    isSelected: boolean;
    onToggleSelection: (id: number) => void;
    onDelete: (product: Product) => void;
}) {
    const [imageError, setImageError] = useState<boolean>(false);
    const [imageLoading, setImageLoading] = useState<boolean>(true);

    const getImageSrc = (product: Product): string => {
        if (!product.image) return '';
        return `/storage/products/${product.image}`;
    };

    const handleImageError = (): void => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = (): void => {
        setImageLoading(false);
    };

    const getStockBadgeClass = (stock: number): string => {
        if (stock === 0) return 'bg-red-100 text-red-800';
        if (stock <= 10) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    const PlaceholderImage = (): JSX.Element => (
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gray-200 flex items-center justify-center border border-gray-300">
            <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
    );

    return (
        <tr className="hover:bg-amber-50 transition-colors duration-150">
            <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelection(product.id)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
            </td>
            <td className="px-2 sm:px-4 py-3">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 relative">
                        {imageError || !product.image ? (
                            <PlaceholderImage />
                        ) : (
                            <>
                                {imageLoading && (
                                    <div className="absolute inset-0 h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 animate-pulse rounded-lg border border-gray-300" />
                                )}
                                <img
                                    className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover border border-gray-200 transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'
                                        }`}
                                    src={getImageSrc(product)}
                                    alt={product.name}
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                    loading="lazy"
                                />
                            </>
                        )}
                    </div>
                    <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate" title={product.name}>
                            {product.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate" title={product.description}>
                            {product.description && product.description.length > 20
                                ? `${product.description.substring(0, 20)}...`
                                : product.description || 'Tidak ada deskripsi'
                            }
                        </div>
                        <div className="lg:hidden mt-1 space-y-1">
                            <div className="text-xs text-gray-500">
                                {product.category?.name || 'Tidak ada kategori'}
                            </div>
                            <div className="sm:hidden text-xs text-gray-500">
                                Stok: {product.stock || 0}
                            </div>
                            <div className="md:hidden text-xs">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {product.is_active ? 'Aktif' : 'Tidak Aktif'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </td>
            <td className="hidden lg:table-cell px-2 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {product.category?.name || 'Tidak ada kategori'}
                </span>
            </td>
            <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                <div className="text-xs sm:text-sm">
                    Rp {(product.price || 0).toLocaleString('id-ID')}
                </div>
            </td>
            <td className="hidden sm:table-cell px-2 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockBadgeClass(product.stock || 0)}`}>
                    {product.stock || 0}
                </span>
            </td>
            <td className="hidden md:table-cell px-2 sm:px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {product.is_active ? 'Aktif' : 'Tidak Aktif'}
                </span>
            </td>
            <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-1">
                    <Link
                        href={`/admin/products/${product.id}`}
                        className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        title="Lihat Detail"
                    >
                        <EyeIcon className="h-4 w-4 text-indigo-600" />
                    </Link>
                    <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-1 rounded bg-amber-50 hover:bg-amber-100 transition-colors"
                        title="Edit Produk"
                    >
                        <PencilIcon className="h-4 w-4 text-amber-600" />
                    </Link>
                    <button
                        onClick={() => onDelete(product)}
                        className="p-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                        title="Hapus Produk"
                    >
                        <TrashIcon className="h-4 w-4 text-red-600" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

export default function ProductsIndex({
    products,
    categories,
    statistics,
    filters
}: Props): JSX.Element {
    const pageProps = usePage<PageProps>().props;
    const flash = pageProps.flash ?? {};
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [bulkAction, setBulkAction] = useState<string>('');
    const [showBulkModal, setShowBulkModal] = useState<boolean>(false);

    // DITAMBAHKAN: State untuk delete modal dengan animasi
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const safeProducts = products?.data || [];
    const safeCategories = categories || {};
    const safeStatistics = statistics || {
        total_products: 0,
        active_products: 0,
        low_stock_products: 0,
        out_of_stock_products: 0,
    };
    const safeFilters = filters || {};

    const handleSearch = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchParams = Object.fromEntries(formData) as unknown as ProductFilters;
        router.get('/admin/products', searchParams as Record<string, any>, {
            preserveState: true,
            replace: true,
        });
    };

    const handleBulkAction = (): void => {
        if (selectedProducts.length === 0 || !bulkAction) return;
        router.post('/admin/products/bulk-action', {
            action: bulkAction,
            product_ids: selectedProducts,
        }, {
            onSuccess: () => {
                setSelectedProducts([]);
                setBulkAction('');
                setShowBulkModal(false);
            }
        });
    };

    const toggleProductSelection = (productId: number): void => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const toggleSelectAll = (): void => {
        if (selectedProducts.length === safeProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(safeProducts.map(product => product.id));
        }
    };

    // DIPERBAIKI: Handle delete dengan modal animasi
    const handleDelete = (product: Product): void => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    // DITAMBAHKAN: Confirm delete function
    const confirmDeleteItem = (): void => {
        if (!productToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/products/${productToDelete.id}`, {
            onSuccess: () => {
                setIsDeleting(false);
                setShowDeleteModal(false);
                setProductToDelete(null);
            },
            onError: () => {
                setIsDeleting(false);
            }
        });
    };

    // DITAMBAHKAN: Close delete modal function
    const closeDeleteModal = (): void => {
        if (!isDeleting) {
            setShowDeleteModal(false);
            setProductToDelete(null);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-amber-900 leading-tight">
                    Produk
                </h2>
            }
        >
            <Head title="Kelola Produk" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-7 text-amber-900 truncate">
                                Kelola Produk
                            </h2>
                        </div>
                        <div className="flex-shrink-0">
                            <Link
                                href="/admin/products/create"
                                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                            >
                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                <span className="hidden sm:inline">Tambah Produk</span>
                                <span className="sm:hidden">Tambah</span>
                            </Link>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {flash.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {flash.error}
                        </div>
                    )}

                    {/* Statistik Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                        <StatCard title="Total Produk" value={safeStatistics.total_products} color="amber" />
                        <StatCard title="Produk Aktif" value={safeStatistics.active_products} color="green" />
                        <StatCard title="Stok Rendah" value={safeStatistics.low_stock_products} color="yellow" />
                        <StatCard title="Stok Habis" value={safeStatistics.out_of_stock_products} color="red" />
                    </div>

                    {/* Filter */}
                    <FilterForm
                        onSubmit={handleSearch}
                        categories={safeCategories}
                        filters={safeFilters}
                    />

                    {/* Bulk Actions */}
                    {selectedProducts.length > 0 && (
                        <BulkActions
                            selectedCount={selectedProducts.length}
                            bulkAction={bulkAction}
                            setBulkAction={setBulkAction}
                            onExecute={() => setShowBulkModal(true)}
                        />
                    )}

                    {/* Products Table */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <div className="overflow-x-auto">
                            <ProductsTable
                                products={safeProducts}
                                selectedProducts={selectedProducts}
                                onToggleSelection={toggleProductSelection}
                                onToggleSelectAll={toggleSelectAll}
                                onDelete={handleDelete}
                            />
                        </div>
                    </div>

                    {/* Pagination */}
                    {products?.links && (
                        <Pagination
                            links={products.links.map(link => ({
                                ...link,
                                url: link.url === undefined ? null : link.url
                            }))}
                            meta={products}
                        />
                    )}
                </div>
            </div>

            {/* DITAMBAHKAN: Enhanced Delete Confirmation Modal dengan Animasi */}
            <DeleteModal
                show={showDeleteModal}
                product={productToDelete}
                isLoading={isDeleting}
                onConfirm={confirmDeleteItem}
                onCancel={closeDeleteModal}
            />

            {/* Bulk Action Confirmation Modal */}
            {showBulkModal && (
                <BulkActionModal
                    action={bulkAction}
                    selectedCount={selectedProducts.length}
                    onConfirm={handleBulkAction}
                    onCancel={() => setShowBulkModal(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}
