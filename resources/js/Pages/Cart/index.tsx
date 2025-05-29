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

    if (selectedItems.length > 0) {
      router.get('/checkout', { items: selectedItems }, {
        onFinish: () => setIsLoading(false)
      });
    } else {
      router.get('/checkout', { all: true }, {
        onFinish: () => setIsLoading(false)
      });
    }
  };

  return (
    <BuyerAuthenticatedLayout>
      <Head title="Keranjang Belanja" />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Flash Messages */}
            {flash?.message && (
              <div className="mb-6 bg-blue-500/20 border border-blue-400/30 text-blue-300 px-6 py-4 rounded-xl backdrop-blur-md">
                {flash.message}
              </div>
            )}
            {flash?.success && (
              <div className="mb-6 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-6 py-4 rounded-xl backdrop-blur-md">
                {flash.success}
              </div>
            )}
            {flash?.error && (
              <div className="mb-6 bg-red-500/20 border border-red-400/30 text-red-300 px-6 py-4 rounded-xl backdrop-blur-md">
                {flash.error}
              </div>
            )}

            {/* Header Section */}
            <div className="mb-8 bg-gray-800/60 backdrop-blur-md rounded-2xl border border-gray-700/50 overflow-hidden">
              <div className="p-8 text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent mb-4">
                  Keranjang Belanja Anda
                </h1>
                <p className="text-gray-300 text-lg">
                  Kelola produk yang ingin Anda beli di Neo-Forest Collection
                </p>
              </div>
            </div>

            {/* Search Section */}
            {cartItems.length > 0 && (
              <div className="mb-8 bg-gray-800/60 backdrop-blur-md rounded-2xl border border-gray-700/50 overflow-hidden">
                <div className="p-6">
                  <div className="mb-4">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-3">
                      Cari Produk
                    </label>
                    <div className="relative">
                      <input
                        id="search"
                        type="text"
                        placeholder="Cari berdasarkan nama produk atau kategori..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
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
                  {filteredCartItems.length > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        Menampilkan {filteredCartItems.length} dari {cartItems.length} produk
                      </div>
                      <button
                        onClick={handleSelectAll}
                        className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors duration-200"
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
                  className="bg-gray-800/60 backdrop-blur-md rounded-2xl border border-gray-700/50 hover:border-amber-400/40 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-6">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-5 h-5 text-amber-500 bg-gray-700 border-gray-600 rounded focus:ring-amber-400 focus:ring-2"
                        disabled={isLoading}
                      />

                      {/* Product Image - DIPERBAIKI */}
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-600/50">
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
                        <div className={`w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center ${item.product.image ? 'hidden' : ''}`}>
                          <span className="text-white text-sm font-bold">NEO</span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow min-w-0">
                        <h3 className="text-xl font-semibold text-white truncate mb-2">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-amber-400 mb-2">
                          {item.product.category}
                        </p>
                        <p className="text-lg font-bold text-amber-300">
                          {formatCurrency(item.product.price)}
                        </p>
                        {item.product.stock < 10 && (
                          <p className="text-sm text-red-400 font-medium mt-1">
                            Stok tersisa: {item.product.stock}
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isLoading}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700/50 border border-gray-600/50 hover:bg-gray-600/50 hover:border-amber-400/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          title="Kurangi jumlah"
                        >
                          {isLoading ? (
                            <svg className="animate-spin w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                          ) : (
                            <span className="text-white font-bold">-</span>
                          )}
                        </button>
                        <span className="text-xl font-semibold text-white w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock || isLoading}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700/50 border border-gray-600/50 hover:bg-gray-600/50 hover:border-amber-400/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          title="Tambah jumlah"
                        >
                          {isLoading ? (
                            <svg className="animate-spin w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                          ) : (
                            <span className="text-white font-bold">+</span>
                          )}
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-xl font-bold text-amber-300 min-w-[140px] text-right">
                        {formatCurrency(item.quantity * item.product.price)}
                      </div>

                      {/* Delete Button - DIPERBAIKI dengan modal animasi */}
                      <button
                        onClick={() => openDeleteModal(item)}
                        disabled={isLoading}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/20 border border-red-400/30 text-red-400 hover:bg-red-500/30 hover:text-red-300 hover:scale-110 focus:outline-none transition-all duration-200"
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
                  <h3 className="text-2xl font-bold text-gray-300 mb-2">Keranjang Kosong</h3>
                  <p className="text-gray-400 mb-6">
                    {cartItems.length === 0
                      ? 'Belum ada produk di keranjang Anda'
                      : 'Produk yang dicari tidak ditemukan'
                    }
                  </p>
                  <a
                    href="/products"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all duration-300"
                  >
                    Mulai Belanja
                  </a>
                </div>
              )}
            </div>

            {/* Summary dan Checkout */}
            {cartItems.length > 0 && (
              <div className="mt-10 bg-gray-800/60 backdrop-blur-md rounded-2xl border border-gray-700/50 p-8">
                <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-white mb-2">
                      Total Bayar: {selectedItems.length > 0 ? formatCurrency(selectedTotal) : formatCurrency(totalAmount)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {selectedItems.length > 0
                        ? `${selectedItems.length} item dipilih`
                        : `${cartItems.length} item di keranjang`
                      }
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={isLoading || filteredCartItems.length === 0}
                    className={`px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/25 ${
                      isLoading ? 'animate-pulse' : ''
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

        {/* Modal Konfirmasi Hapus dengan Animasi - DIPERBAIKI */}
        {showDeleteModal && itemToDelete && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
              isModalAnimating ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
            }`}
            onClick={handleBackdropClick}
          >
            <div className={`relative bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out ${
              isModalAnimating
                ? 'scale-100 opacity-100 translate-y-0'
                : 'scale-75 opacity-0 translate-y-8'
            }`}>
              {/* Floating Animation Elements */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-400/30 rounded-full animate-ping"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-amber-400/20 rounded-full animate-pulse"></div>

              <div className="p-6">
                {/* Header Modal dengan animasi icon */}
                <div className="flex items-center justify-center mb-6">
                  <div className={`w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-400/30 transition-all duration-500 ${
                    isModalAnimating ? 'animate-bounce' : ''
                  }`}>
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                </div>

                {/* Konten Modal dengan staggered animation */}
                <div className={`text-center mb-6 transition-all duration-500 delay-100 ${
                  isModalAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Hapus Produk dari Keranjang?
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Apakah Anda yakin ingin menghapus <span className="font-semibold text-amber-400">"{itemToDelete.product.name}"</span> dari keranjang belanja?
                  </p>

                  {/* Product Preview Card dengan hover effect */}
                  <div className={`bg-gray-700/50 rounded-xl p-4 border border-gray-600/50 hover:border-amber-400/30 transition-all duration-300 ${
                    isModalAnimating ? 'hover:scale-105' : ''
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-600/50">
                        {itemToDelete.product.image ? (
                          <img
                            src={`/storage/products/${itemToDelete.product.image}`}
                            alt={itemToDelete.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">NEO</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium truncate">{itemToDelete.product.name}</p>
                        <p className="text-amber-400 text-sm">{formatCurrency(itemToDelete.product.price)}</p>
                        <p className="text-gray-400 text-sm">Qty: {itemToDelete.quantity}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi dengan staggered animation */}
                <div className={`flex space-x-3 transition-all duration-500 delay-200 ${
                  isModalAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <button
                    onClick={closeDeleteModal}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 text-gray-300 rounded-xl hover:bg-gray-600/50 hover:text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmDeleteItem}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-red-500/20 border border-red-400/30 text-red-400 rounded-xl hover:bg-red-500/30 hover:text-red-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
