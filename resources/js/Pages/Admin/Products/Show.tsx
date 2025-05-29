import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps, Product } from '@/types';
import { ArrowLeftIcon, TagIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface Props extends PageProps {
  product: Product & {
    category?: {
      id: number;
      name: string;
    };
  };
}

export default function ProductsShow({ product }: Props): JSX.Element {
  const formatCurrency = (amount?: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount ?? 0);

  return (
    <>
      <Head title={`Detail Produk: ${product.name}`} />

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Main Content */}
        <div className="py-8 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            {/* Back Button */}
            <div className="mb-6">
              <Link
                href="/admin/products"
                className="inline-flex items-center text-amber-700 hover:text-amber-900 font-medium transition-all duration-300 hover:translate-x-[-4px] group"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:translate-x-[-2px]" />
                Kembali ke Daftar Produk
              </Link>
            </div>

            {/* Product Detail Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-amber-300/50 overflow-hidden transition-all duration-500 hover:shadow-2xl animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Product Image */}
                <div className="relative bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-6 group">
                  <div className="w-full max-w-xs aspect-square rounded-xl overflow-hidden border border-amber-300/50 bg-white shadow-lg transition-all duration-500 group-hover:shadow-xl group-hover:border-amber-400">
                    {product.image ? (
                      <img
                        src={`/storage/products/${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    {/* Fallback placeholder */}
                    <div className={`w-full h-full bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                      <div className="text-center">
                        <svg className="w-16 h-16 text-amber-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-amber-600 text-sm font-medium">Tidak ada gambar</p>
                      </div>
                    </div>
                  </div>
                  {/* Sparkles effect */}
                  <SparklesIcon className="absolute top-4 right-4 w-5 h-5 text-amber-400 animate-pulse" />
                </div>

                {/* Product Details */}
                <div className="p-6 space-y-5 bg-gradient-to-br from-white to-amber-50/30">
                  {/* Product Name */}
                  <div className="animate-fade-in-right">
                    <h1 className="text-2xl font-light text-amber-900 mb-2 bg-gradient-to-r from-amber-900 to-orange-800 bg-clip-text text-transparent">
                      {product.name}
                    </h1>
                    <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
                  </div>

                  {/* Category */}
                  <div className="animate-fade-in-right delay-100">
                    <h2 className="text-xs font-medium text-amber-700 mb-2 flex items-center gap-2">
                      <TagIcon className="w-4 h-4" />
                      Kategori
                    </h2>
                    <span className="inline-block px-3 py-1 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm font-medium border border-amber-300/50">
                      {product.category?.name || 'Tidak ada kategori'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="animate-fade-in-right delay-200">
                    <h2 className="text-xs font-medium text-amber-700 mb-2">Harga</h2>
                    <p className="text-2xl font-bold text-amber-900 bg-gradient-to-r from-amber-900 to-orange-800 bg-clip-text text-transparent">
                      {formatCurrency(product.price)}
                    </p>
                  </div>

                  {/* Stock */}
                  <div className="animate-fade-in-right delay-300">
                    <h2 className="text-xs font-medium text-amber-700 mb-2">Stok</h2>
                    <div className="flex items-center space-x-3">
                      <span className="text-xl font-bold text-gray-900">{product.stock ?? 0}</span>
                      {(product.stock ?? 0) < 10 && (product.stock ?? 0) > 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full border border-yellow-200">
                          Stok Rendah
                        </span>
                      )}
                      {(product.stock ?? 0) === 0 && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full border border-red-200">
                          Habis
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="animate-fade-in-right delay-400">
                    <h2 className="text-xs font-medium text-amber-700 mb-2">Status</h2>
                    <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium border ${
                      product.is_active
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {product.is_active ? '✅ Aktif' : '❌ Tidak Aktif'}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="animate-fade-in-right delay-500">
                    <h2 className="text-xs font-medium text-amber-700 mb-2">Deskripsi</h2>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-amber-200/50 max-h-24 overflow-y-auto">
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                        {product.description || 'Tidak ada deskripsi'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-amber-100 flex flex-wrap gap-3 animate-fade-in-right delay-600">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                    <Link
                      href="/admin/products/create"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Tambah Baru
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.5s ease-out;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </>
  );
}
