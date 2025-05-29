import React, { useState, FormEvent } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Order, OrderItem, PageProps } from '@/types';

interface OrderEditProps extends PageProps {
  order: Order & {
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
    };
  };
}

type OrderFormData = {
  status: string;
  tracking_number: string;
  notes: string;
  shipping_address: string;
  [key: string]: any;
};

export default function OrderEdit({ order }: OrderEditProps): JSX.Element {
  const { data, setData, put, processing, errors } = useForm<OrderFormData>({
    status: order.status,
    tracking_number: order.tracking_number || '',
    notes: order.notes || '',
    shipping_address: order.shipping_address || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
      processing: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
      shipped: 'bg-purple-500/20 text-purple-400 border-purple-400/30',
      delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-400/30',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    put(`/admin/orders/${order.id}`, {
      onFinish: () => setIsSubmitting(false),
      onError: () => setIsSubmitting(false),
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Edit Pesanan #${order.order_number}`} />

      <div className="py-8 min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-amber-900">
                  Edit Pesanan #{order.order_number}
                </h1>
                <p className="mt-1 text-sm text-amber-700">
                  Kelola status dan informasi pesanan
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="inline-flex items-center px-4 py-2 bg-white border border-amber-300 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Edit */}
            <div className="bg-white shadow-lg rounded-2xl border border-amber-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500">
                <h2 className="text-xl font-bold text-white">Update Pesanan</h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Status Pesanan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={data.status}
                    onChange={e => setData('status', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                      errors.status ? 'border-red-300' : 'border-amber-300'
                    }`}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                  )}
                </div>

                {/* Tracking Number */}
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Nomor Resi
                  </label>
                  <input
                    type="text"
                    value={data.tracking_number}
                    onChange={e => setData('tracking_number', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 ${
                      errors.tracking_number ? 'border-red-300' : 'border-amber-300'
                    }`}
                    placeholder="Masukkan nomor resi pengiriman..."
                  />
                  {errors.tracking_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.tracking_number}</p>
                  )}
                </div>

                {/* Shipping Address */}
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Alamat Pengiriman
                  </label>
                  <textarea
                    value={data.shipping_address}
                    onChange={e => setData('shipping_address', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 resize-none ${
                      errors.shipping_address ? 'border-red-300' : 'border-amber-300'
                    }`}
                    placeholder="Alamat pengiriman..."
                  />
                  {errors.shipping_address && (
                    <p className="mt-1 text-sm text-red-600">{errors.shipping_address}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Catatan Admin
                  </label>
                  <textarea
                    value={data.notes}
                    onChange={e => setData('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 resize-none"
                    placeholder="Tambahkan catatan untuk pesanan ini..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={processing || isSubmitting}
                    className={`w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/25 ${
                      (processing || isSubmitting) ? 'animate-pulse cursor-not-allowed' : ''
                    }`}
                  >
                    {(processing || isSubmitting) ? (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span>Menyimpan...</span>
                      </div>
                    ) : (
                      'Update Pesanan'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white shadow-lg rounded-2xl border border-amber-200 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500">
                  <h3 className="text-lg font-bold text-white">Informasi Pelanggan</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              {/* Order Summary */}
              <div className="bg-white shadow-lg rounded-2xl border border-amber-200 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500">
                  <h3 className="text-lg font-bold text-white">Detail Pesanan</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tanggal Pesanan:</span>
                      <p className="font-medium text-gray-900">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mt-1 ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <p className="font-bold text-amber-600 text-lg">{formatCurrency(order.total_amount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Metode Pembayaran:</span>
                      <p className="font-medium text-gray-900">{order.payment_method || 'Belum dipilih'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white shadow-lg rounded-2xl border border-amber-200 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-blue-500">
                  <h3 className="text-lg font-bold text-white">Item Pesanan</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-300">
                          {item.product.image ? (
                            <img
                              src={`/storage/products/${item.product.image}`}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">NEO</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h4>
                          <p className="text-sm text-amber-600">{item.product.category?.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.quantity * item.price)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Total Breakdown */}
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
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
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-amber-600">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
