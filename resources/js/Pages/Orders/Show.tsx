import React from 'react';
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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
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

  // Handler aksi tombol
  const handleCancelOrder = () => {
    if (confirm('Yakin ingin membatalkan pesanan ini?')) {
      router.patch(`/orders/${order.id}/cancel`);
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
    <BuyerAuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/orders"
              className="inline-flex items-center text-yellow-600 hover:text-yellow-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Riwayat Pesanan
            </Link>
          </div>
          <h2 className="text-xl font-semibold leading-tight text-yellow-800">
            Detail Pesanan
          </h2>
        </div>
      }
    >
      <Head title={`Order ${order.order_number}`} />
      <div className="py-12">
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
          {/* Order Summary Card */}
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {order.order_number}
                  </h1>
                  <p className="text-gray-600">
                    Pesanan dibuat pada {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex flex-col items-start lg:items-end space-y-2">
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status_label}</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-800">
                    {formatCurrency(order.total_amount)}
                  </div>
                </div>
              </div>

              {/* Order Progress */}
              {order.status !== 'cancelled' && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Pesanan</h3>
                  <div className="flex items-center justify-between">
                    {[
                      { key: 'pending', label: 'Menunggu' },
                      { key: 'processing', label: 'Diproses' },
                      { key: 'shipped', label: 'Dikirim' },
                      { key: 'delivered', label: 'Diterima' }
                    ].map((step, index) => (
                      <div key={step.key} className="flex flex-col items-center flex-1 relative">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-white ${
                          index <= progress.current
                            ? 'border-yellow-500 text-yellow-600'
                            : 'border-gray-300 text-gray-400'
                        }`}>
                          {index <= progress.current ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-xs font-medium">{index + 1}</span>
                          )}
                        </div>
                        <span className={`text-xs mt-2 text-center ${
                          index <= progress.current ? 'text-yellow-600 font-medium' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </span>
                        {index < 3 && (
                          <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
                            index < progress.current ? 'bg-yellow-500' : 'bg-gray-300'
                          }`} style={{ transform: 'translateX(50%)' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Pengiriman</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-gray-900 font-medium">Alamat Pengiriman</p>
                      <p className="text-gray-600 mt-1">{order.shipping_address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Item Pesanan ({order.order_items.length})
              </h3>
              <div className="space-y-6">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
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
                          <span className="text-white text-sm font-bold">NEO</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow min-w-0">
                      <Link
                        href={`/products/${item.product.id}`}
                        className="block group"
                      >
                        <h4 className="text-gray-900 font-semibold group-hover:text-yellow-600 transition-colors truncate">
                          {item.product.name}
                        </h4>
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.product.category}
                      </p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {item.product.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">Jumlah:</span> {item.quantity}
                        </span>
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">Harga:</span> {formatCurrency(item.price)}
                        </span>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(item.quantity * item.price)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.quantity} × {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 mt-8 pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Subtotal ({order.order_items.length} item)</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Ongkos Kirim</span>
                    <span className="text-green-600">Gratis</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-yellow-800">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Actions */}
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-500">
                  Butuh bantuan dengan pesanan Anda? Hubungi tim dukungan kami.
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  {order.status === 'delivered' && (
                    <button
                      onClick={handleReview}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      Berikan Ulasan
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button
                      onClick={handleReorder}
                      className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      Pesan Lagi
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'processing') && (
                    <button
                      onClick={handleCancelOrder}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      Batalkan Pesanan
                    </button>
                  )}
                  <button className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200">
                    Hubungi Dukungan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BuyerAuthenticatedLayout>
  );
}
