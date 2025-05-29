import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Order, OrderItem, PageProps } from '@/types';

interface OrderShowProps extends PageProps {
  order: Order & {
    payment_method?: string;
    order_items: (OrderItem & {
      product: {
        id: number;
        name: string;
        price: number;
        image?: string;
        category?: {
          id: number;
          name: string;
        };
      };
    })[];
    user: {
      id: number;
      name: string;
      email: string;
      phone?: string;
      address?: string;
    };
  };
}

export default function OrderShow({ order }: OrderShowProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);

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

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-amber-50 text-amber-800 border-amber-200',
      processing: 'bg-orange-50 text-orange-800 border-orange-200',
      shipped: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      delivered: 'bg-green-50 text-green-800 border-green-200',
      cancelled: 'bg-red-50 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      processing: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      shipped: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      delivered: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      cancelled: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };
    return icons[status as keyof typeof icons] || icons.pending;
  };

  const handleQuickStatusUpdate = (newStatus: string) => {
    setIsLoading(true);
    router.patch(`/admin/orders/${order.id}/status`, {
      status: newStatus
    }, {
      onFinish: () => setIsLoading(false),
      preserveScroll: true,
    });
  };

  const handlePrintOrder = () => {
    window.print();
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Pesanan #${order.order_number}`} />

      <div className="py-8 min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-3xl font-light text-amber-900">
                  Pesanan #{order.order_number}
                </h1>
                <p className="mt-1 text-sm text-amber-700">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handlePrintOrder}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <div className="bg-white rounded-xl border border-amber-200 shadow-sm">
                <div className="px-6 py-4 border-b border-amber-100">
                  <h2 className="text-lg font-medium text-amber-900">Status Pesanan</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {order.status}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status saat ini
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  {/* Quick Status Update */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Update Status:</p>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'processing', 'shipped', 'delivered'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleQuickStatusUpdate(status)}
                          disabled={isLoading || order.status === status}
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors duration-200 ${
                            order.status === status
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tracking Number */}
                  {order.tracking_number && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-blue-900">Nomor Resi</p>
                          <p className="font-mono text-blue-700">{order.tracking_number}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-xl border border-amber-200 shadow-sm">
                <div className="px-6 py-4 border-b border-amber-100">
                  <h2 className="text-lg font-medium text-amber-900">Item Pesanan</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-amber-25 rounded-lg border border-amber-100">
                        <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border border-amber-200">
                          {item.product?.image ? (
                            <img
                              src={`/storage/products/${item.product?.image}`}
                              alt={item.product?.name || 'Product'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                              <span className="text-amber-600 text-xs font-medium">IMG</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{item.product?.name}</h3>
                          <p className="text-sm text-amber-600">{item.product?.category?.name}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                            <span>Qty: {item.quantity}</span>
                            <span>×</span>
                            <span>{formatCurrency(item.price)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(item.quantity * item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="mt-6 pt-6 border-t border-amber-100">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">
                          {formatCurrency(order.order_items.reduce((sum, item) => sum + (item.quantity * item.price), 0))}
                        </span>
                      </div>
                      {order.shipping_cost && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ongkos Kirim:</span>
                          <span className="text-gray-900">{formatCurrency(order.shipping_cost)}</span>
                        </div>
                      )}
                      {order.tax_amount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Pajak:</span>
                          <span className="text-gray-900">{formatCurrency(order.tax_amount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-medium pt-2 border-t border-amber-100">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-amber-600">{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-xl border border-amber-200 shadow-sm">
                <div className="px-6 py-4 border-b border-amber-100">
                  <h3 className="text-lg font-medium text-amber-900">Pelanggan</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.user.name}</p>
                      <p className="text-sm text-gray-600">{order.user.email}</p>
                    </div>
                  </div>
                  {order.user.phone && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <p className="text-gray-900">{order.user.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-white rounded-xl border border-amber-200 shadow-sm">
                <div className="px-6 py-4 border-b border-amber-100">
                  <h3 className="text-lg font-medium text-amber-900">Detail</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-sm text-gray-600">Nomor Pesanan:</span>
                    <p className="font-mono text-sm text-gray-900">{order.order_number}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Metode Pembayaran:</span>
                    <p className="text-sm text-gray-900 capitalize">
                      {order.payment_method?.replace('_', ' ') || 'Belum dipilih'}
                    </p>
                  </div>
                  {order.shipped_at && (
                    <div>
                      <span className="text-sm text-gray-600">Tanggal Pengiriman:</span>
                      <p className="text-sm text-gray-900">{formatDate(order.shipped_at)}</p>
                    </div>
                  )}
                  {order.delivered_at && (
                    <div>
                      <span className="text-sm text-gray-600">Tanggal Diterima:</span>
                      <p className="text-sm text-gray-900">{formatDate(order.delivered_at)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="bg-white rounded-xl border border-amber-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-amber-100">
                    <h3 className="text-lg font-medium text-amber-900">Alamat Pengiriman</h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm text-gray-900 leading-relaxed">{order.shipping_address}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {order.notes && (
                <div className="bg-white rounded-xl border border-amber-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-amber-100">
                    <h3 className="text-lg font-medium text-amber-900">Catatan</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-900 leading-relaxed">{order.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
