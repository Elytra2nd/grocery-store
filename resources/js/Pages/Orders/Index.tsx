import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import BuyerAuthenticatedLayout from '@/Layouts/BuyerAuthenticatedLayout';

interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
    product: {
        id: number;
        name: string;
        image?: string;
        category: string;
    };
}

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    status_label: string;
    shipping_address: string;
    created_at: string;
    updated_at: string;
    order_items: OrderItem[];
}

interface OrderHistoryProps {
    orders: Order[];
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    flash?: {
        message?: string;
        success?: string;
        error?: string;
    };
}

export default function OrderHistory({ orders, auth, flash }: OrderHistoryProps): JSX.Element {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_at-desc');

    // Status options
    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Menunggu' },
        { value: 'processing', label: 'Diproses' },
        { value: 'shipped', label: 'Dikirim' },
        { value: 'delivered', label: 'Diterima' },
        { value: 'cancelled', label: 'Dibatalkan' },
    ];

    // Filter and sort orders
    const filteredOrders = orders
        .filter(order => {
            const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.order_items.some(item =>
                    item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            const matchesStatus = !statusFilter || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            const [field, direction] = sortBy.split('-');
            let aValue, bValue;

            switch (field) {
                case 'created_at':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                case 'total_amount':
                    aValue = a.total_amount;
                    bValue = b.total_amount;
                    break;
                case 'order_number':
                    aValue = a.order_number;
                    bValue = b.order_number;
                    break;
                default:
                    return 0;
            }

            if (direction === 'desc') {
                return bValue > aValue ? 1 : -1;
            }
            return aValue > bValue ? 1 : -1;
        });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-amber-700 bg-amber-100 border-amber-200';
            case 'processing':
                return 'text-blue-700 bg-blue-100 border-blue-200';
            case 'shipped':
                return 'text-purple-700 bg-purple-100 border-purple-200';
            case 'delivered':
                return 'text-green-700 bg-green-100 border-green-200';
            case 'cancelled':
                return 'text-red-700 bg-red-100 border-red-200';
            default:
                return 'text-gray-700 bg-gray-100 border-gray-200';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // ACTION HANDLERS

    // Lihat detail pesanan
    const handleShowOrder = (orderId: number) => {
        // Jika pakai Ziggy:
        // router.visit(route('orders.show', { order: orderId }));
        // Jika tidak pakai Ziggy:
        router.visit(`/orders/${orderId}`);
    };

    // Batalkan pesanan
    const handleCancelOrder = (orderId: number) => {
        if (confirm('Yakin ingin membatalkan pesanan ini?')) {
            // Jika pakai Ziggy:
            // router.patch(route('orders.cancel', { order: orderId }), {});
            // Jika tidak pakai Ziggy:
            router.patch(`/orders/${orderId}/cancel`, {});
        }
    };

    // Pesan ulang
    const handleReorder = (orderId: number) => {
        alert('Fitur pesan ulang belum diimplementasikan.');
    };

    return (
        <BuyerAuthenticatedLayout
        >
            <Head title="Order History" />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
                {/* Flash Messages */}
                {flash?.message && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
                        {flash.message}
                    </div>
                )}
                {flash?.success && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        {flash.error}
                    </div>
                )}

                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        {/* Welcome Section */}
                        <div className="mb-8 overflow-hidden bg-white/90 backdrop-blur-md shadow-xl shadow-amber-500/10 sm:rounded-xl border border-amber-200">
                            <div className="p-8 text-amber-900">
                                <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent drop-shadow-md">
                                    Riwayat Pesanan Anda
                                </h1>
                                <p className="text-center mt-4 text-amber-700 text-lg">
                                    Lacak pesanan dan riwayat pembelian Anda di Fresh Market
                                </p>
                            </div>
                        </div>

                        {/* Search and Filter Section */}
                        <div className="mb-6 overflow-hidden bg-white/90 backdrop-blur-md shadow-xl shadow-amber-500/10 sm:rounded-xl border border-amber-200">
                            <div className="p-6">
                                {/* Search Bar */}
                                <div className="mb-6">
                                    <label htmlFor="search" className="block text-sm font-medium text-amber-800 mb-2">
                                        Cari Pesanan
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="search"
                                            type="text"
                                            placeholder="Cari berdasarkan nomor pesanan atau nama produk..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-amber-300 rounded-xl focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                                        />
                                        <svg
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Filter Panel */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-amber-800 mb-2">Status</label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full border border-amber-300 rounded-xl px-3 py-3 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                                        >
                                            {statusOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Sort By */}
                                    <div>
                                        <label className="block text-sm font-medium text-amber-800 mb-2">Urutkan</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full border border-amber-300 rounded-xl px-3 py-3 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                                        >
                                            <option value="created_at-desc">Terbaru</option>
                                            <option value="created_at-asc">Terlama</option>
                                            <option value="total_amount-desc">Nilai Tertinggi</option>
                                            <option value="total_amount-asc">Nilai Terendah</option>
                                            <option value="order_number-asc">Nomor Pesanan A-Z</option>
                                            <option value="order_number-desc">Nomor Pesanan Z-A</option>
                                        </select>
                                    </div>

                                    {/* Clear Filters */}
                                    <div className="flex items-end">
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setStatusFilter('');
                                                setSortBy('created_at-desc');
                                            }}
                                            className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        >
                                            Reset Filter
                                        </button>
                                    </div>
                                </div>

                                {/* Results count */}
                                {filteredOrders.length > 0 && (
                                    <div className="text-sm text-amber-700 mb-4 bg-amber-100 px-4 py-2 rounded-lg border border-amber-200">
                                        Menampilkan {filteredOrders.length} dari {orders.length} pesanan
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Orders List */}
                        <div className="space-y-6">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="overflow-hidden bg-white/90 backdrop-blur-md shadow-xl shadow-amber-500/10 sm:rounded-xl hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 transform hover:-translate-y-1 border border-amber-200"
                                >
                                    {/* Order Header */}
                                    <div className="p-6 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                                <h3 className="text-lg font-bold text-amber-900">
                                                    {order.order_number}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}
                                                >
                                                    {order.status_label}
                                                </span>
                                            </div>
                                            <div className="flex flex-col sm:items-end space-y-1">
                                                <span className="text-xl font-bold text-amber-800">
                                                    {formatCurrency(order.total_amount)}
                                                </span>
                                                <span className="text-sm text-amber-600">
                                                    {formatDate(order.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <p className="text-sm text-amber-700">
                                                <span className="font-medium">Alamat Pengiriman:</span> {order.shipping_address}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {order.order_items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-amber-50/80 to-orange-50/80 rounded-xl border border-amber-200"
                                                >
                                                    {/* Product Image */}
                                                    <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-xl shadow-lg">
                                                        {item.product.image ? (
                                                            <img
                                                                src={`/storage/${item.product.image}`}
                                                                alt={item.product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                                                <span className="text-white text-xs font-bold">FRESH</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-grow min-w-0">
                                                        <h4 className="text-amber-900 font-medium truncate">
                                                            {item.product.name}
                                                        </h4>
                                                        <p className="text-sm text-amber-600">
                                                            {item.product.category}
                                                        </p>
                                                        <div className="flex items-center space-x-4 mt-1">
                                                            <span className="text-sm text-amber-700">
                                                                Jumlah: {item.quantity}
                                                            </span>
                                                            <span className="text-sm text-amber-700">
                                                                {formatCurrency(item.price)} per item
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Item Subtotal */}
                                                    <div className="text-right">
                                                        <span className="text-amber-900 font-medium">
                                                            {formatCurrency(item.quantity * item.price)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Order Actions */}
                                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                                            <div className="text-sm text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                                                {order.order_items.length} item{order.order_items.length !== 1 ? '' : ''}
                                            </div>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleShowOrder(order.id)}
                                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                >
                                                    Lihat Detail
                                                </button>
                                                {order.status === 'delivered' && (
                                                    <button
                                                        onClick={() => handleReorder(order.id)}
                                                        className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                    >
                                                        Pesan Lagi
                                                    </button>
                                                )}
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                    >
                                                        Batalkan
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Empty State */}
                            {filteredOrders.length === 0 && (
                                <div className="overflow-hidden bg-white/90 backdrop-blur-md shadow-xl shadow-amber-500/10 sm:rounded-xl border border-amber-200">
                                    <div className="p-12 text-center">
                                        <div className="text-6xl sm:text-8xl mb-6">🛒</div>
                                        <h3 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-4">
                                            {orders.length === 0 ? 'Belum Ada Pesanan' : 'Pesanan Tidak Ditemukan'}
                                        </h3>
                                        <p className="text-amber-700 mb-8 text-lg">
                                            {orders.length === 0
                                                ? "Mulai berbelanja untuk melihat riwayat pesanan Anda di sini."
                                                : searchTerm || statusFilter
                                                    ? `Tidak ada pesanan yang sesuai dengan filter yang dipilih.`
                                                    : 'Riwayat pesanan Anda akan muncul di sini.'}
                                        </p>
                                        {orders.length === 0 && (
                                            <Link
                                                href="/products"
                                                className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                            >
                                                Jelajahi Produk
                                            </Link>
                                        )}
                                        {orders.length > 0 && (searchTerm || statusFilter) && (
                                            <button
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setStatusFilter('');
                                                }}
                                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                            >
                                                Reset Filter
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </BuyerAuthenticatedLayout>
    );
}
