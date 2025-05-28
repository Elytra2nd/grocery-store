// resources/js/Pages/Admin/Products/Create.tsx
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Props extends PageProps {
    categories: string[];
}

type ProductFormData = {
    name: string;
    description: string;
    price: string;
    stock: string;
    category: string;
    image: File | null;
    is_active: boolean;
    [key: string]: any;
};

export default function ProductsCreate({ categories }: Props): JSX.Element {
    const { data, setData, post, processing, errors } = useForm<ProductFormData>({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        image: null,
        is_active: true,
    }) as {
        data: ProductFormData;
        setData: (key: string, value: any) => void;
        post: (url: string, options?: object) => void;
        processing: boolean;
        errors: Record<string, string>;
    };

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0] || null;
        setData('image', file);

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        post('/admin/products', {
            forceFormData: true,
        });
    };

    const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        setData('category', e.target.value);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Produk" />

            <div className="py-8 min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
                    <div className="w-full max-w-2xl">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center">
                                <Link
                                    href={route('admin.products.index')}
                                    className="mr-4 inline-flex items-center text-sm text-amber-700 hover:text-amber-900 transition-colors duration-150"
                                >
                                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                                    Kembali
                                </Link>
                            </div>
                            <h2 className="text-2xl font-extrabold text-amber-900 sm:text-3xl">
                                Tambah Produk Baru
                            </h2>
                            <p className="mt-1 text-sm text-amber-700">
                                Lengkapi informasi produk yang akan dijual di toko Anda.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <ProductInfoSection
                                data={data}
                                setData={setData}
                                errors={errors}
                                categories={categories}
                                onCategoryChange={handleCategoryChange}
                            />

                            <ImageUploadSection
                                imagePreview={imagePreview}
                                onImageChange={handleImageChange}
                                error={errors.image}
                            />

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-amber-200">
                                <Link
                                    href={route('admin.products.index')}
                                    className="bg-white py-2 px-4 border border-amber-300 rounded-md shadow-sm text-sm font-medium text-amber-700 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-150"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-150"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan Produk'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// --- ProductInfoSection ---
interface ProductInfoSectionProps {
    data: ProductFormData;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
    categories: string[];
    onCategoryChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

function ProductInfoSection({
    data,
    setData,
    errors,
    categories,
    onCategoryChange
}: ProductInfoSectionProps): JSX.Element {
    return (
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-semibold text-amber-900">
                        Informasi Produk
                    </h3>
                    <p className="mt-1 text-sm text-amber-700">
                        Masukkan detail produk yang akan dijual di toko Anda.
                    </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6">
                            <label htmlFor="name" className="block text-sm font-medium text-amber-900">
                                Nama Produk <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md transition-all duration-200 focus:ring-amber-500 focus:border-amber-500 ${
                                    errors.name
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                        : 'border-amber-300'
                                }`}
                                placeholder="Contoh: Apel Fuji Premium"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div className="col-span-6">
                            <label htmlFor="description" className="block text-sm font-medium text-amber-900">
                                Deskripsi <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                rows={4}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md transition-all duration-200 focus:ring-amber-500 focus:border-amber-500 ${
                                    errors.description
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                        : 'border-amber-300'
                                }`}
                                placeholder="Jelaskan detail produk, kualitas, dan keunggulannya..."
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="price" className="block text-sm font-medium text-amber-900">
                                Harga (Rp) <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-amber-500 sm:text-sm">Rp</span>
                                </div>
                                <input
                                    type="number"
                                    id="price"
                                    min="0"
                                    step="0.01"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className={`block w-full pl-12 pr-12 sm:text-sm border rounded-md transition-all duration-200 focus:ring-amber-500 focus:border-amber-500 ${
                                        errors.price
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                            : 'border-amber-300'
                                    }`}
                                    placeholder="0"
                                />
                            </div>
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                            )}
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="stock" className="block text-sm font-medium text-amber-900">
                                Stok <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="stock"
                                min="0"
                                value={data.stock}
                                onChange={(e) => setData('stock', e.target.value)}
                                className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md transition-all duration-200 focus:ring-amber-500 focus:border-amber-500 ${
                                    errors.stock
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                        : 'border-amber-300'
                                }`}
                                placeholder="0"
                            />
                            {errors.stock && (
                                <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                            )}
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="category" className="block text-sm font-medium text-amber-900">
                                Kategori <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="category"
                                value={data.category}
                                onChange={onCategoryChange}
                                className={`mt-1 block w-full py-2 px-3 border bg-white rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                                    errors.category
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                        : 'border-amber-300'
                                }`}
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((category: string) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                                <option value="new">+ Kategori Baru</option>
                            </select>
                            {data.category === 'new' && (
                                <input
                                    type="text"
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="mt-2 block w-full shadow-sm sm:text-sm border-amber-300 rounded-md focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                                    placeholder="Masukkan kategori baru"
                                />
                            )}
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
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
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- ImageUploadSection ---
interface ImageUploadSectionProps {
    imagePreview: string | null;
    onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

function ImageUploadSection({ imagePreview, onImageChange, error }: ImageUploadSectionProps): JSX.Element {
    return (
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-semibold text-amber-900">
                        Gambar Produk
                    </h3>
                    <p className="mt-1 text-sm text-amber-700">
                        Upload gambar produk JPG, PNG, atau GIF (maks 2MB).
                        Gambar akan membantu pembeli mengenal produk Anda.
                    </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                        error ? 'border-red-300' : 'border-amber-300'
                    }`}>
                        <div className="space-y-1 text-center">
                            {imagePreview ? (
                                <div className="mb-4 flex flex-col items-center">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="mx-auto h-32 w-32 object-cover rounded-lg shadow-md transition-all duration-500"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        Preview gambar produk
                                    </p>
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
                                        onChange={onImageChange}
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
                    {error && (
                        <p className="mt-1 text-sm text-red-600">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
