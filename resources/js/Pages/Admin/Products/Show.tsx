// resources/js/Pages/Admin/Products/Show.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps, Product } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Props extends PageProps {
  product: Product;
}

export default function ProductsShow({ product }: Props): JSX.Element {
  return (
    <AuthenticatedLayout>
      <Head title={`Detail Produk: ${product.name}`} />

      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center mb-8 text-indigo-600 hover:text-indigo-900 font-semibold"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Kembali ke Daftar Produk
        </Link>

        <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col md:flex-row">
          {/* Gambar produk */}
          <div className="md:w-1/2 h-80 md:h-auto bg-gray-100 flex items-center justify-center">
            {product.image ? (
              <img
                src={`/storage/${product.image}`}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-gray-400 text-lg">Tidak ada gambar produk</span>
            )}
          </div>

          {/* Detail produk */}
          <div className="md:w-1/2 p-6 flex flex-col justify-center space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            <div className="text-gray-700 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-800">Deskripsi</h2>
                <p className="mt-1 whitespace-pre-line">{product.description || '-'}</p>
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">Kategori</h2>
                <p className="mt-1">{product.category || '-'}</p>
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">Harga</h2>
                <p className="mt-1">Rp {product.price?.toLocaleString() || '0'}</p>
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">Stok</h2>
                <p className="mt-1">{product.stock ?? 0}</p>
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">Status</h2>
                <p className={`mt-1 font-semibold ${
                  product.is_active ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.is_active ? 'Aktif' : 'Tidak Aktif'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
