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
    categories: Category[];
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
        <>
            <Layout>
                <Head title="Fresh Market Collection" />

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border border-green-400/30">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-bounce-slow">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">Transaksi Berhasil!</p>
                                    <p className="text-sm mt-1 text-green-100">{flash.success}</p>
                                </div>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex-shrink-0 text-green-200 hover:text-white transition-colors"
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
                    <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border border-red-400/30">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
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

                {/* Main Container - FIXED: Added full viewport classes */}
                <div className="w-full min-h-screen h-full bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
                    <div className="relative w-full h-full">
                        {/* Decorative background pattern */}
                        <div className="fixed inset-0 opacity-5 pointer-events-none">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }} />
                        </div>

                        {/* Login button for guests - FIXED: Better positioning */}
                        {!auth?.user && (
                            <div className="fixed top-4 right-4 sm:right-6 z-50 animate-fade-in">
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Login
                                </Link>
                            </div>
                        )}

                        {/* Header - FIXED: Better responsive padding */}
                        <header className="pt-16 sm:pt-20 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
                            <div className="max-w-4xl mx-auto">
                                <div className="inline-flex items-center gap-3 mb-4 animate-bounce-slow">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L7 13m0 0L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0a2 2 0 11-4 0" />
                                        </svg>
                                    </div>
                                </div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent drop-shadow-sm">
                                    Fresh Market Collection
                                </h1>
                                <p className="text-base sm:text-lg lg:text-xl text-amber-800 max-w-2xl mx-auto px-4 font-medium">
                                    Your daily essentials, delivered fresh to your doorstep
                                </p>
                            </div>
                        </header>

                        {/* Search and Filter Bar - FIXED: Better responsive spacing */}
                        <div className="px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
                            <div className="max-w-7xl mx-auto w-full">
                                {/* Search Bar */}
                                <div className="mb-4 sm:mb-6 animate-fade-in">
                                    <div className="relative max-w-md mx-auto">
                                        <input
                                            type="text"
                                            placeholder="Search fresh products..."
                                            value={localFilters.search}
                                            onChange={e => handleInputChange('search', e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-md border-2 border-amber-200 rounded-2xl text-amber-900 placeholder-amber-500 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 shadow-lg hover:shadow-xl"
                                        />
                                        <svg
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Results count and per-page selector */}
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0 animate-fade-in">
                                    <button
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                                        className="lg:hidden flex items-center space-x-2 bg-white/90 backdrop-blur-md border-2 border-amber-200 rounded-xl px-4 py-2 text-amber-800 hover:border-amber-300 hover:bg-amber-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                                        </svg>
                                        <span className="font-medium">Filters</span>
                                        {Object.values(filters).some(v => v) && (
                                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-full px-2 py-1 ml-1 animate-pulse">
                                                {Object.values(filters).filter(v => v).length}
                                            </span>
                                        )}
                                    </button>
                                    <div className="flex items-center space-x-4 text-sm">
                                        {products.data.length > 0 && (
                                            <span className="text-amber-700 font-medium">
                                                {products.from}-{products.to} of {products.total} products
                                            </span>
                                        )}
                                        <div className="hidden sm:flex items-center space-x-2">
                                            <span className="text-amber-700 font-medium">Show:</span>
                                            <select
                                                value={localFilters.per_page}
                                                onChange={e => {
                                                    const perPage = parseInt(e.target.value);
                                                    handleInputChange('per_page', perPage);
                                                    handleInputChange('page', 1);
                                                }}
                                                className="bg-white/90 border-2 border-amber-200 rounded-lg px-3 py-1 text-amber-800 text-sm focus:outline-none focus:border-amber-400 transition-all duration-300"
                                            >
                                                <option value={12}>12</option>
                                                <option value={24}>24</option>
                                                <option value={36}>36</option>
                                                <option value={48}>48</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Filter Panel - FIXED: Better responsive layout */}
                                <div className={`${isFilterOpen ? 'block animate-slide-down' : 'hidden'} lg:block mb-6`}>
                                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 border-2 border-amber-200 shadow-xl w-full">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                            {/* Category Filter */}
                                            <div>
                                                <label className="block text-sm font-semibold text-amber-800 mb-2">Category</label>
                                                <select
                                                    value={localFilters.category}
                                                    onChange={e => handleInputChange('category', e.target.value)}
                                                    className="w-full bg-white/80 border-2 border-amber-200 rounded-lg px-3 py-2 text-amber-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 transition-all duration-300"
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
                                                <label className="block text-sm font-semibold text-amber-800 mb-2">Min Price</label>
                                                <input
                                                    type="number"
                                                    value={localFilters.min_price}
                                                    onChange={e => handleInputChange('min_price', Number(e.target.value))}
                                                    className="w-full bg-white/80 border-2 border-amber-200 rounded-lg px-3 py-2 text-amber-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 transition-all duration-300"
                                                    placeholder="Min"
                                                    min={priceRange.min_price}
                                                    max={localFilters.max_price}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-amber-800 mb-2">Max Price</label>
                                                <input
                                                    type="number"
                                                    value={localFilters.max_price}
                                                    onChange={e => handleInputChange('max_price', Number(e.target.value))}
                                                    className="w-full bg-white/80 border-2 border-amber-200 rounded-lg px-3 py-2 text-amber-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 transition-all duration-300"
                                                    placeholder="Max"
                                                    min={localFilters.min_price}
                                                    max={priceRange.max_price}
                                                />
                                            </div>

                                            {/* Sort By */}
                                            <div>
                                                <label className="block text-sm font-semibold text-amber-800 mb-2">Sort By</label>
                                                <select
                                                    value={`${localFilters.sort_by}-${localFilters.sort_order}`}
                                                    onChange={e => {
                                                        const [sortBy, sortOrder] = e.target.value.split('-');
                                                        handleInputChange('sort_by', sortBy);
                                                        handleInputChange('sort_order', sortOrder);
                                                    }}
                                                    className="w-full bg-white/80 border-2 border-amber-200 rounded-lg px-3 py-2 text-amber-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 transition-all duration-300"
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
                                                <label className="flex items-center text-sm text-amber-800 mb-2 font-medium">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!localFilters.in_stock}
                                                        onChange={e => handleInputChange('in_stock', e.target.checked)}
                                                        className="mr-2 rounded border-amber-300 bg-white text-amber-500 focus:ring-amber-400 focus:ring-offset-0"
                                                    />
                                                    In Stock Only
                                                </label>
                                                <button
                                                    onClick={clearFilters}
                                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                                >
                                                    Clear Filters
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products grid section - FIXED: Better responsive grid */}
                        <main className="px-4 sm:px-6 lg:px-8 pb-20 w-full">
                            <div className="max-w-7xl mx-auto w-full">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 w-full">
                                    {products.data.map((product: Product, index) => (
                                        <Link
                                            key={product.id}
                                            href={`/products/${product.id}`}
                                            className="group relative bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20 block transform hover:-translate-y-1 animate-fade-in w-full"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            {/* Product image container */}
                                            <div className="aspect-square overflow-hidden relative w-full">
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
                                                <div className={`w-full h-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                                                    <div className="text-center">
                                                        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-amber-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                        </svg>
                                                        <span className="text-amber-700 text-sm font-semibold">Fresh</span>
                                                    </div>
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                                            </div>

                                            {/* Product information */}
                                            <div className="p-3 sm:p-4 lg:p-5 space-y-2 sm:space-y-3 w-full">
                                                {/* Category and stock status */}
                                                <div className="flex justify-between items-start">
                                                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 sm:px-3 py-1 rounded-full border border-amber-200">
                                                        {product.category?.name || 'Fresh Items'}
                                                    </span>
                                                    <span className={`text-xs font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
                                                    </span>
                                                </div>

                                                {/* Product title */}
                                                <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-amber-900 group-hover:text-amber-700 transition-colors">
                                                    <span className="hover:underline line-clamp-2">
                                                        {product.name}
                                                    </span>
                                                </h3>

                                                {/* Product description */}
                                                <p className="text-xs sm:text-sm text-amber-700 line-clamp-2">
                                                    {product.description}
                                                </p>

                                                {/* Product price */}
                                                <div className="flex justify-between items-center pt-2">
                                                    <span className="text-lg sm:text-xl font-bold text-amber-800">
                                                        Rp {product.price.toLocaleString('id-ID')}
                                                    </span>
                                                    {auth?.user && (
                                                        <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            Ready to Order
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/50 rounded-2xl pointer-events-none transition-all
                                                duration-300" />
                                        </Link>
                                    ))}
                                </div>

                                {/* Empty state */}
                                {products.data.length === 0 && (
                                    <div className="text-center py-12 sm:py-16 animate-fade-in">
                                        <div className="max-w-md mx-auto">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl sm:text-2xl font-bold text-amber-800 mb-4">No Products Found</h3>
                                            <p className="text-amber-700 mb-6">We couldn't find any products matching your criteria. Try adjusting your filters or search terms.</p>
                                            <button
                                                onClick={clearFilters}
                                                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Clear All Filters
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Pagination */}
                                {products.data.length > 0 && products.last_page > 1 && (
                                    <div className="mt-12 flex justify-center animate-fade-in">
                                        <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-md rounded-2xl p-2 border-2 border-amber-200 shadow-xl">
                                            {/* Previous button */}
                                            {products.current_page > 1 && (
                                                <button
                                                    onClick={() => goToPage(products.current_page - 1)}
                                                    className="flex items-center justify-center w-10 h-10 text-amber-700 hover:text-white hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                            )}

                                            {/* Page numbers */}
                                            {Array.from({ length: Math.min(5, products.last_page) }, (_, i) => {
                                                let pageNumber;
                                                if (products.last_page <= 5) {
                                                    pageNumber = i + 1;
                                                } else if (products.current_page <= 3) {
                                                    pageNumber = i + 1;
                                                } else if (products.current_page >= products.last_page - 2) {
                                                    pageNumber = products.last_page - 4 + i;
                                                } else {
                                                    pageNumber = products.current_page - 2 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNumber}
                                                        onClick={() => goToPage(pageNumber)}
                                                        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 font-semibold ${pageNumber === products.current_page
                                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                                                            : 'text-amber-700 hover:text-white hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500'
                                                            }`}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                );
                                            })}

                                            {/* Next button */}
                                            {products.current_page < products.last_page && (
                                                <button
                                                    onClick={() => goToPage(products.current_page + 1)}
                                                    className="flex items-center justify-center w-10 h-10 text-amber-700 hover:text-white hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </main>
                    </div>
                </div>

                {/* Custom styles for animations */}
                <style>{`
                    @keyframes fade-in {
                        from {
                            opacity: 0;
                            transform: translateY(10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes slide-in {
                        from {
                            opacity: 0;
                            transform: translateX(100%);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    @keyframes slide-down {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes bounce-slow {
                        0%, 20%, 50%, 80%, 100% {
                            transform: translateY(0);
                        }
                        40% {
                            transform: translateY(-8px);
                        }
                        60% {
                            transform: translateY(-4px);
                        }
                    }

                    .animate-fade-in {
                        animation: fade-in 0.6s ease-out forwards;
                    }

                    .animate-slide-in {
                        animation: slide-in 0.5s ease-out forwards;
                    }

                    .animate-slide-down {
                        animation: slide-down 0.3s ease-out forwards;
                    }

                    .animate-bounce-slow {
                        animation: bounce-slow 3s infinite;
                    }

                    .line-clamp-2 {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }

                    /* Fullscreen fixes */
                    html, body, #app, #root {
                        height: 100%;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }

                    .min-h-screen {
                        min-height: 100vh;
                        min-height: 100dvh; /* Dynamic viewport height for mobile */
                    }

                    /* Mobile viewport fixes */
                    @supports (height: 100dvh) {
                        .min-h-screen {
                            min-height: 100dvh;
                        }
                    }
                `}</style>
            </Layout>
        </>
    );
}
