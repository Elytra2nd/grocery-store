import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import BuyerAuthenticatedLayout from '@/Layouts/BuyerAuthenticatedLayout';
import { PageProps } from '@/types';

// Interfaces sesuai dengan data dari backend
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

interface DashboardProps extends PageProps {
    popularProducts: GroceryProduct[];
    cartItems: GroceryCartItem[];
    recentOrders: GroceryOrder[];
    stats: GroceryStats;
}

export default function Dashboard() {
    const { popularProducts, cartItems, recentOrders, stats } = usePage<DashboardProps>().props;

    const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});

    // Safe fallback values
    const safePopularProducts = popularProducts || [];
    const safeCartItems = cartItems || [];
    const safeRecentOrders = recentOrders || [];
    const safeStats = stats || {
        totalProducts: 0,
        cartItemsCount: 0,
        cartTotalValue: 0,
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0
    };

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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                            🌾 Selamat Datang di Fresh Market
                        </h1>
                        <p className="text-amber-700 mt-2">
                            Temukan produk grocery segar dan berkualitas untuk kebutuhan harian Anda
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="bg-white/70 backdrop-blur-md rounded-xl px-4 py-2 border border-amber-200">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-amber-800">Toko Buka</span>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Fresh Market - Dashboard" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* DITAMBAHKAN: Quick Shopping Actions */}
                <div className="mb-12">
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-amber-200 shadow-lg">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-amber-900 mb-2">Mulai Berbelanja</h2>
                            <p className="text-amber-700">Akses cepat untuk kebutuhan belanja Anda</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Link
                                href="/products"
                                className="group flex flex-col items-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            >
                                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-3xl">🛒</span>
                                </div>
                                <h3 className="text-lg font-bold text-emerald-800 mb-2">Jelajahi Produk</h3>
                                <p className="text-sm text-emerald-600 text-center">Temukan produk grocery segar dan berkualitas</p>
                            </Link>

                            <Link
                                href="/cart"
                                className="group flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            >
                                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative">
                                    <span className="text-3xl">🛍️</span>
                                    {safeStats.cartItemsCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                                            {safeStats.cartItemsCount}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-blue-800 mb-2">Keranjang Saya</h3>
                                <p className="text-sm text-blue-600 text-center">
                                    {safeStats.cartItemsCount > 0
                                        ? `${safeStats.cartItemsCount} item • ${formatCurrency(safeStats.cartTotalValue)}`
                                        : 'Keranjang masih kosong'
                                    }
                                </p>
                            </Link>

                            <Link
                                href="/orders"
                                className="group flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            >
                                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative">
                                    <span className="text-3xl">📦</span>
                                    {safeStats.pendingOrders > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                                            {safeStats.pendingOrders}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-purple-800 mb-2">Pesanan Saya</h3>
                                <p className="text-sm text-purple-600 text-center">
                                    {safeStats.pendingOrders > 0
                                        ? `${safeStats.pendingOrders} pesanan dalam proses`
                                        : 'Lihat riwayat pesanan'
                                    }
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* DITAMBAHKAN: Shopping Summary Banner */}
                {(safeStats.cartItemsCount > 0 || safeStats.pendingOrders > 0) && (
                    <div className="mb-12">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">🎯 Status Belanja Anda</h3>
                                    <div className="flex items-center space-x-6">
                                        {safeStats.cartItemsCount > 0 && (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg">🛍️</span>
                                                <span className="font-medium">{safeStats.cartItemsCount} item di keranjang</span>
                                            </div>
                                        )}
                                        {safeStats.pendingOrders > 0 && (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg">📦</span>
                                                <span className="font-medium">{safeStats.pendingOrders} pesanan diproses</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    {safeStats.cartItemsCount > 0 && (
                                        <Link
                                            href="/checkout"
                                            className="bg-white text-amber-600 px-6 py-3 rounded-lg font-bold hover:bg-amber-50 transition-colors duration-300 hover:scale-105 transform"
                                        >
                                            Checkout Sekarang
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-16">
                    {/* Produk Grocery Terlaris - ENHANCED */}
                    <section
                        id="popular-products"
                        data-animate
                        className={`transition-all duration-1000 ${isVisible['popular-products']
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-8'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                                    🔥 Produk Terlaris Minggu Ini
                                </h2>
                                <p className="text-amber-600 mt-2">Produk pilihan yang paling disukai pelanggan</p>
                            </div>
                            <Link
                                href="/products"
                                className="group flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <span className="font-medium">Lihat Semua Produk</span>
                                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {safePopularProducts.length > 0 ? (
                                safePopularProducts.slice(0, 6).map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="group bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden border border-amber-200 hover:border-amber-400 transition-all duration-500 hover:shadow-xl transform hover:-translate-y-2"
                                        style={{
                                            animationDelay: `${index * 150}ms`
                                        }}
                                    >
                                        <Link href={`/products/${product.id}`}>
                                            <div className="aspect-[4/3] bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center relative overflow-hidden">
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="text-center">
                                                        <div className="text-6xl mb-3 group-hover:scale-110 transition-transform duration-500">{product.emoji}</div>
                                                        <span className="text-amber-700 font-bold text-sm bg-white/80 px-3 py-1 rounded-full">{product.category}</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                                                    🔥 #{index + 1}
                                                </div>
                                                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-xs px-3 py-1 rounded-full font-medium text-gray-700 shadow-lg">
                                                    {product.category}
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h3 className="font-bold text-amber-900 mb-2 text-lg group-hover:text-amber-700 transition-colors line-clamp-2">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-amber-700 font-bold text-xl">
                                                        {formatCurrency(product.price)}
                                                    </p>
                                                    <span className="text-sm text-gray-500">/{product.unit}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                                                        ⭐ Terjual {product.sold_count}
                                                    </p>
                                                    <button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg">
                                                        + Keranjang
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-12 text-amber-600">
                                    <div className="animate-pulse">
                                        <span className="text-8xl mb-6 block">🛒</span>
                                        <p className="text-xl font-medium">Produk terlaris akan muncul di sini</p>
                                        <p className="text-amber-500 mt-2">Jelajahi produk kami untuk menemukan favorit Anda</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Keranjang Grocery - ENHANCED */}
                    <section
                        id="cart-preview"
                        data-animate
                        className={`transition-all duration-1000 delay-200 ${isVisible['cart-preview']
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-8'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                                    🛍️ Keranjang Belanja Anda
                                </h2>
                                <p className="text-amber-600 mt-2">Item yang siap untuk checkout</p>
                            </div>
                            <Link
                                href="/cart"
                                className="group flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <span className="font-medium">Kelola Keranjang ({safeStats.cartItemsCount})</span>
                                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {safeCartItems.length > 0 ? (
                                safeCartItems.slice(0, 6).map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                                        style={{
                                            animationDelay: `${index * 150}ms`
                                        }}
                                    >
                                        <Link href={`/products/${item.product?.id}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                                                    {item.product?.image ? (
                                                        <img
                                                            src={item.product.image}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-3xl">{item.product?.emoji}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-amber-900 text-base mb-1 line-clamp-2">
                                                        {item.product?.name}
                                                    </h3>
                                                    <p className="text-amber-700 font-semibold text-sm mb-2">
                                                        {formatCurrency(item.product?.price || 0)}/{item.product?.unit}
                                                    </p>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                                                            Qty: {item.quantity}
                                                        </span>
                                                        <span className="text-sm text-amber-600 font-bold">
                                                            {formatCurrency((item.product?.price || 0) * item.quantity)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                                                        {item.product?.category}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-12 text-amber-600">
                                    <div className="animate-bounce">
                                        <span className="text-8xl mb-6 block">🛍️</span>
                                        <p className="text-xl font-medium mb-4">Keranjang belanja Anda masih kosong</p>
                                        <Link
                                            href="/products"
                                            className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                                        >
                                            🛒 Mulai Belanja Sekarang
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                        {safeCartItems.length > 0 && (
                            <div className="mt-8 text-center">
                                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border-2 border-emerald-200 inline-block shadow-lg">
                                    <p className="text-2xl font-bold text-emerald-800 mb-2">
                                        Total Keranjang: <span className="text-emerald-600">
                                            {formatCurrency(safeStats.cartTotalValue)}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {safeStats.cartItemsCount} item siap untuk checkout
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        <Link
                                            href="/cart"
                                            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-300"
                                        >
                                            Edit Keranjang
                                        </Link>
                                        <Link
                                            href="/checkout"
                                            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                                        >
                                            🚀 Checkout Sekarang
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Pesanan Terakhir - ENHANCED */}
                    <section
                        id="recent-orders"
                        data-animate
                        className={`transition-all duration-1000 delay-400 ${isVisible['recent-orders']
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-8'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                                    📦 Pesanan Terakhir
                                </h2>
                                <p className="text-amber-600 mt-2">Lacak status pesanan Anda</p>
                            </div>
                            <Link
                                href="/orders"
                                className="group flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <span className="font-medium">Lihat Semua Pesanan</span>
                                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {safeRecentOrders.length > 0 ? (
                                safeRecentOrders.slice(0, 6).map((order, index) => (
                                    <div
                                        key={order.id}
                                        className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                                        style={{
                                            animationDelay: `${index * 150}ms`
                                        }}
                                    >
                                        <Link href={`/orders/${order.id}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-bold text-amber-900 text-base mb-1">
                                                        {order.order_number}
                                                    </h3>
                                                    <p className="text-sm text-amber-600">
                                                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            <div className="space-y-3 max-h-24 overflow-y-auto mb-4">
                                                {order.items?.slice(0, 2).map((orderItem, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                                                        <span className="text-xl">{orderItem.product?.emoji}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-sm text-amber-800 font-medium line-clamp-1">
                                                                {orderItem.product?.name}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                x{orderItem.quantity} • {orderItem.product?.category}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {order.items_count > 2 && (
                                                    <p className="text-sm text-amber-600 text-center bg-amber-50 py-2 rounded-lg">
                                                        +{order.items_count - 2} item lainnya
                                                    </p>
                                                )}
                                            </div>
                                            <div className="pt-4 border-t border-amber-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="text-lg font-bold text-amber-700">
                                                        {formatCurrency(order.total_amount)}
                                                    </p>
                                                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                        {order.items_count} item
                                                    </span>
                                                </div>
                                                {order.shipping_address && (
                                                    <p className="text-xs text-gray-500 line-clamp-1 bg-gray-50 p-2 rounded-lg">
                                                        📍 {order.shipping_address}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-12 text-amber-600">
                                    <div className="animate-pulse">
                                        <span className="text-8xl mb-6 block">📦</span>
                                        <p className="text-xl font-medium mb-4">Belum ada pesanan</p>
                                        <Link
                                            href="/products"
                                            className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                                        >
                                            🛒 Mulai Berbelanja
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </BuyerAuthenticatedLayout>
    );
}
