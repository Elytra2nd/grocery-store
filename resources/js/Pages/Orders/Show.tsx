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
        description: string;
        image?: string;
        category: string;
        price: number;
        stock: number;
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

interface OrderShowProps {
    order: Order;
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
}

export default function OrderShow({ order, auth }: OrderShowProps): JSX.Element {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isModalAnimating, setIsModalAnimating] = useState(false);

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
                return 'text-amber-700 bg-amber-100 border-amber-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'processing':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            case 'shipped':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                );
            case 'delivered':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'cancelled':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
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

    const getOrderProgress = (status: string) => {
        const steps = ['pending', 'processing', 'shipped', 'delivered'];
        const currentIndex = steps.indexOf(status);

        if (status === 'cancelled') {
            return { current: -1, total: steps.length };
        }

        return { current: currentIndex, total: steps.length };
    };

    const progress = getOrderProgress(order.status);

    // Modal handlers
    const openDeleteModal = () => {
        setIsDeleteModalOpen(true);
        setTimeout(() => setIsModalAnimating(true), 10);
    };

    const closeDeleteModal = () => {
        setIsModalAnimating(false);
        setTimeout(() => setIsDeleteModalOpen(false), 300);
    };

    // Handler aksi tombol
    const handleCancelOrder = () => {
        openDeleteModal();
    };

    const confirmDeleteItem = async () => {
        setIsLoading(true);
        try {
            await router.patch(`/orders/${order.id}/cancel`);
            closeDeleteModal();
        } catch (error) {
            console.error('Error cancelling order:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReorder = () => {
        alert('Fitur pesan ulang belum diimplementasikan.');
        // router.post(`/orders/${order.id}/reorder`);
    };

    const handleReview = () => {
        alert('Fitur ulasan belum diimplementasikan.');
        // router.visit(`/orders/${order.id}/review`);
    };

    return (
        <BuyerAuthenticatedLayout>
            <Head title={`Order ${order.order_number}`} />
            <div className="py-12 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-screen">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    {/* Back Navigation */}
                    <div className="flex items-center space-x-4 mb-6">
                        <Link
                            href="/orders"
                            className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-100 hover:from-amber-200 hover:via-orange-200 hover:to-yellow-200 border-2 border-amber-300 hover:border-amber-400 text-amber-700 hover:text-amber-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                        >
                            <svg className="w-5 h-5 mr-3 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="font-semibold">Kembali ke Riwayat Pesanan</span>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </Link>
                    </div>

                    {/* Order Summary Card */}
                    <div className="overflow-hidden bg-white/90 backdrop-blur-md shadow-xl border-2 border-amber-200 sm:rounded-xl">
                        <div className="p-6 sm:p-8">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">
                                        {order.order_number}
                                    </h1>
                                    <p className="text-amber-700">
                                        Pesanan dibuat pada {formatDate(order.created_at)}
                                    </p>
                                </div>
                                <div className="flex flex-col items-start lg:items-end space-y-2">
                                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        <span>{order.status_label}</span>
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-bold text-amber-800">
                                        {formatCurrency(order.total_amount)}
                                    </div>
                                </div>
                            </div>

                            {/* Order Progress */}
                            {order.status !== 'cancelled' && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-amber-900 mb-4">Status Pesanan</h3>
                                    <div className="flex items-center justify-between">
                                        {[
                                            { key: 'pending', label: 'Menunggu' },
                                            { key: 'processing', label: 'Diproses' },
                                            { key: 'shipped', label: 'Dikirim' },
                                            { key: 'delivered', label: 'Diterima' }
                                        ].map((step, index) => (
                                            <div key={step.key} className="flex flex-col items-center flex-1 relative">
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-white ${index <= progress.current
                                                        ? 'border-amber-500 text-amber-600'
                                                        : 'border-amber-300 text-amber-400'
                                                    }`}>
                                                    {index <= progress.current ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <span className="text-xs font-medium">{index + 1}</span>
                                                    )}
                                                </div>
                                                <span className={`text-xs mt-2 text-center ${index <= progress.current ? 'text-amber-600 font-medium' : 'text-amber-500'
                                                    }`}>
                                                    {step.label}
                                                </span>
                                                {index < 3 && (
                                                    <div className={`absolute top-4 left-1/2 w-full h-0.5 ${index < progress.current ? 'bg-amber-500' : 'bg-amber-300'
                                                        }`} style={{ transform: 'translateX(50%)' }} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Shipping Information */}
                            <div className="border-t border-amber-200 pt-6">
                                <h3 className="text-lg font-semibold text-amber-900 mb-3">Informasi Pengiriman</h3>
                                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                    <div className="flex items-start space-x-3">
                                        <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-amber-900 font-medium">Alamat Pengiriman</p>
                                            <p className="text-amber-700 mt-1">{order.shipping_address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="overflow-hidden bg-white/90 backdrop-blur-md shadow-xl border-2 border-amber-200 sm:rounded-xl">
                        <div className="p-6 sm:p-8">
                            <h3 className="text-xl font-bold text-amber-900 mb-6">
                                Item Pesanan ({order.order_items.length})
                            </h3>
                            <div className="space-y-6">
                                {order.order_items.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors duration-200 border border-amber-200">
                                        {/* Product Image */}
                                        <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg border-2 border-amber-200">
                                            {item.product.image ? (
                                                <img
                                                    src={`/storage/${item.product.image}`}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                                                    <span className="text-white text-sm font-bold">Fresh</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-grow min-w-0">
                                            <Link
                                                href={`/products/${item.product.id}`}
                                                className="block group"
                                            >
                                                <h4 className="text-amber-900 font-semibold group-hover:text-amber-600 transition-colors truncate">
                                                    {item.product.name}
                                                </h4>
                                            </Link>
                                            <p className="text-sm text-amber-600 mt-1">
                                                {item.product.category}
                                            </p>
                                            <p className="text-sm text-amber-700 mt-2 line-clamp-2">
                                                {item.product.description}
                                            </p>
                                            <div className="flex items-center space-x-4 mt-3">
                                                <span className="text-sm text-amber-700">
                                                    <span className="font-medium">Jumlah:</span> {item.quantity}
                                                </span>
                                                <span className="text-sm text-amber-700">
                                                    <span className="font-medium">Harga:</span> {formatCurrency(item.price)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Item Total */}
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-amber-900">
                                                {formatCurrency(item.quantity * item.price)}
                                            </div>
                                            <div className="text-sm text-amber-600">
                                                {item.quantity} × {formatCurrency(item.price)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="border-t border-amber-200 mt-8 pt-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-amber-700">
                                        <span>Subtotal ({order.order_items.length} item)</span>
                                        <span>{formatCurrency(order.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-amber-700">
                                        <span>Ongkos Kirim</span>
                                        <span className="text-green-600">Gratis</span>
                                    </div>
                                    <div className="border-t border-amber-200 pt-3">
                                        <div className="flex justify-between items-center text-xl font-bold">
                                            <span className="text-amber-900">Total</span>
                                            <span className="text-amber-800">{formatCurrency(order.total_amount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Actions */}
                    <div className="overflow-hidden bg-white/90 backdrop-blur-md shadow-xl border-2 border-amber-200 sm:rounded-xl">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                                <div className="text-sm text-amber-700">
                                    Butuh bantuan dengan pesanan Anda? Hubungi tim dukungan kami.
                                </div>
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                                    {order.status === 'delivered' && (
                                        <button
                                            onClick={handleReview}
                                            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                        >
                                            Berikan Ulasan
                                        </button>
                                    )}
                                    {order.status === 'delivered' && (
                                        <button
                                            onClick={handleReorder}
                                            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                        >
                                            Pesan Lagi
                                        </button>
                                    )}
                                    {(order.status === 'pending' || order.status === 'processing') && (
                                        <button
                                            onClick={handleCancelOrder}
                                            className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                        >
                                            Batalkan Pesanan
                                        </button>
                                    )}
                                    <button className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                        Hubungi Dukungan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-amber-200 transition-all duration-500 ${isModalAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}>
                        <div className="p-6 text-center">
                            <div className={`mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 transition-all duration-500 delay-100 ${isModalAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                }`}>
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>

                            <h3 className={`text-xl font-bold text-amber-900 mb-2 transition-all duration-500 delay-150 ${isModalAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                }`}>
                                Konfirmasi Pembatalan
                            </h3>

                            <p className={`text-amber-700 mb-6 transition-all duration-500 delay-150 ${isModalAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                }`}>
                                Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.
                            </p>

                            <div className={`flex space-x-3 transition-all duration-500 delay-200 ${isModalAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                }`}>
                                <button
                                    onClick={closeDeleteModal}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 bg-amber-100 border-2 border-amber-300 text-amber-800 rounded-xl hover:bg-amber-200 hover:text-amber-900 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDeleteItem}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 bg-red-100 border-2 border-red-300 text-red-700 rounded-xl hover:bg-red-200 hover:text-red-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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
                                        'Ya, Hapus'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </BuyerAuthenticatedLayout>
    );
}
