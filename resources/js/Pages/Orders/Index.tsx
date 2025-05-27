import React, { useState } from 'react';
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
}

export default function OrderHistory({ orders, auth }: OrderHistoryProps): JSX.Element {
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

  return (
    <GuestLayout>
      <Head title="Order History" />

      <div className="fixed inset-0 overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <header className="pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
              Order History
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              Track your orders and purchase history
            </p>
          </header>

          {/* Search and Filter Bar */}
          <div className="px-4 sm:px-6 lg:px-8 mb-8">
            <div className="max-w-7xl mx-auto">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-md mx-auto">
                  <input
                    type="text"
                    placeholder="Search by order number or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
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

              {/* Results count */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
                <div className="text-sm text-gray-400">
                  {filteredOrders.length > 0 && (
                    <span>
                      Showing {filteredOrders.length} of {orders.length} orders
                    </span>
                  )}
                </div>
              </div>

              {/* Filter Panel */}
              <div className="mb-6">
                <div className="bg-gray-800/40 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-gray-700/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
                      >
                        <option value="created_at-desc">Newest First</option>
                        <option value="created_at-asc">Oldest First</option>
                        <option value="total_amount-desc">Highest Amount</option>
                        <option value="total_amount-asc">Lowest Amount</option>
                        <option value="order_number-asc">Order Number A-Z</option>
                        <option value="order_number-desc">Order Number Z-A</option>
                      </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex flex-col justify-end">
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('');
                          setSortBy('created_at-desc');
                        }}
                        className="w-full bg-gray-600/50 hover:bg-gray-600/70 text-white px-3 py-2 rounded-lg transition-all duration-300 text-sm"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <main className="flex-grow px-4 sm:px-6 lg:px-8 pb-20">
            <div className="max-w-7xl mx-auto space-y-6">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-800/60 backdrop-blur-md rounded-xl border border-gray-700/50 hover:border-amber-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10"
                >
                  {/* Order Header */}
                  <div className="p-4 sm:p-6 border-b border-gray-700/50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <h3 className="text-lg font-bold text-white">
                          {order.order_number}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}
                        >
                          {order.status_label}
                        </span>
                      </div>
                      <div className="flex flex-col sm:items-end space-y-1">
                        <span className="text-xl font-bold text-amber-400">
                          {formatCurrency(order.total_amount)}
                        </span>
                        <span className="text-sm text-gray-400">
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Shipping Address:</span> {order.shipping_address}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 sm:p-6">
                    <div className="grid gap-4">
                      {order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4 p-3 bg-gray-700/30 rounded-lg"
                        >
                          {/* Product Image */}
                          <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                            {item.product.image ? (
                              <img
                                src={`/storage/${item.product.image}`}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                                <span className="text-amber-400 text-xs font-bold">NEO</span>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-grow min-w-0">
                            <h4 className="text-white font-medium truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {item.product.category}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-300">
                                Qty: {item.quantity}
                              </span>
                              <span className="text-sm text-gray-300">
                                {formatCurrency(item.price)} each
                              </span>
                            </div>
                          </div>

                          {/* Item Subtotal */}
                          <div className="text-right">
                            <span className="text-white font-medium">
                              {formatCurrency(item.quantity * item.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Actions */}
                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                      <div className="text-sm text-gray-400">
                        {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex space-x-3">
                        <Link
                          href={`/orders/${order.id}`}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-lg transition-all duration-300"
                        >
                          View Details
                        </Link>
                        {order.status === 'delivered' && (
                          <button className="px-4 py-2 bg-gray-600/50 hover:bg-gray-600/70 text-white text-sm font-medium rounded-lg transition-all duration-300">
                            Reorder
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {filteredOrders.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-4xl sm:text-6xl mb-4">📦</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-300 mb-2">
                    {orders.length === 0 ? 'No Orders Yet' : 'No Orders Found'}
                  </h3>
                  <p className="text-gray-400 px-4 mb-6">
                    {orders.length === 0
                      ? "Start shopping to see your order history here."
                      : searchTerm || statusFilter
                      ? `No orders match your current filters.`
                      : 'Your order history will appear here.'}
                  </p>
                  {orders.length === 0 && (
                    <Link
                      href="/products"
                      className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                    >
                      Browse Products
                    </Link>
                  )}
                  {orders.length > 0 && (searchTerm || statusFilter) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('');
                      }}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg transition-all duration-300"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
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
