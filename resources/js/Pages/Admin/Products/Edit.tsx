// resources/js/Pages/Admin/Products/Edit.tsx
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps, Product } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ArrowLeftIcon from '@heroicons/react/24/solid/esm/ArrowLeftIcon';

// Tambahkan interface Category jika belum ada
interface Category {
    id: number;
    name: string;
}

type ProductFormData = {
    name: string;
    description: string;
    price: number;
    stock: number;
    category_id: string;
    is_active: boolean;
    image?: File | null;
};

type StockUpdateData = {
    stock: number;
    action: 'set' | 'add' | 'subtract';
    reason: string;
};

interface Props extends PageProps {
    product: Product;
    categories: Category[]; // <-- array objek kategori
}

export default function Edit({ product, categories }: Props): JSX.Element {
    const { data, setData, put, processing, errors } = useForm<ProductFormData>({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        stock: product.stock || 0,
        category_id: product.category_id ? String(product.category_id) : '',
        is_active: product.is_active ?? true,
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
        put(`/admin/products/${product.id}`, {
            method: 'put',
        });
    };

    const handleStockUpdate = (): void => {
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

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-amber-900 leading-tight">
                    Produk
                </h2>
            }
        >
            <Head title={`Edit ${product.name}`} />

            <div className="py-8 min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
                    <div className="w-full max-w-2xl">
                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-extrabold text-amber-900 sm:text-3xl">
                                Edit Produk: {product.name}
                            </h2>
                            <p className="mt-1 text-sm text-amber-700">
                                Update informasi produk di toko Anda.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 transition-shadow duration-300 hover:shadow-lg">
                                <h3 className="text-lg font-semibold text-amber-900 mb-4">
                                    Informasi Produk
                                </h3>

                                <div className="grid grid-cols-6 gap-6">
                                    <div className="col-span-6">
                                        <label className="block text-sm font-medium text-amber-900">
                                            Nama Produk <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md transition-all duration-200 focus:ring-amber-500 focus:border-amber-500 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-amber-300'}`}
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>
                                    <div className="col-span-6">
                                        <label className="block text-sm font-medium text-amber-900">
                                            Deskripsi <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md transition-all duration-200 focus:ring-amber-500 focus:border-amber-500 ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-amber-300'}`}
                                            required
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                        )}
                                    </div>

                                    <div className="col-span-6 sm:col-span-3">
                                        <label className="block text-sm font-medium text-amber-900">
                                            Harga (Rp) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-amber-500 sm:text-sm">Rp</span>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.price}
                                                onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                                                className={`block w-full pl-12 pr-12 sm:text-sm border rounded-md transition-all duration-200 focus:ring-amber-500 focus:border-amber-500 ${errors.price ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-amber-300'}`}
                                                required
                                            />
                                        </div>
                                        {errors.price && (
                                            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                                        )}
                                    </div>

                                    <div className="col-span-6 sm:col-span-3">
                                        <label className="block text-sm font-medium text-amber-900">
                                            Stok <span className="text-red-500">*</span>
                                        </label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.stock}
                                                onChange={(e) => setData('stock', parseInt(e.target.value) || 0)}
                                                className={`flex-1 block w-full border rounded-l-md focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all duration-200 ${errors.stock ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-amber-300'}`}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowStockModal(true)}
                                                className="inline-flex items-center px-3 py-2 border border-l-0 border-amber-300 rounded-r-md bg-amber-50 text-amber-700 text-sm hover:bg-amber-100 transition-colors duration-150"
                                            >
                                                Update
                                            </button>
                                        </div>
                                        {errors.stock && (
                                            <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                                        )}
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <label className="block text-sm font-medium text-amber-900">
                                            Kategori <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.category_id}
                                            onChange={(e) => setData('category_id', e.target.value)}
                                            className={`mt-1 block w-full py-2 px-3 border bg-white rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${errors.category_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-amber-300'}`}
                                            required
                                        >
                                            <option value="">Pilih Kategori</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={String(cat.id)}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                                        )}
                                    </div>

                                    <div className="col-span-6 sm:col-span-3">
                                        <label className="block text-sm font-medium text-amber-900">
                                            Status Produk
                                        </label>
                                        <div className="mt-1">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_active}
                                                    onChange={(e) => setData('is_active', e.target.checked)}
                                                    className="rounded border-amber-300 text-amber-600 shadow-sm focus:border-amber-300 focus:ring focus:ring-amber-200 focus:ring-opacity-50 transition-all duration-200"
                                                />
                                                <span className="ml-2 text-sm text-amber-700">
                                                    Produk Aktif (dapat dilihat pembeli)
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="col-span-6">
                                        <label className="block text-sm font-medium text-amber-900">
                                            Gambar Produk
                                        </label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-amber-300 transition-all duration-200">
                                            <div className="space-y-1 text-center">
                                                {imagePreview ? (
                                                    <div className="mb-4">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            className="mx-auto h-32 w-32 object-cover rounded-lg shadow-md transition-all duration-500"
                                                        />
                                                    </div>
                                                ) : (
                                                    <svg
                                                        className="mx-auto h-12 w-12 text-amber-300"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        viewBox="0 0 48 48"
                                                    >
                                                        <path
                                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                            strokeWidth={2}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                )}
                                                <div className="flex text-sm text-gray-600">
                                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-amber-700 hover:text-amber-900 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500 transition-colors duration-150">
                                                        <span>{imagePreview ? 'Ganti gambar' : 'Upload gambar'}</span>
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
                                </div>
                            </div>
                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-amber-200">
                                <Link
                                    href="/admin/products"
                                    className="bg-white py-2 px-4 border border-amber-300 rounded-md shadow-sm text-sm font-medium text-amber-700 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-150"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-150"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Stock Update Modal */}
            {showStockModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-medium text-amber-900 mb-4">
                            Update Stok Produk
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-amber-900">
                                    Aksi
                                </label>
                                <select
                                    value={stockData.action}
                                    onChange={(e) => setStockData({
                                        ...stockData,
                                        action: e.target.value as 'set' | 'add' | 'subtract'
                                    })}
                                    className="mt-1 block w-full border-amber-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                >
                                    <option value="set">Set ke jumlah tertentu</option>
                                    <option value="add">Tambah stok</option>
                                    <option value="subtract">Kurangi stok</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-amber-900">
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
                                    className="mt-1 block w-full border-amber-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-amber-900">
                                    Alasan (Opsional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={stockData.reason}
                                    onChange={(e) => setStockData({
                                        ...stockData,
                                        reason: e.target.value
                                    })}
                                    className="mt-1 block w-full border-amber-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
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
                                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                            >
                                Update Stok
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
