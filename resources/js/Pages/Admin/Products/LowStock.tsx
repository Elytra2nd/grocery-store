import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, Product, PaginatedData } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Props extends PageProps {
    products: PaginatedData<Product>;
    error?: string;
}

export default function LowStockProducts({ products, error }: Props): JSX.Element {
    return (
        <AuthenticatedLayout>
            <Head title="Produk Stok Rendah" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Produk Stok Rendah</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="overflow-x-auto bg-white shadow rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.data.length > 0 ? (
                                products.data.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">{product.stock}</td>
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

                            // Ganti label Previous dan Next dengan bahasa Indonesia
                            if (label === '&laquo; Previous') label = 'Sebelumnya';
                            else if (label === 'Next &raquo;') label = 'Selanjutnya';

                            // Jika label adalah angka, tampilkan angka saja
                            // Kalau bukan angka (Previous/Next), tampilkan label seperti biasa
                            const isPageNumber = !isNaN(Number(label));

                            return (
                                <button
                                    key={i}
                                    onClick={() => link.url && router.visit(link.url)}
                                    disabled={!link.url}
                                    className={`px-3 py-1 rounded border text-sm font-medium ${
                                        link.active
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                    }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <Link
                        href="/admin/products"
                        className="text-indigo-600 hover:underline text-sm"
                    >
                        ← Kembali ke Daftar Produk
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
