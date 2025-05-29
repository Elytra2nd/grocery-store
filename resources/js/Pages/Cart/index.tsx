import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import BuyerAuthenticatedLayout from '@/Layouts/BuyerAuthenticatedLayout';

interface CartItem {
    id: number;
    user_id: number;
    product_id: number;
    quantity: number;
    created_at: string;
    updated_at: string;
    product: {
        id: number;
        name: string;
        price: number;
        image?: string;
        category: string;
        description?: string;
        stock: number;
    };
}

interface CartIndexProps {
    cartItems: CartItem[];
    totalAmount: number;
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

export default function CartIndex({ cartItems, totalAmount, auth, flash }: CartIndexProps): JSX.Element {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // State untuk modal konfirmasi hapus dengan animasi
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
    const [isModalAnimating, setIsModalAnimating] = useState(false);

    // Filter cart items berdasarkan search term
    const filteredCartItems = cartItems.filter(item =>
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleQuantityChange = async (cartId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        setIsLoading(true);
        try {
            await router.put(`/cart/${cartId}`, { quantity: newQuantity }, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['cartItems', 'totalAmount'] });
                },
                onError: (errors) => {
                    console.error('Error updating quantity:', errors);
                }
            });
        } catch (error) {
            console.error('Error updating quantity:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi untuk membuka modal dengan animasi
    const openDeleteModal = (item: CartItem) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
        // Trigger animasi masuk setelah modal muncul
        setTimeout(() => {
            setIsModalAnimating(true);
        }, 10);
    };

    // Fungsi untuk menutup modal dengan animasi
    const closeDeleteModal = () => {
        setIsModalAnimating(false);
        // Tunggu animasi selesai sebelum benar-benar menutup modal
        setTimeout(() => {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }, 300);
    };

    // Fungsi untuk menghapus item setelah konfirmasi
    const confirmDeleteItem = async () => {
        if (!itemToDelete) return;

        setIsLoading(true);
        try {
            await router.delete(`/cart/${itemToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['cartItems', 'totalAmount'] });
                    closeDeleteModal();
                },
                onError: (errors) => {
                    console.error('Error deleting item:', errors);
                }
            });
        } catch (error) {
            console.error('Error deleting item:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle click outside modal untuk menutup
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            closeDeleteModal();
        }
    };

    // Handle ESC key untuk menutup modal
    useEffect(() => {
        const handleEscKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showDeleteModal) {
                closeDeleteModal();
            }
        };

        if (showDeleteModal) {
            document.addEventListener('keydown', handleEscKey);
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.body.style.overflow = 'unset';
        };
    }, [showDeleteModal]);

    const handleSelectAll = () => {
        if (selectedItems.length === filteredCartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredCartItems.map(item => item.id));
        }
    };

    const handleSelectItem = (itemId: number) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const selectedTotal = filteredCartItems
        .filter(item => selectedItems.includes(item.id))
        .reduce((total, item) => total + (item.quantity * item.product.price), 0);

    const handleCheckout = () => {
        setIsLoading(true);
        if (filteredCartItems.length === 0) return;

        // Jika ingin checkout item terpilih saja:
        if (selectedItems.length > 0) {
            router.visit(`/checkout?items[]=${selectedItems.join('&items[]=')}`);
        } else {
            // Jika ingin checkout semua item
            router.visit('/checkout');
        }
        setIsLoading(false);
    };

    return (
        <BuyerAuthenticatedLayout>
            <Head title="Keranjang Belanja" />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 overflow-x-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-32 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Flash Messages */}
                        {flash?.message && (
                            <div className="mb-6 bg-blue-100/80 border border-blue-300 text-blue-800 px-6 py-4 rounded-xl backdrop-blur-md shadow-sm">
                                {flash.message}
                            </div>
                        )}
                        {flash?.success && (
                            <div className="mb-6 bg-emerald-100/80 border border-emerald-300 text-emerald-800 px-6 py-4 rounded-xl backdrop-blur-md shadow-sm">
                                {flash.success}
                            </div>
                        )}
                        {flash?.error && (
                            <div className="mb-6 bg-red-100/80 border border-red-300 text-red-800 px-6 py-4 rounded-xl backdrop-blur-md shadow-sm">
                                {flash.error}
                            </div>
                        )}

                        {/* Header Section */}
                        <div className="mb-8 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-amber-200 overflow-hidden shadow-lg">
                            <div className="p-8 text-center">
                                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4 drop-shadow-sm">
                                    Keranjang Belanja Anda
                                </h1>
                                <p className="text-amber-800 text-lg font-medium">
                                    Kelola produk yang ingin Anda beli di Fresh Market Collection
                                </p>
                            </div>
                        </div>

                        {/* Search Section */}
                        {cartItems.length > 0 && (
                            <div className="mb-8 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-amber-200 overflow-hidden shadow-lg">
                                <div className="p-6">
                                    <div className="mb-4">
                                        <label htmlFor="search" className="block text-sm font-semibold text-amber-800 mb-3">
                                            Cari Produk
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="search"
                                                type="text"
                                                placeholder="Cari berdasarkan nama produk atau kategori..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 bg-amber-50/80 border-2 border-amber-200 rounded-xl text-amber-900 placeholder-amber-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-300/50 transition-all duration-300 font-medium"
                                            />
                                            <svg
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    {filteredCartItems.length > 0 && (
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-amber-700 font-medium">
                                                Menampilkan {filteredCartItems.length} dari {cartItems.length} produk
                                            </div>
                                            <button
                                                onClick={handleSelectAll}
                                                className="text-sm text-amber-600 hover:text-amber-800 font-semibold transition-colors duration-200 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg border border-amber-300"
                                            >
                                                {selectedItems.length === filteredCartItems.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Cart Items */}
                        <div className="space-y-6">
                            {filteredCartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white/80 backdrop-blur-md rounded-2xl border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center space-x-6">
                                            {/* Checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => handleSelectItem(item.id)}
                                                className="w-5 h-5 text-amber-600 bg-amber-50 border-amber-300 rounded focus:ring-amber-500 focus:ring-2"
                                                disabled={isLoading}
                                            />

                                            {/* Product Image */}
                                            <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl border-2 border-amber-200 shadow-md">
                                                {item.product.image ? (
                                                    <img
                                                        src={`/storage/products/${item.product.image}`}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`w-full h-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center ${item.product.image ? 'hidden' : ''}`}>
                                                    <div className="text-center">
                                                        <svg className="w-8 h-8 text-amber-600 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                        </svg>
                                                        <span className="text-amber-700 text-xs font-bold">Fresh</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-grow min-w-0">
                                                <h3 className="text-xl font-bold text-amber-900 truncate mb-2">
                                                    {item.product.name}
                                                </h3>
                                                <p className="text-sm text-amber-700 font-medium mb-2 bg-amber-100 px-3 py-1 rounded-full inline-block border border-amber-200">
                                                    {item.product.category}
                                                </p>
                                                <p className="text-lg font-bold text-amber-800">
                                                    {formatCurrency(item.product.price)}
                                                </p>
                                                {item.product.stock < 10 && (
                                                    <p className="text-sm text-red-600 font-semibold mt-1 bg-red-100 px-2 py-1 rounded-md inline-block">
                                                        Stok tersisa: {item.product.stock}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1 || isLoading}
                                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-100 border-2 border-amber-300 hover:bg-amber-200 hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-amber-800 hover:text-amber-900"
                                                    title="Kurangi jumlah"
                                                >
                                                    {isLoading ? (
                                                        <svg className="animate-spin w-4 h-4 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                        </svg>
                                                    ) : (
                                                        <span className="font-bold">-</span>
                                                    )}
                                                </button>
                                                <span className="text-xl font-bold text-amber-900 w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.product.stock || isLoading}
                                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-100 border-2 border-amber-300 hover:bg-amber-200 hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-amber-800 hover:text-amber-900"
                                                    title="Tambah jumlah"
                                                >
                                                    {isLoading ? (
                                                        <svg className="animate-spin w-4 h-4 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                        </svg>
                                                    ) : (
                                                        <span className="font-bold">+</span>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Subtotal */}
                                            <div className="text-xl font-bold text-amber-800 min-w-[140px] text-right">
                                                {formatCurrency(item.quantity * item.product.price)}
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => openDeleteModal(item)}
                                                disabled={isLoading}
                                                className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 border-2 border-red-300 text-red-600 hover:bg-red-200 hover:text-red-700 hover:scale-110 focus:outline-none transition-all duration-200"
                                                title="Hapus dari keranjang"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Empty State */}
                            {filteredCartItems.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">🛒</div>
                                    <h3 className="text-2xl font-bold text-amber-800 mb-2">Keranjang Kosong</h3>
                                    <p className="text-amber-700 mb-6 font-medium">
                                        {cartItems.length === 0
                                            ? 'Belum ada produk di keranjang Anda'
                                            : 'Produk yang dicari tidak ditemukan'
                                        }
                                    </p>
                                    <a
                                        href="/products"
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/30"
                                    >
                                        Mulai Belanja
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Summary dan Checkout */}
                        {cartItems.length > 0 && (
                            <div className="mt-10 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-amber-200 p-8 shadow-lg">
                                <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
                                    <div className="text-center lg:text-left">
                                        <div className="text-2xl font-bold text-amber-900 mb-2">
                                            Total Bayar: {selectedItems.length > 0 ? formatCurrency(selectedTotal) : formatCurrency(totalAmount)}
                                        </div>
                                        <div className="text-sm text-amber-700 font-medium">
                                            {selectedItems.length > 0
                                                ? `${selectedItems.length} item dipilih`
                                                : `${cartItems.length} item di keranjang`
                                            }
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={isLoading || filteredCartItems.length === 0}
                                        className={`px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/30 transform hover:-translate-y-0.5 ${isLoading ? 'animate-pulse' : ''
                                            }`}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center space-x-2">
                                                <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                </svg>
                                                <span>Memproses...</span>
                                            </div>
                                        ) : (
                                            selectedItems.length > 0
                                                ? `Checkout (${selectedItems.length} item)`
                                                : 'Checkout Semua'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Konfirmasi Hapus dengan Animasi */}
                {showDeleteModal && itemToDelete && (
                    <div
                        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isModalAnimating ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
                            }`}
                        onClick={handleBackdropClick}
                    >
                        <div className={`relative bg-white/95 backdrop-blur-md border-2 border-amber-200 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out ${isModalAnimating
                                ? 'scale-100 opacity-100 translate-y-0'
                                : 'scale-75 opacity-0 translate-y-8'
                            }`}>
                            {/* Floating Animation Elements */}
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-400/50 rounded-full animate-ping"></div>
                            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-amber-400/50 rounded-full animate-pulse"></div>

                            <div className="p-6">
                                {/* Header Modal dengan animasi icon */}
                                <div className="flex items-center justify-center mb-6">
                                    <div className={`w-16 h-16 bg-red-100 rounded-full flex items-center justify-center border-2 border-red-300 transition-all duration-500 ${isModalAnimating ? 'animate-bounce' : ''
                                        }`}>
                                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Konten Modal dengan staggered animation */}
                                <div className={`text-center mb-6 transition-all duration-500 delay-100 ${isModalAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                    }`}>
                                    <h3 className="text-xl font-bold text-amber-900 mb-3">
                                        Hapus Produk dari Keranjang?
                                    </h3>
                                    <p className="text-amber-800 mb-4 font-medium">
                                        Apakah Anda yakin ingin menghapus <span className="font-bold text-amber-700">"{itemToDelete.product.name}"</span> dari keranjang belanja?
                                    </p>

                                    {/* Product Preview Card dengan hover effect */}
                                    <div className={`bg-amber-50/80 rounded-xl p-4 border-2 border-amber-200 hover:border-amber-300 transition-all duration-300 ${isModalAnimating ? 'hover:scale-105' : ''
                                        }`}>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-lg border-2 border-amber-200">
                                                {itemToDelete.product.image ? (
                                                    <img
                                                        src={`/storage/products/${itemToDelete.product.image}`}
                                                        alt={itemToDelete.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center">
                                                        <span className="text-amber-700 text-xs font-bold">Fresh</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-amber-900 font-semibold truncate">{itemToDelete.product.name}</p>
                                                <p className="text-amber-700 text-sm">{formatCurrency(itemToDelete.product.price)}</p>
                                                <p className="text-amber-600 text-sm">Qty: {itemToDelete.quantity}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tombol Aksi dengan staggered animation */}
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
            </div>
        </BuyerAuthenticatedLayout>
    );
}
