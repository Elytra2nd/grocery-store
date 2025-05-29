// resources/js/Pages/Admin/Products/Show.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps, Product } from '@/types';
import NoSidebarLayout from '@/Layouts/NoSidebarLayout';
import { ArrowLeftIcon, TagIcon } from '@heroicons/react/24/outline';

interface Props extends PageProps {
  product: Product & {
    category?: string;
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
    <NoSidebarLayout>
      <Head title={`Detail Produk: ${product.name}`} />
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center mb-8 text-amber-700 hover:text-amber-900 font-semibold transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Kembali ke Daftar Produk
        </Link>

        <div className="bg-white/90 shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row border border-amber-200 animate-fade-in">
          {/* Gambar produk */}
          <div className="md:w-1/2 h-80 md:h-auto bg-white flex items-center justify-center group relative">
            {product.image ? (
              <img
                src={`/storage/${product.image}`}
                alt={product.name}
                className="object-cover w-full h-full rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span className="text-amber-300 text-lg">Tidak ada gambar produk</span>
            )}
          </div>

          {/* Detail produk */}
          <div className="md:w-1/2 p-8 flex flex-col justify-center space-y-6">
            <h1 className="text-3xl font-extrabold text-amber-900 drop-shadow">{product.name}</h1>

            <div className="space-y-4 text-amber-800">
              <div>
                <h2 className="font-semibold text-amber-700 flex items-center gap-1">
                  <TagIcon className="w-5 h-5" />
                  Kategori
                </h2>
                <span className="inline-block mt-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold shadow-sm text-sm">
                  {product.category || '-'}
                </span>
              </div>

              <div>
                <h2 className="font-semibold text-amber-700">Deskripsi</h2>
                <p className="mt-1 whitespace-pre-line">{product.description || '-'}</p>
              </div>

              <div>
                <h2 className="font-semibold text-amber-700">Harga</h2>
                <p className="mt-1 font-bold text-xl text-amber-900">{formatCurrency(product.price)}</p>
              </div>

              <div>
                <h2 className="font-semibold text-amber-700">Stok</h2>
                <p className="mt-1">{product.stock ?? 0}</p>
              </div>

              <div>
                <h2 className="font-semibold text-amber-700">Status</h2>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full font-semibold text-sm shadow-sm
                  ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {product.is_active ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 0.7s;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(24px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </NoSidebarLayout>
  );
}
