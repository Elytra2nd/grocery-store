// resources/js/Pages/Admin/Products/Edit.tsx
import React, { useState, FormEvent } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps, Product } from '@/types'; // Import ProductFormData

// Define ProductFormData here to ensure all keys are present and types are correct
type ProductFormData = {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    is_active: boolean;
    image?: File | null;
};
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';

// Define StockUpdateData type
type StockUpdateData = {
    stock: number;
    action: 'set' | 'add' | 'subtract';
    reason: string;
};

interface Props extends PageProps {
    product: Product;
    categories: string[];
}

export default function Edit({ product, categories }: Props): JSX.Element {
    // PERBAIKAN: ProductFormData sekarang compatible dengan useForm
    const { data, setData, put, processing, errors } = useForm<ProductFormData>({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        stock: product.stock || 0,
        category: product.category || '',
        is_active: product.is_active || false,
    });

    const [stockData, setStockData] = useState<StockUpdateData>({
        stock: 0,
        action: 'set',
        reason: '',
    });

    const [showStockModal, setShowStockModal] = useState<boolean>(false);
    const [imagePreview, setImagePreview] = useState<string | null>(
        product.image ? `/storage/products/${product.image}` : null
    );

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        // Use direct URL instead of route helper
        put(`/admin/products/${product.id}`, {
            method: 'put',
            onSuccess: () => {
                // Handle success
            }
        });
    };

    const handleStockUpdate = (): void => {
        // Use direct URL instead of route helper
        router.patch(`/admin/products/${product.id}/stock`, {
            stock: stockData.stock,
            action: stockData.action,
            reason: stockData.reason,
        }, {
            onSuccess: () => {
                setShowStockModal(false);
                setStockData({ stock: 0, action: 'set', reason: '' });
            }
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit ${product.name}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center">
                            <Link
                                href="/admin/products"
                                className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-150"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                                Kembali
                            </Link>
                        </div>
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                            Edit Produk: {product.name}
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Update informasi produk
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                            Informasi Produk
                                        </h3>

                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Nama Produk
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    required
                                                />
                                                {errors.name && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Deskripsi
                                                </label>
                                                <textarea
                                                    rows={4}
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    required
                                                />
                                                {errors.description && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Harga (Rp)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={data.price}
                                                        onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        required
                                                    />
                                                    {errors.price && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Stok
                                                    </label>
                                                    <div className="mt-1 flex rounded-md shadow-sm">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={data.stock}
                                                            onChange={(e) => setData('stock', parseInt(e.target.value) || 0)}
                                                            className="flex-1 block w-full border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowStockModal(true)}
                                                            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                                                        >
                                                            Update
                                                        </button>
                                                    </div>
                                                    {errors.stock && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Kategori
                                                </label>
                                                <select
                                                    value={data.category}
                                                    onChange={(e) => setData('category', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    required
                                                >
                                                    <option value="">Pilih Kategori</option>
                                                    {categories.map((category) => (
                                                        <option key={category} value={category}>
                                                            {category}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.category && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Gambar Produk
                                                </label>
                                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                                    <div className="space-y-1 text-center">
                                                        {imagePreview ? (
                                                            <div className="mb-4">
                                                                <img
                                                                    src={imagePreview}
                                                                    alt="Preview"
                                                                    className="mx-auto h-32 w-32 object-cover rounded-lg"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                        )}
                                                        <div className="flex text-sm text-gray-600">
                                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                                <span>Upload gambar</span>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={handleImageChange}
                                                                    className="sr-only"
                                                                />
                                                            </label>
                                                            <p className="pl-1">atau drag and drop</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            PNG, JPG, GIF hingga 2MB
                                                        </p>
                                                    </div>
                                                </div>
                                                {errors.image && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_active}
                                                    onChange={(e) => setData('is_active', e.target.checked)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label className="ml-2 block text-sm text-gray-900">
                                                    Produk Aktif
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex justify-end space-x-3">
                                    <Link
                                        href="/admin/products"
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Product Info */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        Info Produk
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm text-gray-500">ID Produk:</span>
                                            <span className="ml-2 text-sm font-medium text-gray-900">
                                                #{product.id}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Dibuat:</span>
                                            <span className="ml-2 text-sm font-medium text-gray-900">
                                                {new Date(product.created_at).toLocaleDateString('id-ID')}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Diperbarui:</span>
                                            <span className="ml-2 text-sm font-medium text-gray-900">
                                                {new Date(product.updated_at).toLocaleDateString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        Aksi Cepat
                                    </h3>
                                    <div className="space-y-3">
                                        <Link
                                            href={`/admin/products/${product.id}`}
                                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Lihat Produk
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => setShowStockModal(true)}
                                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Update Stok
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stock Update Modal */}
            {showStockModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Update Stok Produk
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Aksi
                                    </label>
                                    <select
                                        value={stockData.action}
                                        onChange={(e) => setStockData({
                                            ...stockData,
                                            action: e.target.value as 'set' | 'add' | 'subtract'
                                        })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="set">Set ke jumlah tertentu</option>
                                        <option value="add">Tambah stok</option>
                                        <option value="subtract">Kurangi stok</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Jumlah
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={stockData.stock}
                                        onChange={(e) => setStockData({
                                            ...stockData,
                                            stock: parseInt(e.target.value) || 0
                                        })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Alasan (Opsional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={stockData.reason}
                                        onChange={(e) => setStockData({
                                            ...stockData,
                                            reason: e.target.value
                                        })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Alasan update stok..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowStockModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleStockUpdate}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Update Stok
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
