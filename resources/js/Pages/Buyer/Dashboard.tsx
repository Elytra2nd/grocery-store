import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import BuyerAuthenticatedLayout from '@/Layouts/BuyerAuthenticatedLayout';

// Interface untuk Grocery Store data
interface GroceryProduct {
    id: number;
    name: string;
    price: number;
    unit: string;
    image?: string;
    emoji: string;
    sold_count: number;
    category: string;
}

interface GroceryCartItem {
    id: number;
    quantity: number;
    created_at: string;
    product: {
        id: number;
        name: string;
        price: number;
        unit: string;
        image?: string;
        emoji: string;
        category: string;
    };
}

interface GroceryOrder {
    id: number;
    order_number: string;
    created_at: string;
    status: string;
    total_amount: number;
    shipping_address: string;
    items_count: number;
    items: Array<{
        quantity: number;
        price: number;
        product: {
            id: number;
            name: string;
            price: number;
            emoji: string;
            category: string;
        };
    }>;
}

interface GroceryStats {
    totalProducts: number;
    cartItemsCount: number;
    cartTotalValue: number;
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
}

interface DashboardProps {
    popularProducts: GroceryProduct[];
    cartItems: GroceryCartItem[];
    recentOrders: GroceryOrder[];
    stats: GroceryStats;
}

export default function Dashboard({
    popularProducts = [],
    cartItems = [],
    recentOrders = [],
    stats = {
        totalProducts: 0,
        cartItemsCount: 0,
        cartTotalValue: 0,
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0
    }
}: DashboardProps) {
    const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});

    // Format currency untuk Rupiah
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Status badge untuk grocery orders
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu Konfirmasi' },
            processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sedang Diproses' },
            packed: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Dikemas' },
            shipped: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Dikirim' },
            delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Diterima' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Dibatalkan' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    // Animation observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        setIsVisible(prev => ({ ...prev, [id]: true }));
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('[data-animate]');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <BuyerAuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard Grocery Store
                </h2>
            }
        >
            <Head title="Dashboard Grocery Store" />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Stats Cards untuk Grocery Store */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border-2 border-emerald-200 shadow-lg">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-emerald-100">
                                    <span className="text-2xl">🛒</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Produk</p>
                                    <p className="text-2xl font-bold text-emerald-600">{stats.totalProducts}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border-2 border-blue-200 shadow-lg">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100">
                                    <span className="text-2xl">🛍️</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Item di Keranjang</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.cartItemsCount}</p>
                                    <p className="text-xs text-gray-500">{formatCurrency(stats.cartTotalValue)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border-2 border-purple-200 shadow-lg">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-purple-100">
                                    <span className="text-2xl">📦</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.totalOrders}</p>
                                    <p className="text-xs text-gray-500">{stats.pendingOrders} pending</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border-2 border-amber-200 shadow-lg">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-amber-100">
                                    <span className="text-2xl">💰</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Belanja</p>
                                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.totalSpent)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12">
                        {/* Produk Grocery Terlaris */}
                        <section
                            id="popular-products"
                            data-animate
                            className={`transition-all duration-1000 ${isVisible['popular-products']
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-8'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                                    🔥 Produk Grocery Terlaris
                                </h2>
                                <Link
                                    href={route('products.index')}
                                    className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                                >
                                    Lihat Semua Produk
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {popularProducts && popularProducts.length > 0 ? (
                                    popularProducts.slice(0, 3).map((product, index) => (
                                        <div
                                            key={product.id}
                                            className="group bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border-2 border-amber-200 hover:border-amber-400 transition-all duration-500 hover:shadow-lg transform hover:-translate-y-1"
                                        >
                                            <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center relative overflow-hidden">
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="text-center">
                                                        <div className="text-4xl mb-2">{product.emoji}</div>
                                                        <span className="text-amber-700 font-bold text-sm">{product.category}</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                                                    #{index + 1}
                                                </div>
                                                <div className="absolute bottom-2 left-2 bg-white/90 text-xs px-2 py-1 rounded-full font-medium text-gray-700">
                                                    {product.category}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-amber-900 mb-1 group-hover:text-amber-700 transition-colors">
                                                    {product.name}
                                                </h3>
                                                <p className="text-amber-700 font-semibold">
                                                    {formatCurrency(product.price)}/{product.unit}
                                                </p>
                                                <p className="text-xs text-amber-600 mt-1">
                                                    Terjual {product.sold_count} {product.unit}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-3 text-center py-8 text-amber-600">
                                        <div className="animate-pulse">
                                            <span className="text-6xl mb-4 block">🛒</span>
                                            <p>Belum ada produk grocery terlaris</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Keranjang Grocery */}
                        <section
                            id="cart-preview"
                            data-animate
                            className={`transition-all duration-1000 delay-200 ${isVisible['cart-preview']
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-8'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                                    🛍️ Keranjang Grocery
                                </h2>
                                <Link
                                    href={route('buyer.cart.index')}
                                    className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                                >
                                    Lihat Keranjang ({stats.cartItemsCount})
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {cartItems && cartItems.length > 0 ? (
                                    cartItems.slice(0, 3).map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="bg-white/90 backdrop-blur-md rounded-xl p-4 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {item.product?.image ? (
                                                        <img
                                                            src={item.product.image}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-2xl">{item.product?.emoji}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-amber-900 text-sm truncate">
                                                        {item.product?.name}
                                                    </h3>
                                                    <p className="text-amber-700 font-semibold text-sm">
                                                        {formatCurrency(item.product?.price || 0)}/{item.product?.unit}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                            Qty: {item.quantity}
                                                        </span>
                                                        <span className="text-xs text-amber-600">
                                                            {formatCurrency((item.product?.price || 0) * item.quantity)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {item.product?.category}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-3 text-center py-8 text-amber-600">
                                        <div className="animate-bounce">
                                            <span className="text-6xl mb-4 block">🛍️</span>
                                            <p>Keranjang grocery masih kosong</p>
                                            <Link
                                                href={route('products.index')}
                                                className="inline-block mt-4 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
                                            >
                                                Mulai Belanja
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {cartItems && cartItems.length > 0 && (
                                <div className="mt-6 text-center">
                                    <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border-2 border-emerald-200 inline-block">
                                        <p className="text-lg font-bold text-emerald-800">
                                            Total Keranjang: <span className="text-emerald-600">
                                                {formatCurrency(stats.cartTotalValue)}
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {stats.cartItemsCount} item dalam keranjang
                                        </p>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Pesanan Grocery Terakhir */}
                        <section
                            id="recent-orders"
                            data-animate
                            className={`transition-all duration-1000 delay-400 ${isVisible['recent-orders']
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-8'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                                    📦 Pesanan Grocery Terakhir
                                </h2>
                                <Link
                                    href={route('buyer.orders.index')}
                                    className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                                >
                                    Lihat Semua Pesanan
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {recentOrders && recentOrders.length > 0 ? (
                                    recentOrders.slice(0, 3).map((order, index) => (
                                        <div
                                            key={order.id}
                                            className="bg-white/90 backdrop-blur-md rounded-xl p-4 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-bold text-amber-900 text-sm">
                                                        {order.order_number}
                                                    </h3>
                                                    <p className="text-xs text-amber-600">
                                                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            <div className="space-y-2 max-h-20 overflow-y-auto">
                                                {order.items?.slice(0, 2).map((orderItem, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <span className="text-lg">{orderItem.product?.emoji}</span>
                                                        <span className="text-sm text-amber-800 truncate">
                                                            {orderItem.product?.name} x{orderItem.quantity}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            ({orderItem.product?.category})
                                                        </span>
                                                    </div>
                                                ))}
                                                {(order.items_count ?? 0) > 2 && (
                                                    <p className="text-xs text-amber-600">
                                                        +{(order.items_count ?? 0) - 2} item grocery lainnya
                                                    </p>
                                                )}
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-amber-200">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm font-bold text-amber-700">
                                                        {formatCurrency(order.total_amount)}
                                                    </p>
                                                    <span className="text-xs text-gray-500">
                                                        {order.items_count} item
                                                    </span>
                                                </div>
                                                {order.shipping_address && (
                                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                                        📍 {order.shipping_address}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-3 text-center py-8 text-amber-600">
                                        <div className="animate-pulse">
                                            <span className="text-6xl mb-4 block">📦</span>
                                            <p>Belum ada pesanan grocery</p>
                                            <Link
                                                href={route('products.index')}
                                                className="inline-block mt-4 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
                                            >
                                                Mulai Berbelanja
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </BuyerAuthenticatedLayout>
    );
}
