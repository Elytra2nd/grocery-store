// resources/js/Pages/Admin/Products/Index.tsx
import React, { useState, FormEvent } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Product, PageProps, PaginatedData, DashboardStatistics, ProductFilters } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Props extends PageProps {
    products: PaginatedData<Product>;
    categories: string[];
    statistics: DashboardStatistics;
    filters: ProductFilters;
}

// PASTIKAN menggunakan default export yang benar
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

    // Safe fallbacks untuk data yang mungkin undefined
    const safeProducts = products?.data || [];
    const safeCategories = categories || [];
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
        const searchParams = Object.fromEntries(formData) as ProductFilters;
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

    const handleDelete = (product: Product): void => {
        if (confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`)) {
            router.delete(`/admin/products/${product.id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Kelola Produk" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="md:flex md:items-center md:justify-between mb-6">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                                Kelola Produk
                            </h2>
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4">
                            <Link
                                href="/admin/products/create"
                                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                Tambah Produk
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

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            title="Total Produk"
                            value={safeStatistics.total_products}
                            color="blue"
                        />
                        <StatCard
                            title="Produk Aktif"
                            value={safeStatistics.active_products}
                            color="green"
                        />
                        <StatCard
                            title="Stok Rendah"
                            value={safeStatistics.low_stock_products}
                            color="yellow"
                        />
                        <StatCard
                            title="Stok Habis"
                            value={safeStatistics.out_of_stock_products}
                            color="red"
                        />
                    </div>

                    {/* Filters */}
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
                    <ProductsTable
                        products={safeProducts}
                        selectedProducts={selectedProducts}
                        onToggleSelection={toggleProductSelection}
                        onToggleSelectAll={toggleSelectAll}
                        onDelete={handleDelete}
                    />

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

// Sub-components dengan perbaikan
interface StatCardProps {
    title: string;
    value: number;
    color: 'blue' | 'green' | 'yellow' | 'red';
}

function StatCard({ title, value, color }: StatCardProps): JSX.Element {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className={`w-8 h-8 ${colorClasses[color]} rounded-md flex items-center justify-center`}>
                            <span className="text-white text-sm font-medium">
                                {title.charAt(0)}
                            </span>
                        </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {title}
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                                {value.toLocaleString('id-ID')}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface FilterFormProps {
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    categories: string[];
    filters: ProductFilters;
}

function FilterForm({ onSubmit, categories, filters }: FilterFormProps): JSX.Element {
    return (
        <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Pencarian
                            </label>
                            <input
                                type="text"
                                name="search"
                                defaultValue={filters.search || ''}
                                placeholder="Cari produk..."
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Kategori
                            </label>
                            <select
                                name="category"
                                defaultValue={filters.category || ''}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <select
                                name="status"
                                defaultValue={filters.status || ''}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Tidak Aktif</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Stok
                            </label>
                            <select
                                name="stock_status"
                                defaultValue={filters.stock_status || ''}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">Semua Stok</option>
                                <option value="available">Tersedia</option>
                                <option value="low">Stok Rendah</option>
                                <option value="out">Stok Habis</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Filter
                        </button>

                        <Link
                            href="/admin/products"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Reset
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface BulkActionsProps {
    selectedCount: number;
    bulkAction: string;
    setBulkAction: (action: string) => void;
    onExecute: () => void;
}

function BulkActions({ selectedCount, bulkAction, setBulkAction, onExecute }: BulkActionsProps): JSX.Element {
    return (
        <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-3 sm:px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-700">
                            {selectedCount} produk dipilih
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <select
                            value={bulkAction}
                            onChange={(e) => setBulkAction(e.target.value)}
                            className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Pilih Aksi</option>
                            <option value="activate">Aktifkan</option>
                            <option value="deactivate">Nonaktifkan</option>
                            <option value="delete">Hapus</option>
                        </select>
                        <button
                            onClick={onExecute}
                            disabled={!bulkAction}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                        >
                            Jalankan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ProductsTableProps {
    products: Product[];
    selectedProducts: number[];
    onToggleSelection: (id: number) => void;
    onToggleSelectAll: () => void;
    onDelete: (product: Product) => void;
}

function ProductsTable({
    products,
    selectedProducts,
    onToggleSelection,
    onToggleSelectAll,
    onDelete
}: ProductsTableProps): JSX.Element {
    // Handle empty products
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
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
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
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.length === products.length && products.length > 0}
                                    onChange={onToggleSelectAll}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Produk
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kategori
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Harga
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stok
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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

// ProductRow component (sama seperti kode sebelumnya)
interface ProductRowProps {
    product: Product;
    isSelected: boolean;
    onToggleSelection: (id: number) => void;
    onDelete: (product: Product) => void;
}

function ProductRow({ product, isSelected, onToggleSelection, onDelete }: ProductRowProps): JSX.Element {
    const [imageError, setImageError] = useState<boolean>(false);
    const [imageLoading, setImageLoading] = useState<boolean>(true);

    const getImageSrc = (product: Product): string => {
        if (!product.image) {
            return '';
        }
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
        <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center border border-gray-300">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
    );

    return (
        <tr className="hover:bg-gray-50 transition-colors duration-150">
            <td className="px-6 py-4 whitespace-nowrap">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelection(product.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16 relative">
                        {imageError || !product.image ? (
                            <PlaceholderImage />
                        ) : (
                            <>
                                {imageLoading && (
                                    <div className="absolute inset-0 h-16 w-16 bg-gray-200 animate-pulse rounded-lg border border-gray-300" />
                                )}
                                <img
                                    className={`h-16 w-16 rounded-lg object-cover border border-gray-200 transition-opacity duration-300 ${
                                        imageLoading ? 'opacity-0' : 'opacity-100'
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
                    <div className="ml-4 flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={product.name}>
                            {product.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs" title={product.description}>
                            {product.description && product.description.length > 50
                                ? `${product.description.substring(0, 50)}...`
                                : product.description || 'Tidak ada deskripsi'
                            }
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {product.category || 'Tidak ada kategori'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                Rp {(product.price || 0).toLocaleString('id-ID')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockBadgeClass(product.stock || 0)}`}>
                    {product.stock || 0}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                }`}>
                    {product.is_active ? 'Aktif' : 'Tidak Aktif'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                    <Link
                        href={`/admin/products/${product.id}`}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors duration-150"
                        title="Lihat Detail"
                    >
                        <EyeIcon className="h-5 w-5" />
                    </Link>
                    <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors duration-150"
                        title="Edit Produk"
                    >
                        <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                        onClick={() => onDelete(product)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors duration-150"
                        title="Hapus Produk"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// Pagination dan BulkActionModal components (sama seperti sebelumnya)
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
    return (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
            <div className="flex-1 flex justify-between sm:hidden">
                {meta.prev_page_url && (
                    <Link
                        href={meta.prev_page_url}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Previous
                    </Link>
                )}
                {meta.next_page_url && (
                    <Link
                        href={meta.next_page_url}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Next
                    </Link>
                )}
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{meta.from || 0}</span>
                        {' '}to{' '}
                        <span className="font-medium">{meta.to || 0}</span>
                        {' '}of{' '}
                        <span className="font-medium">{meta.total || 0}</span>
                        {' '}results
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        {links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    link.active
                                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                } ${
                                    index === 0 ? 'rounded-l-md' : ''
                                } ${
                                    index === links.length - 1 ? 'rounded-r-md' : ''
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
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
