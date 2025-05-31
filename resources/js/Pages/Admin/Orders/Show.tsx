import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminAuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Order, OrderItem, PageProps } from '@/types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface OrderShowProps extends PageProps {
  order: Order & {
    payment_method?: string;
    shipping_cost?: number;
    tax_amount?: number;
    tracking_number?: string;
    shipped_at?: string;
    delivered_at?: string;
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

// DITAMBAHKAN: Notification Modal Component
interface NotificationModalProps {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

function NotificationModal({ show, type, title, message, onClose }: NotificationModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!show) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-400',
          title: 'text-green-800',
          message: 'text-green-600',
          button: 'bg-green-100 hover:bg-green-200 text-green-800'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-400',
          title: 'text-red-800',
          message: 'text-red-600',
          button: 'bg-red-100 hover:bg-red-200 text-red-800'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          message: 'text-yellow-600',
          button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          message: 'text-blue-600',
          button: 'bg-blue-100 hover:bg-blue-200 text-blue-800'
        };
    }
  };

  const styles = getTypeStyles();

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleClose}
        />

        <div className={`inline-block align-bottom ${styles.bg} rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6 ${
          isVisible ? 'opacity-100 translate-y-0 sm:scale-100' : 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
        }`}>
          <div>
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${styles.bg} border ${styles.border}`}>
              <div className={styles.icon}>
                {getIcon()}
              </div>
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className={`text-lg leading-6 font-medium ${styles.title}`}>
                {title}
              </h3>
              <div className="mt-2">
                <p className={`text-sm ${styles.message}`}>
                  {message}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className={`inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors ${styles.button}`}
              onClick={handleClose}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// DITAMBAHKAN: Flash Message Hook
function useFlashMessage() {
  const { flash } = usePage().props as any;
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);

  React.useEffect(() => {
    if (flash?.success) {
      setNotification({
        type: 'success',
        title: 'Berhasil!',
        message: flash.success
      });
    } else if (flash?.error) {
      setNotification({
        type: 'error',
        title: 'Error!',
        message: flash.error
      });
    } else if (flash?.warning) {
      setNotification({
        type: 'warning',
        title: 'Peringatan!',
        message: flash.warning
      });
    } else if (flash?.info) {
      setNotification({
        type: 'info',
        title: 'Informasi',
        message: flash.info
      });
    }
  }, [flash]);

  const clearNotification = () => {
    setNotification(null);
  };

  return {
    notification,
    clearNotification
  };
}

export default function OrderShow({ order }: OrderShowProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const { notification, clearNotification } = useFlashMessage();

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

  // DIPERBAIKI: Hanya menggunakan status yang ada di ENUM
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-amber-50 text-amber-800 border-amber-200',
      processing: 'bg-orange-50 text-orange-800 border-orange-200',
      shipped: 'bg-blue-50 text-blue-800 border-blue-200',
      delivered: 'bg-green-50 text-green-800 border-green-200',
      cancelled: 'bg-red-50 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  // DIPERBAIKI: Icon hanya untuk status yang ada
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

  // DIPERBAIKI: Status update dengan Inertia response
  const handleQuickStatusUpdate = (newStatus: string) => {
    setIsLoading(true);
    router.patch(`/admin/orders/${order.id}/status`, {
      status: newStatus
    }, {
      onFinish: () => setIsLoading(false),
      preserveScroll: true,
      onSuccess: () => {
        // Success akan ditangani oleh flash message
      },
      onError: (errors) => {
        console.error('Error updating status:', errors);
      }
    });
  };

  const handlePrintOrder = () => {
    window.print();
  };

  // DIPERBAIKI: Handle image error
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

  return (
    <AdminAuthenticatedLayout>
      <Head title={`Pesanan #${order.order_number}`} />

      {/* DITAMBAHKAN: Notification Modal */}
      {notification && (
        <NotificationModal
          show={!!notification}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={clearNotification}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="py-8 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <Link
                    href="/admin/orders"
                    className="inline-flex items-center text-amber-700 hover:text-amber-900 font-medium transition-all duration-300 hover:translate-x-[-4px] group"
                  >
                    <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:translate-x-[-2px]" />
                    Kembali ke Daftar Pesanan
                  </Link>
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
                  <Link
                    href={`/admin/orders/${order.id}/edit`}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center px-4 py-2 bg-white border border-amber-300 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors duration-200 shadow-sm text-sm"
                  >
                    Dashboard
                  </Link>
                </div>
              </div>
              <div className="mt-4">
                <h1 className="text-3xl font-light text-amber-900">
                  Pesanan #{order.order_number}
                </h1>
                <p className="mt-1 text-sm text-amber-700">
                  {formatDate(order.created_at)}
                </p>
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
                        {/* DIPERBAIKI: Hanya menggunakan status yang ada di ENUM */}
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleQuickStatusUpdate(status)}
                            disabled={isLoading || order.status === status}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors duration-200 ${
                              order.status === status
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isLoading ? (
                              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                              </svg>
                            ) : (
                              status.charAt(0).toUpperCase() + status.slice(1)
                            )}
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
                          <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border border-amber-200 relative">
                            {item.product?.image ? (
                              <>
                                <img
                                  src={item.product.image}
                                  alt={item.product?.name || 'Product'}
                                  className="w-full h-full object-cover"
                                  onError={handleImageError}
                                />
                                <div className="image-fallback absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center" style={{ display: 'none' }}>
                                  <span className="text-amber-600 text-2xl">🛒</span>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                <span className="text-amber-600 text-2xl">🛒</span>
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

              {/* Sidebar Info */}
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
      </div>
    </AdminAuthenticatedLayout>
  );
}
