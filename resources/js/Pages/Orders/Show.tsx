import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

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
}

export default function OrderShow({ order }: OrderShowProps): JSX.Element {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'processing':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'shipped':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'delivered':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'cancelled':
        return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
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

  return (
    <GuestLayout>
      <Head title={`Order ${order.order_number}`} />

      <div className="fixed inset-0 overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Login Button */}
          <div className="absolute top-4 right-6 z-10">
            <a
              href="/login"
              className="inline-block px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow transition"
            >
              Login
            </a>
          </div>

          {/* Header */}
          <header className="pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-4">
              <Link
                href="/orders"
                className="inline-flex items-center text-amber-400 hover:text-amber-300 transition-colors duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Orders
              </Link>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
              Order Details
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              Track your order status and details
            </p>
          </header>

          {/* Main Content */}
          <main className="flex-grow px-4 sm:px-6 lg:px-8 pb-20">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Order Summary Card */}
              <div className="bg-gray-800/60 backdrop-blur-md rounded-xl border border-gray-700/50 p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      {order.order_number}
                    </h2>
                    <p className="text-gray-400">
                      Order placed on {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-start lg:items-end space-y-2">
                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{order.status_label}</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-amber-400">
                      {formatCurrency(order.total_amount)}
                    </div>
                  </div>
                </div>

                {/* Order Progress */}
                {order.status !== 'cancelled' && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Order Progress</h3>
                    <div className="flex items-center justify-between">
                      {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, index) => (
                        <div key={step} className="flex flex-col items-center flex-1">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                            index <= progress.current
                              ? 'bg-amber-500 border-amber-500 text-white'
                              : 'bg-gray-700 border-gray-600 text-gray-400'
                          }`}>
                            {index <= progress.current ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="text-xs font-medium">{index + 1}</span>
                            )}
                          </div>
                          <span className={`text-xs mt-2 ${
                            index <= progress.current ? 'text-amber-400' : 'text-gray-500'
                          }`}>
                            {step}
                          </span>
                          {index < 3 && (
                            <div className={`absolute w-full h-0.5 mt-4 ${
                              index < progress.current ? 'bg-amber-500' : 'bg-gray-600'
                            }`} style={{
                              left: '50%',
                              right: '-50%',
                              transform: 'translateY(-16px)',
                              zIndex: -1
                            }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Information */}
                <div className="border-t border-gray-700/50 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Shipping Information</h3>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-white font-medium">Delivery Address</p>
                        <p className="text-gray-300 mt-1">{order.shipping_address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-800/60 backdrop-blur-md rounded-xl border border-gray-700/50 p-6 sm:p-8">
                <h3 className="text-xl font-bold text-white mb-6">Order Items ({order.order_items.length})</h3>
                <div className="space-y-6">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/40 transition-colors duration-300">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                        {item.product.image ? (
                          <img
                            src={`/storage/${item.product.image}`}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                            <span className="text-amber-400 text-sm font-bold">NEO</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow min-w-0">
                        <Link
                          href={`/products/${item.product.id}`}
                          className="block group"
                        >
                          <h4 className="text-white font-semibold group-hover:text-amber-300 transition-colors truncate">
                            {item.product.name}
                          </h4>
                        </Link>
                        <p className="text-sm text-gray-400 mt-1">
                          {item.product.category}
                        </p>
                        <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                          {item.product.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-3">
                          <span className="text-sm text-gray-300">
                            <span className="font-medium">Quantity:</span> {item.quantity}
                          </span>
                          <span className="text-sm text-gray-300">
                            <span className="font-medium">Price:</span> {formatCurrency(item.price)}
                          </span>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <div className="text-lg font-semibold text-white">
                          {formatCurrency(item.quantity * item.price)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {item.quantity} × {formatCurrency(item.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-700/50 mt-8 pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-gray-300">
                      <span>Subtotal ({order.order_items.length} items)</span>
                      <span>{formatCurrency(order.total_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                      <span>Shipping</span>
                      <span className="text-emerald-400">Free</span>
                    </div>
                    <div className="border-t border-gray-700/50 pt-3">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-amber-400">{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="bg-gray-800/60 backdrop-blur-md rounded-xl border border-gray-700/50 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                  <div className="text-sm text-gray-400">
                    Need help with your order? Contact our support team.
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    {order.status === 'delivered' && (
                      <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-lg transition-all duration-300">
                        Leave Review
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <button className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-lg transition-all duration-300">
                        Reorder
                      </button>
                    )}
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <button className="px-6 py-2 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-medium rounded-lg transition-all duration-300">
                        Cancel Order
                      </button>
                    )}
                    <button className="px-6 py-2 bg-gray-600/50 hover:bg-gray-600/70 text-white font-medium rounded-lg transition-all duration-300">
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="py-6 text-center text-gray-400 text-sm border-t border-gray-800/50">
            <div className="max-w-7xl mx-auto px-4">
              <p>© {new Date().getFullYear()} Neo-Forest. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>
    </GuestLayout>
  );
}
