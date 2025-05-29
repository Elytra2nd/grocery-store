import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, Product, PaginatedData } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Category {
    id: number;
    name: string;
}

interface ProductWithCategory extends Product {
    category?: Category | null;
}

interface Props extends PageProps {
    products: PaginatedData<ProductWithCategory>;
    error?: string;
}

export default function LowStockProducts({ products, error }: Props): JSX.Element {
    return (
        <AuthenticatedLayout>
            <Head title="Produk Stok Rendah" />

            <div className="py-8 min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-extrabold text-amber-900 mb-6 animate-fade-in-down">
                        Produk Stok Rendah
                    </h1>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-fade-in-up">
                            {error}
                        </div>
                    )}

                    <div className="overflow-x-auto bg-white shadow rounded-lg animate-fade-in-up">
                        <table className="min-w-full divide-y divide-amber-100">
                            <thead className="bg-amber-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">Nama Produk</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">Stok</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-amber-100">
                                {products.data.length > 0 ? (
                                    products.data.map((product) => (
                                        <tr key={product.id} className="hover:bg-amber-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-900">{product.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700">
                                                {product.category?.name || 'Tidak ada kategori'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow ${
                                                    product.stock === 0
                                                        ? 'bg-red-100 text-red-800 animate-pulse'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center px-6 py-4 text-sm text-gray-500">Tidak ada produk dengan stok rendah.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {products.links.length > 1 && (
                        <div className="mt-4 flex justify-center gap-2">
                            {products.links.map((link, i) => {
                                let label = link.label;
                                if (label === '&laquo; Previous') label = 'Sebelumnya';
                                else if (label === 'Next &raquo;') label = 'Selanjutnya';
                                return (
                                    <button
                                        key={i}
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url}
                                        className={`px-3 py-1 rounded border text-sm font-medium transition-all duration-150 ${
                                            link.active
                                                ? 'bg-amber-600 text-white border-amber-600 shadow'
                                                : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
