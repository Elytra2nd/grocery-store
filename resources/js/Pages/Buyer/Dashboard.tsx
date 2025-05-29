import BuyerAuthenticatedLayout from '@/Layouts/BuyerAuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Product = {
    id: number;
    name: string;
    price: number;
    unit?: string;
    image?: string;
    emoji?: string;
    sold_count?: number;
};

type CartItem = {
    id: number;
    product?: Product;
    quantity: number;
};

type OrderItem = {
    product?: Product;
    quantity: number;
};

type Order = {
    id: number;
    order_number?: string;
    created_at: string;
    status: string;
    items?: OrderItem[];
    total_amount?: number;
};

type Stats = {
    totalProducts?: number;
    cartCount?: number;
    orderCount?: number;
};

interface DashboardProps {
    popularProducts?: Product[];
    cartItems?: CartItem[];
    recentOrders?: Order[];
    stats?: Stats;
}

export default function Dashboard({
    popularProducts = [],
    cartItems = [],
    recentOrders = [],
    stats = { totalProducts: 0, cartCount: 0, orderCount: 0 }
}: DashboardProps) {
    const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(prev => ({
                            ...prev,
                            [entry.target.id]: true
                        }));
                    }
                });
            },
            { threshold: 0.1 }
        );

        // Observe all animated sections
        const sections = document.querySelectorAll('[data-animate]');
        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    type StatusKey = 'completed' | 'shipped' | 'processing' | 'pending';
    const getStatusBadge = (status: string) => {
        const statusConfig: Record<StatusKey, { bg: string; text: string; label: string }> = {
            'completed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Selesai' },
            'shipped': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Dikirim' },
            'processing': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Proses' },
            'pending': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Menunggu' }
        };

        const key = (status in statusConfig ? status : 'pending') as StatusKey;
        const config = statusConfig[key];
        return (
            <span className={`text-xs ${config.bg} ${config.text} px-2 py-1 rounded-full font-medium`}>
                {config.label}
            </span>
        );
    };

    return (
        <BuyerAuthenticatedLayout
        >
            <Head title="Buyer Dashboard" />
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        {/* Welcome Section with fade-in animation */}
                        <div
                            className="overflow-hidden bg-white/90 backdrop-blur-md shadow-xl sm:rounded-3xl border-2 border-amber-200 mb-8 opacity-0 translate-y-8 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]"
                        >
                            <div className="p-8 text-center">
                                <div className="mb-6">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4 shadow-lg animate-bounce">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4 drop-shadow">
                                    Selamat Datang di Fresh Market!
                                </h1>
                            </div>
                        </div>

                        {/* Quick Actions with staggered animation */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {[
                                { href: "/products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", title: "Jelajahi Produk", desc: "Temukan produk segar terbaik untuk kebutuhan Anda", action: "Lihat Semua", gradient: "from-green-400 to-green-600", delay: "0.4s" },
                                { href: "/cart", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L17 18M7 13v4a2 2 0 002 2h6a2 2 0 002-2v-4", title: "Keranjang Belanja", desc: "Kelola item yang sudah Anda pilih untuk dibeli", action: "Buka Keranjang", gradient: "from-blue-400 to-blue-600", delay: "0.6s" },
                                { href: "/orders", icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01", title: "Pesanan Saya", desc: "Pantau status dan riwayat pesanan Anda", action: "Lihat Pesanan", gradient: "from-purple-400 to-purple-600", delay: "0.8s" }
                            ].map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={`group bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20 transform hover:-translate-y-2 opacity-0 translate-y-8 animate-[fadeInUp_0.8s_ease-out_${item.delay}_forwards]`}
                                >
                                    <div className="text-center">
                                        <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-amber-900 mb-2 group-hover:text-amber-700 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-amber-700 text-sm">
                                            {item.desc}
                                        </p>
                                        <div className="mt-4 inline-flex items-center text-amber-600 font-medium group-hover:text-amber-700">
                                            <span>{item.action}</span>
                                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Preview Sections */}
                        <div className="space-y-12">
                            {/* Produk Terlaris */}
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
                                        🔥 Produk Terlaris
                                    </h2>
                                    <Link
                                        href="/products"
                                        className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                                    >
                                        Lihat Semua
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {popularProducts.length > 0 ? (
                                        popularProducts.slice(0, 3).map((product, index) => (
                                            <div
                                                key={product.id}
                                                className={`group bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border-2 border-amber-200 hover:border-amber-400 transition-all duration-500 hover:shadow-lg transform hover:-translate-y-1 opacity-0 translate-y-4 animate-[fadeInUp_0.6s_ease-out_${0.2 + index * 0.1}s_forwards]`}
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
                                                            <div className="text-4xl mb-2">{product.emoji || '🥕'}</div>
                                                            <span className="text-amber-700 font-bold">{product.name}</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                                                        #{index + 1}
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-bold text-amber-900 mb-1 group-hover:text-amber-700 transition-colors">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-amber-700 font-semibold">
                                                        {formatCurrency(product.price)}/{product.unit || 'kg'}
                                                    </p>
                                                    <p className="text-xs text-amber-600 mt-1">
                                                        Terjual {product.sold_count || 0} {product.unit || 'kg'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-3 text-center py-8 text-amber-600">
                                            <div className="animate-pulse">
                                                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                                <p>Belum ada produk terlaris</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Keranjang Belanja */}
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
                                        🛒 Keranjang Belanja
                                    </h2>
                                    <Link
                                        href="/cart"
                                        className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                                    >
                                        Lihat Keranjang
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {cartItems.length > 0 ? (
                                        cartItems.slice(0, 3).map((item, index) => (
                                            <div
                                                key={item.id}
                                                className={`bg-white/90 backdrop-blur-md rounded-xl p-4 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 opacity-0 translate-x-4 animate-[slideInRight_0.6s_ease-out_${0.1 + index * 0.1}s_forwards]`}
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
                                                            <span className="text-2xl">{item.product?.emoji || '🥕'}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-amber-900 text-sm truncate">
                                                            {item.product?.name || 'Produk'}
                                                        </h3>
                                                        <p className="text-amber-700 font-semibold text-sm">
                                                            {formatCurrency(item.product?.price || 0)}/{item.product?.unit || 'kg'}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                                Qty: {item.quantity}
                                                            </span>
                                                            <span className="text-xs text-amber-600">
                                                                Total: {formatCurrency((item.product?.price || 0) * item.quantity)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-3 text-center py-8 text-amber-600">
                                            <div className="animate-bounce">
                                                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L17 18M7 13v4a2 2 0 002 2h6a2 2 0 002-2v-4" />
                                                </svg>
                                                <p>Keranjang masih kosong</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {cartItems.length > 0 && (
                                    <div className="mt-4 text-right animate-pulse">
                                        <p className="text-lg font-bold text-amber-800">
                                            Total Keranjang: <span className="text-amber-600">
                                                {formatCurrency(cartItems.reduce((total, item) => total + ((item.product?.price || 0) * item.quantity), 0))}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Pesanan Terakhir */}
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
                                        📦 Pesanan Terakhir
                                    </h2>
                                    <Link
                                        href="/orders"
                                        className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                                    >
                                        Lihat Semua
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {recentOrders.length > 0 ? (
                                        recentOrders.slice(0, 3).map((order, index) => (
                                            <div
                                                key={order.id}
                                                className={`bg-white/90 backdrop-blur-md rounded-xl p-4 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 opacity-0 translate-x-[-16px] animate-[slideInLeft_0.6s_ease-out_${0.1 + index * 0.1}s_forwards]`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-bold text-amber-900 text-sm">
                                                            #{order.order_number || `ORD-${String(order.id).padStart(3, '0')}`}
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
                                                            <span className="text-lg">{orderItem.product?.emoji || '🥕'}</span>
                                                            <span className="text-sm text-amber-800 truncate">
                                                                {orderItem.product?.name || 'Produk'} x{orderItem.quantity}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {(order.items?.length ?? 0) > 2 && (
                                                        <p className="text-xs text-amber-600">
                                                            +{(order.items?.length ?? 0) - 2} item lainnya
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-amber-200">
                                                    <p className="text-sm font-bold text-amber-700">
                                                        Total: {formatCurrency(order.total_amount || 0)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-3 text-center py-8 text-amber-600">
                                            <div className="animate-spin-slow">
                                                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <p>Belum ada pesanan</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Stats Cards with enhanced animations */}
                        <div
                            id="stats-cards"
                            data-animate
                            className={`grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 transition-all duration-1000 delay-600 ${isVisible['stats-cards']
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-8'
                                }`}
                        >
                            {[
                                {
                                    title: "Total Produk",
                                    value: stats.totalProducts?.toLocaleString('id-ID') || "0",
                                    gradient: "from-green-400 to-green-600",
                                    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
                                    color: "green"
                                },
                                {
                                    title: "Item di Keranjang",
                                    value: stats.cartCount || "0",
                                    gradient: "from-blue-400 to-blue-600",
                                    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L17 18M7 13v4a2 2 0 002 2h6a2 2 0 002-2v-4",
                                    color: "blue"
                                },
                                {
                                    title: "Total Pesanan",
                                    value: stats.orderCount || "0",
                                    gradient: "from-purple-400 to-purple-600",
                                    icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                                    color: "purple"
                                }
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    className={`bg-gradient-to-r ${stat.gradient} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group opacity-0 translate-y-4 animate-[fadeInUp_0.6s_ease-out_${0.7 + index * 0.1}s_forwards]`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`text-${stat.color}-100 text-sm font-medium`}>{stat.title}</p>
                                            <p className="text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div className="bg-white/20 rounded-full p-3 group-hover:rotate-12 transition-transform duration-300">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(32px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(32px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-32px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
            `}</style>
        </BuyerAuthenticatedLayout>
    );
}
