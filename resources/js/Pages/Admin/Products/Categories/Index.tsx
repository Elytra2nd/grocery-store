import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ChevronRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Category {
  id: number;
  name: string;
}

interface Props extends PageProps {
  categories: Category[];
}

export default function CategoriesIndex({ categories }: Props) {
  return (
    <>
      <Head title="Kategori Produk" />
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm mb-4" aria-label="Breadcrumb">
          <Link href="/admin/products" className="text-amber-700 hover:underline font-semibold flex items-center">
            Produk
          </Link>
          <ChevronRightIcon className="w-4 h-4 mx-1 text-amber-400" />
          <span className="text-amber-900 font-bold">Kategori</span>
        </nav>

        {/* Tombol Kembali */}
        <div className="mb-2">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200 transition-all duration-150 font-semibold"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Kembali ke Produk
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-extrabold text-amber-900">Daftar Kategori</h1>
          <Link
            href="/admin/products/categories/create"
            className="bg-amber-600 text-white px-4 py-2 rounded-xl shadow hover:bg-amber-700 transition-all duration-150 font-semibold"
          >
            + Tambah Kategori
          </Link>
        </div>
        <div className="bg-white shadow overflow-x-auto sm:rounded-lg border border-amber-100">
          <table className="min-w-full divide-y divide-amber-100">
            <thead className="bg-amber-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-amber-50">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center px-6 py-4 text-amber-400">
                    Tidak ada kategori.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-amber-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-amber-900 font-medium">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/products/categories/${category.id}/edit`}
                        className="inline-block px-4 py-2 text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 hover:text-amber-900 transition-all duration-150 font-semibold"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
