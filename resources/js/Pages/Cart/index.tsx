import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
}

export default function CartIndex({ cartItems, totalAmount, auth }: CartIndexProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter cart items based on search
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
          // Refresh data
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

  const handleDeleteItem = async (cartId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini dari keranjang?')) {
      return;
    }

    setIsLoading(true);
    try {
      await router.delete(`/cart/${cartId}`, {
        preserveScroll: true,
        onSuccess: () => {
          router.reload({ only: ['cartItems', 'totalAmount'] });
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

  return (
    <BuyerAuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-yellow-800">
          Keranjang Belanja
        </h2>
      }
    >
      <Head title="Keranjang Belanja" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8 overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <h1 className="text-3xl font-bold text-center">
                Keranjang Belanja Anda
              </h1>
              <p className="text-center mt-4 text-gray-600">
                Kelola produk yang ingin Anda beli di Neo-Forest
              </p>
            </div>
          </div>

          {/* Search Section */}
          {cartItems.length > 0 && (
            <div className="mb-6 overflow-hidden bg-white shadow-sm sm:rounded-lg">
              <div className="p-6">
                <div className="mb-4">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    Cari Produk
                  </label>
                  <div className="relative">
                    <input
                      id="search"
                      type="text"
                      placeholder="Cari berdasarkan nama produk atau kategori..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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
                    <div className="text-sm text-gray-600">
                      Menampilkan {filteredCartItems.length} dari {cartItems.length} produk
                    </div>
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
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
                className="overflow-hidden bg-white shadow-sm sm:rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
                    />

                    {/* Product Image */}
                    <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                      {item.product.image ? (
                        <img
                          src={`/storage/${item.product.image}`}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">NEO</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-1">
                        {item.product.category}
                      </p>
                      <p className="text-lg font-bold text-yellow-800">
                        {formatCurrency(item.product.price)}
                      </p>
                      {item.product.stock < 10 && (
                        <p className="text-sm text-red-600 font-medium">
                          Stok tersisa: {item.product.stock}
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isLoading}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="text-lg font-medium min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock || isLoading}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[8rem]">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(item.quantity * item.product.price)}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={isLoading}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
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
              <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                <div className="p-12 text-center">
                  <div className="text-4xl sm:text-6xl mb-4">🛒</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {cartItems.length === 0 ? 'Keranjang Kosong' : 'Produk Tidak Ditemukan'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {cartItems.length === 0
                      ? "Mulai berbelanja untuk menambah produk ke keranjang Anda."
                      : searchTerm
                      ? `Tidak ada produk yang sesuai dengan pencarian "${searchTerm}".`
                      : 'Keranjang belanja Anda kosong.'}
                  </p>
                  {cartItems.length === 0 && (
                    <Link
                      href="/products"
                      className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                    >
                      Jelajahi Produk
                    </Link>
                  )}
                  {cartItems.length > 0 && searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                    >
                      Reset Pencarian
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Checkout Section */}
          {filteredCartItems.length > 0 && (
            <div className="mt-8 overflow-hidden bg-white shadow-sm sm:rounded-lg">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                  <div className="text-left">
                    <p className="text-sm text-gray-600">
                      {selectedItems.length > 0
                        ? `${selectedItems.length} item dipilih`
                        : `Total ${cartItems.length} item`}
                    </p>
                    <p className="text-2xl font-bold text-yellow-800">
                      {formatCurrency(selectedItems.length > 0 ? selectedTotal : totalAmount)}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Link
                      href="/products"
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      Lanjut Belanja
                    </Link>
                    <button
                      disabled={selectedItems.length === 0 && cartItems.length > 0}
                      className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      {selectedItems.length > 0
                        ? `Checkout (${selectedItems.length})`
                        : 'Checkout Semua'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BuyerAuthenticatedLayout>
  );
}
