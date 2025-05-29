import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import BuyerAuthenticatedLayout from '@/Layouts/BuyerAuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Product } from '@/types'
import { PageProps } from '@/types';

type Category = {
    id: number;
    name: string;
};

type ProductFilters = {
    search: string;
    category: string;
    min_price: number;
    max_price: number;
    sort_by: string;
    sort_order: string;
    in_stock: boolean;
    per_page: number;
    page: number;
    [key: string]: any;
};

interface ProductIndexProps {
    products: {
        data: Product[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
        from: number;
        to: number;
    };
    categories: Category[]; // Array objek, bukan string[]
    priceRange: {
        min_price: number;
        max_price: number;
    };
    filters: {
        search?: string;
        category?: string;
        min_price?: number;
        max_price?: number;
        sort_by?: string;
        sort_order?: string;
        in_stock?: boolean;
        per_page?: number;
        page?: number;
    };
}

export default function ProductIndex({
    products,
    categories,
    priceRange,
    filters,
}: ProductIndexProps): JSX.Element {
    const { auth, flash } = usePage<PageProps>().props;
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState<ProductFilters>({
        search: filters.search || '',
        category: filters.category || '',
        min_price: filters.min_price ?? priceRange.min_price,
        max_price: filters.max_price ?? priceRange.max_price,
        sort_by: filters.sort_by || 'name',
        sort_order: filters.sort_order || 'asc',
        in_stock: filters.in_stock || false,
        per_page: filters.per_page || 12,
        page: filters.page || 1,
    });

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (localFilters.search !== (filters.search || '')) {
                handleFilterChange({ page: 1 });
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [localFilters.search]);

    const handleFilterChange = (extra: Partial<ProductFilters> = {}) => {
        const params = {
            ...localFilters,
            ...extra,
        };
        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(
                ([, value]) =>
                    value !== '' &&
                    value !== false &&
                    value !== null &&
                    typeof value !== 'undefined'
            )
        );
        router.get(route('products.index'), filteredParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        const resetFilters: ProductFilters = {
            search: '',
            category: '',
            min_price: priceRange.min_price,
            max_price: priceRange.max_price,
            sort_by: 'name',
            sort_order: 'asc',
            in_stock: false,
            per_page: 12,
            page: 1,
        };
        setLocalFilters(resetFilters);
        router.get(route('products.index'), resetFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleInputChange = (key: keyof ProductFilters, value: any) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value,
            ...(key !== 'search' ? { page: 1 } : {}),
        }));
        if (key !== 'search') {
            setTimeout(() => handleFilterChange({ [key]: value, page: 1 }), 100);
        }
    };

    const goToPage = (page: number) => {
        setLocalFilters(prev => ({ ...prev, page }));
        handleFilterChange({ page });
    };

    // Conditional Layout Rendering
    const Layout = auth?.user ? BuyerAuthenticatedLayout : GuestLayout;

    return (
        <Layout>
            <Head title="Neo-Forest Collection" />

            {/* Flash Messages */}
            {flash?.success && (
                <div className="fixed top-4 right-4 z-50 max-w-md">
                    <div className="bg-emerald-500/95 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-2xl border border-emerald-400/30 animate-slide-in">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-emerald-900" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">Transaksi Berhasil!</p>
                                <p className="text-sm mt-1 text-emerald-100">{flash.success}</p>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-shrink-0 text-emerald-200 hover:text-white"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {flash?.error && (
                <div className="fixed top-4 right-4 z-50 max-w-md">
                    <div className="bg-red-500/95 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-2xl border border-red-400/30 animate-slide-in">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-900" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm">Error!</p>
                                <p className="text-sm mt-1 text-red-100">{flash.error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed inset-0 overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="relative z-10 min-h-screen flex flex-col">
                    {/* Header */}
                    <div className="relative">
                        {!auth?.user && (
                            <div className="absolute top-4 right-6 z-10">
                                <Link
                                    href={route('login')}
                                    className="inline-block px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow transition"
                                >
                                    Login
                                </Link>
                            </div>
                        )}
                        <header className="pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 text-center">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
                                Neo-Forest Collection
                            </h1>
                            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4">
                                Where nature meets cutting-edge technology
                            </p>
                        </header>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="px-4 sm:px-6 lg:px-8 mb-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative max-w-md mx-auto">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={localFilters.search}
                                        onChange={e => handleInputChange('search', e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                                    />
                                    <svg
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Results count and per-page selector */}
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="lg:hidden flex items-center space-x-2 bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-lg px-4 py-2 text-white hover:border-amber-400/40 transition-all duration-300"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                                    </svg>
                                    <span>Filters</span>
                                    {Object.values(filters).some(v => v) && (
                                        <span className="bg-amber-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                                            {Object.values(filters).filter(v => v).length}
                                        </span>
                                    )}
                                </button>
                                <div className="flex items-center space-x-4 text-sm">
                                    {products.data.length > 0 && (
                                        <span className="text-gray-400">
                                            {products.from}-{products.to} of {products.total} products
                                        </span>
                                    )}
                                    <div className="hidden sm:flex items-center space-x-2">
                                        <span className="text-gray-400">Show:</span>
                                        <select
                                            value={localFilters.per_page}
                                            onChange={e => {
                                                const perPage = parseInt(e.target.value);
                                                handleInputChange('per_page', perPage);
                                                handleInputChange('page', 1);
                                            }}
                                            className="bg-gray-800/60 border border-gray-700/50 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-amber-400/60"
                                        >
                                            <option value={12}>12</option>
                                            <option value={24}>24</option>
                                            <option value={36}>36</option>
                                            <option value={48}>48</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Filter Panel */}
                            <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block mb-6`}>
                                <div className="bg-gray-800/40 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-gray-700/50">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                        {/* Category Filter - DIPERBAIKI */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                            <select
                                                value={localFilters.category}
                                                onChange={e => handleInputChange('category', e.target.value)}
                                                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                                            >
                                                <option value="">All Categories</option>
                                                {categories.map(category => (
                                                    <option key={category.id} value={category.name}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Price Range */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Min Price</label>
                                            <input
                                                type="number"
                                                value={localFilters.min_price}
                                                onChange={e => handleInputChange('min_price', Number(e.target.value))}
                                                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                                                placeholder="Min"
                                                min={priceRange.min_price}
                                                max={localFilters.max_price}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Max Price</label>
                                            <input
                                                type="number"
                                                value={localFilters.max_price}
                                                onChange={e => handleInputChange('max_price', Number(e.target.value))}
                                                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                                                placeholder="Max"
                                                min={localFilters.min_price}
                                                max={priceRange.max_price}
                                            />
                                        </div>

                                        {/* Sort By */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                                            <select
                                                value={`${localFilters.sort_by}-${localFilters.sort_order}`}
                                                onChange={e => {
                                                    const [sortBy, sortOrder] = e.target.value.split('-');
                                                    handleInputChange('sort_by', sortBy);
                                                    handleInputChange('sort_order', sortOrder);
                                                }}
                                                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                                            >
                                                <option value="name-asc">Name A-Z</option>
                                                <option value="name-desc">Name Z-A</option>
                                                <option value="price-asc">Price Low-High</option>
                                                <option value="price-desc">Price High-Low</option>
                                                <option value="created_at-desc">Newest First</option>
                                                <option value="created_at-asc">Oldest First</option>
                                            </select>
                                        </div>

                                        {/* Stock Filter & Clear Button */}
                                        <div className="flex flex-col justify-between">
                                            <label className="flex items-center text-sm text-gray-300 mb-2">
                                                <input
                                                    type="checkbox"
                                                    checked={!!localFilters.in_stock}
                                                    onChange={e => handleInputChange('in_stock', e.target.checked)}
                                                    className="mr-2 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-400 focus:ring-offset-gray-800"
                                                />
                                                In Stock Only
                                            </label>
                                            <button
                                                onClick={clearFilters}
                                                className="w-full bg-gray-600/50 hover:bg-gray-600/70 text-white px-3 py-2 rounded-lg transition-all duration-300 text-sm"
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products grid section - DIPERBAIKI */}
                    <main className="flex-grow px-4 sm:px-6 lg:px-8 pb-20">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                            {products.data.map((product: Product) => (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.id}`}
                                    className="group relative bg-gray-800/60 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/50 hover:border-amber-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 block"
                                >
                                    {/* Product image container - DIPERBAIKI */}
                                    <div className="aspect-square overflow-hidden relative">
                                        {product.image ? (
                                            <img
                                                src={`/storage/products/${product.image}`}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                loading="lazy"
                                                onError={(e) => {
                                                    // Fallback jika gambar tidak ditemukan
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        {/* Fallback placeholder */}
                                        <div className={`w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                                            <span className="text-amber-400 text-xl sm:text-2xl font-bold">NEO</span>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent" />
                                    </div>

                                    {/* Product information */}
                                    <div className="p-4 sm:p-5 space-y-3">
                                        {/* Category and stock status - DIPERBAIKI */}
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-medium text-amber-400 bg-gray-700/50 px-2 py-1 rounded-full border border-gray-600/50">
                                                {product.category?.name || 'No Category'}
                                            </span>
                                            <span className={`text-xs font-semibold ${product.stock > 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                                {product.stock > 0 ? `${product.stock} left` : 'Sold Out'}
                                            </span>
                                        </div>

                                        {/* Product title */}
                                        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                                            <span className="hover:underline line-clamp-2">
                                                {product.name}
                                            </span>
                                        </h3>

                                        {/* Product description */}
                                        <p className="text-sm text-gray-300 line-clamp-2">
                                            {product.description}
                                        </p>

                                        {/* Product price */}
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-amber-400">
                                                Rp {product.price.toLocaleString('id-ID')}
                                            </span>
                                            {auth?.user && (
                                                <span className="text-xs text-emerald-400">
                                                    ✓ Ready to Buy
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/30 rounded-xl pointer-events-none transition-all duration-300" />
                                </Link>
                            ))}
                        </div>

                        {/* Empty state */}
                        {products.data.length === 0 && (
                            <div className="text-center py-20">
                                <div className="text-4xl sm:text-6xl mb-4">🌲</div>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-300 mb-2">No Products Found</h3>
                                <p className="text-gray-400 px-4">
                                    {filters.search
                                        ? `No products match "${filters.search}". Try different keywords or clear filters.`
                                        : 'Check back later for new additions to our collection.'}
                                </p>
                                {Object.values(filters).some(v => v) && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg transition-all duration-300"
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="mt-12 flex justify-center">
                                <nav className="flex items-center space-x-2">
                                    {products.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && router.visit(link.url)}
                                            disabled={!link.url}
                                            className={`px-3 py-2 text-sm rounded-lg transition-all duration-300 ${
                                                link.active
                                                    ? 'bg-amber-500 text-white'
                                                    : link.url
                                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </nav>
                            </div>
                        )}
                    </main>

                    {/* Footer */}
                    <footer className="py-6 text-center text-gray-400 text-sm border-t border-gray-800/50">
                        <div className="max-w-7xl mx-auto px-4">
                            <p>© {new Date().getFullYear()} Neo-Forest. All rights reserved.</p>
                        </div>
                    </footer>
                </div>
            </div>
        </Layout>
    );
}
