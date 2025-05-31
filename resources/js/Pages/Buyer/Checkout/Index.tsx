import React, { useState, FormEvent } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import BuyerAuthenticatedLayout from '@/Layouts/BuyerAuthenticatedLayout';

interface CartItem {
    id: number;
    quantity: number;
    product: {
        id: number;
        name: string;
        price: number;
        image?: string;
        stock: number;
        category?: {
            id: number;
            name: string;
        };
    };
    subtotal: number;
}

interface CheckoutProps {
    cartItems: CartItem[];
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        address?: string;
    };
    buyNowMode?: boolean;
    hasSavedCart?: boolean;
    cartItemIds: number[];
}

type CheckoutFormData = {
    shipping_address: string;
    payment_method: string;
    notes: string;
    cart_items: number[];
};

export default function CheckoutIndex({
    cartItems,
    subtotal,
    shippingCost,
    tax,
    total,
    user,
    buyNowMode = false,
    hasSavedCart = false,
    cartItemIds
}: CheckoutProps): JSX.Element {
    const { data, setData, post, processing, errors } = useForm<CheckoutFormData>({
        shipping_address: user.address || '',
        payment_method: 'bank_transfer',
        notes: '',
        cart_items: cartItemIds || cartItems.map(item => item.id),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // DIPERBAIKI: Handle image error untuk fallback ke icon
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.currentTarget;
        const parent = target.parentElement;

        target.style.display = 'none';

        if (parent) {
            const fallbackElement = parent.querySelector('.image-fallback');
            if (fallbackElement) {
                (fallbackElement as HTMLElement).style.display = 'flex';
            }
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        post('/buyer/checkout', {
            onFinish: () => setIsSubmitting(false),
            onError: () => setIsSubmitting(false),
        });
    };

    // DITAMBAHKAN: Handle cancel checkout untuk buy now mode
    const handleCancelCheckout = () => {
        if (buyNowMode && hasSavedCart) {
            // Redirect ke cancel endpoint yang akan restore cart
            window.location.href = '/buyer/checkout/cancel';
        } else {
            window.history.back();
        }
    };

    return (
        <BuyerAuthenticatedLayout>
            <Head title="Checkout - Fresh Market" />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
                {/* Background Pattern */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
                </div>

                {/* Floating Animation Elements */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-20 left-10 w-2 h-2 bg-amber-400/40 rounded-full animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-1 h-1 bg-orange-400/50 rounded-full animate-ping"></div>
                    <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-yellow-400/30 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-amber-300/40 rounded-full animate-ping"></div>
                </div>

                <div className="relative z-10 py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-600 bg-clip-text text-transparent mb-4">
                                Checkout Pesanan
                            </h1>
                            <p className="text-amber-700 text-lg">
                                Lengkapi informasi pengiriman dan pembayaran Anda
                            </p>
                        </div>

                        {/* DITAMBAHKAN: Buy Now Mode Indicator */}
                        {buyNowMode && (
                            <div className="mb-8 bg-blue-50/80 backdrop-blur-md border border-blue-200 rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/50 mr-4">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-blue-800 font-semibold text-lg mb-1">Mode Beli Sekarang</h3>
                                        <p className="text-blue-600">
                                            Anda sedang checkout item yang dipilih saja.
                                            {hasSavedCart && ' Keranjang lama akan dikembalikan setelah checkout selesai.'}
                                        </p>
                                    </div>
                                    {hasSavedCart && (
                                        <button
                                            onClick={handleCancelCheckout}
                                            className="ml-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                                        >
                                            Batalkan & Kembalikan Keranjang
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Form Checkout */}
                            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-amber-200/50 p-8 hover:border-amber-400/50 transition-all duration-300 shadow-lg">
                                <div className="flex items-center mb-6">
                                    <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-400/50 mr-3">
                                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-amber-800">Informasi Pengiriman</h2>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Alamat Pengiriman */}
                                    <div>
                                        <label className="block text-sm font-medium text-amber-700 mb-2">
                                            Alamat Pengiriman <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={data.shipping_address}
                                            onChange={e => setData('shipping_address', e.target.value)}
                                            rows={4}
                                            className={`w-full px-4 py-3 bg-amber-50/50 border rounded-xl text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 transition-all duration-300 resize-none ${errors.shipping_address ? 'border-red-400/60' : 'border-amber-300/50 hover:border-amber-400/60'
                                                }`}
                                            placeholder="Masukkan alamat lengkap pengiriman..."
                                            required
                                        />
                                        {errors.shipping_address && (
                                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.shipping_address}
                                            </p>
                                        )}
                                    </div>

                                    {/* Metode Pembayaran */}
                                    <div>
                                        <label className="block text-sm font-medium text-amber-700 mb-2">
                                            Metode Pembayaran <span className="text-red-500">*</span>
                                        </label>
                                        <div className="space-y-3">
                                            {[
                                                {
                                                    value: 'bank_transfer',
                                                    label: 'Transfer Bank',
                                                    desc: 'BCA, BNI, Mandiri, BRI',
                                                    icon: (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                        </svg>
                                                    )
                                                },
                                                {
                                                    value: 'cod',
                                                    label: 'Bayar di Tempat (COD)',
                                                    desc: 'Bayar saat barang diterima',
                                                    icon: (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                    )
                                                },
                                                {
                                                    value: 'ewallet',
                                                    label: 'E-Wallet',
                                                    desc: 'GoPay, OVO, DANA, ShopeePay',
                                                    icon: (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    )
                                                },
                                            ].map((method) => (
                                                <label
                                                    key={method.value}
                                                    className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-105 ${data.payment_method === method.value
                                                            ? 'border-amber-400/60 bg-amber-100/50 shadow-lg shadow-amber-500/20'
                                                            : 'border-amber-200/50 bg-white/30 hover:border-amber-300/60 hover:bg-amber-50/50'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        value={method.value}
                                                        checked={data.payment_method === method.value}
                                                        onChange={e => setData('payment_method', e.target.value)}
                                                        className="w-4 h-4 text-amber-500 bg-amber-50 border-amber-300 focus:ring-amber-400"
                                                    />
                                                    <div className="ml-3 flex items-center">
                                                        <div className="text-amber-600 mr-3">
                                                            {method.icon}
                                                        </div>
                                                        <div>
                                                            <div className="text-amber-800 font-medium">{method.label}</div>
                                                            <div className="text-amber-600 text-sm">{method.desc}</div>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.payment_method && (
                                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.payment_method}
                                            </p>
                                        )}
                                    </div>

                                    {/* Catatan */}
                                    <div>
                                        <label className="block text-sm font-medium text-amber-700 mb-2">
                                            Catatan (Opsional)
                                        </label>
                                        <textarea
                                            value={data.notes}
                                            onChange={e => setData('notes', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 bg-amber-50/50 border border-amber-300/50 rounded-xl text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 hover:border-amber-400/60 transition-all duration-300 resize-none"
                                            placeholder="Tambahkan catatan untuk pesanan..."
                                        />
                                    </div>

                                    {/* Tombol Submit */}
                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={processing || isSubmitting}
                                            className={`w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-amber-300 disabled:to-orange-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/25 hover:scale-105 ${(processing || isSubmitting) ? 'animate-pulse' : ''
                                                }`}
                                        >
                                            {(processing || isSubmitting) ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                    </svg>
                                                    <span>Memproses Pesanan...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>
                                                        {buyNowMode ? 'Beli Sekarang' : 'Buat Pesanan'} - {formatCurrency(total)}
                                                    </span>
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-amber-200/50 p-8 hover:border-amber-400/50 transition-all duration-300 shadow-lg">
                                <div className="flex items-center mb-6">
                                    <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-400/50 mr-3">
                                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-amber-800">
                                        Ringkasan Pesanan
                                        {buyNowMode && (
                                            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                Beli Sekarang
                                            </span>
                                        )}
                                    </h2>
                                </div>

                                {/* Items */}
                                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-4 p-4 bg-amber-50/50 rounded-xl hover:bg-amber-100/50 transition-all duration-200 border border-amber-200/30">
                                            <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border border-amber-200/50 relative">
                                                {item.product.image ? (
                                                    <>
                                                        <img
                                                            src={item.product.image}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                                            onError={handleImageError}
                                                        />
                                                        <div className="image-fallback absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center" style={{ display: 'none' }}>
                                                            <span className="text-white text-2xl">🛒</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                                        <span className="text-white text-2xl">🛒</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-amber-800 font-medium truncate">{item.product.name}</h3>
                                                <p className="text-amber-600 text-sm">{item.product.category?.name || 'No Category'}</p>
                                                <p className="text-amber-600 text-sm">Qty: {item.quantity} × {formatCurrency(item.product.price)}</p>
                                                <p className="text-xs text-gray-500">Stok: {item.product.stock}</p>
                                            </div>
                                            <div className="text-amber-700 font-semibold">
                                                {formatCurrency(item.subtotal)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pricing Summary */}
                                <div className="border-t border-amber-200/50 pt-6 space-y-3">
                                    <div className="flex justify-between text-amber-700">
                                        <span>Subtotal ({cartItems.length} item)</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-amber-700">
                                        <span>Ongkos Kirim</span>
                                        <span>{formatCurrency(shippingCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-amber-700">
                                        <span>Pajak (10%)</span>
                                        <span>{formatCurrency(tax)}</span>
                                    </div>
                                    <div className="border-t border-amber-200/50 pt-3">
                                        <div className="flex justify-between text-xl font-bold text-amber-800">
                                            <span>Total Bayar</span>
                                            <span>{formatCurrency(total)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Badge */}
                                <div className="mt-6 p-4 bg-green-100/50 border border-green-300/50 rounded-xl">
                                    <div className="flex items-center text-green-700 text-sm">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span>Transaksi Aman & Terpercaya</span>
                                    </div>
                                </div>

                                {/* Back to Cart */}
                                <div className="mt-6 pt-6 border-t border-amber-200/50 space-y-3">
                                    {buyNowMode && hasSavedCart ? (
                                        <button
                                            onClick={handleCancelCheckout}
                                            className="flex items-center justify-center w-full px-4 py-3 bg-blue-100/50 border border-blue-200/50 text-blue-700 rounded-xl hover:bg-blue-200/50 hover:text-blue-800 hover:scale-105 transition-all duration-200"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Batalkan & Kembalikan Keranjang
                                        </button>
                                    ) : (
                                        <Link
                                            href="/cart"
                                            className="flex items-center justify-center w-full px-4 py-3 bg-amber-100/50 border border-amber-200/50 text-amber-700 rounded-xl hover:bg-amber-200/50 hover:text-amber-800 hover:scale-105 transition-all duration-200"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Kembali ke Keranjang
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    ),
                                    title: "Pembayaran Aman",
                                    desc: "Transaksi dilindungi enkripsi SSL"
                                },
                                {
                                    icon: (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ),
                                    title: "Pengiriman Cepat",
                                    desc: "Estimasi 1-3 hari kerja"
                                },
                                {
                                    icon: (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    ),
                                    title: "Garansi Kualitas",
                                    desc: "Produk berkualitas terjamin"
                                }
                            ].map((item, index) => (
                                <div key={index} className="flex items-center p-4 bg-white/60 backdrop-blur-md rounded-xl border border-amber-200/40 shadow-sm hover:shadow-md transition-all duration-200">
                                    <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-400/50 mr-4 text-amber-600">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-amber-800 font-medium">{item.title}</h3>
                                        <p className="text-amber-600 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </BuyerAuthenticatedLayout>
    );
}
