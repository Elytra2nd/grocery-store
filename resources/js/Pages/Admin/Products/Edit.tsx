// resources/js/Pages/Admin/Products/Edit.tsx
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps, Product } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Props extends PageProps {
    product: Product;
    categories: string[];
}

// Gunakan type alias yang sama seperti di Create.tsx
type ProductFormData = {
    name: string;
    description: string;
    price: string;
    stock: string;
    category: string;
    image: File | null;
    is_active: boolean;
    _method: string;
    [key: string]: any; // Index signature untuk kompatibilitas InertiaJS
};

export default function ProductsEdit({ product, categories }: Props): JSX.Element {
    // Perbaiki useForm dengan type assertion yang sama seperti Create.tsx
    const { data, setData, post, processing, errors } = useForm<ProductFormData>({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        category: product.category || '',
        image: null,
        is_active: product.is_active || false,
        _method: 'PUT',
    }) as {
        data: ProductFormData;
        setData: (key: string, value: any) => void;
        post: (url: string, options?: object) => void;
        processing: boolean;
        errors: Record<string, string>;
    };

    const [imagePreview, setImagePreview] = useState<string | null>(
        product.image ? `/storage/${product.image}` : null
    );
    const [showStockModal, setShowStockModal] = useState<boolean>(false);
    const [stockAction, setStockAction] = useState<string>('set');
    const [stockAmount, setStockAmount] = useState<string>('');

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0] || null;
        setData('image', file);

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setImagePreview(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(product.image ? `/storage/${product.image}` : null);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        // Gunakan POST dengan _method untuk spoofing PUT dan forceFormData untuk file upload
        post(route('admin.products.update', product.id), {
            forceFormData: true, // Penting untuk file upload
        });
    };

    const handleStockUpdate = (): void => {
        if (!stockAmount) return;

        router.patch(route('admin.products.update-stock', product.id), {
            action: stockAction,
            stock: parseInt(stockAmount),
        }, {
            onSuccess: () => {
                setShowStockModal(false);
                setStockAmount('');
            }
        });
    };

    const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        setData('category', e.target.value);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Produk - ${product.name}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Link
                                    href={route('admin.products.index')}
                                    className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-150"
                                >
                                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                                    Kembali
                                </Link>
                            </div>
                            <div className="flex space-x-3">
                                <Link
                                    href={route('admin.products.show', product.id)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Lihat Detail
                                </Link>
                                <button
                                    onClick={() => setShowStockModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                                >
                                    Update Stok
                                </button>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                            Edit Produk: {product.name}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            ID: {product.id} | Dibuat: {new Date(product.created_at).toLocaleDateString('id-ID')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            data={data}
                        />

                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                            <Link
                                href={route('admin.products.index')}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150"
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
                                    'Update Produk'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Stock Management Modal */}
            {showStockModal && (
                <StockModal
                    product={product}
                    stockAction={stockAction}
                    setStockAction={setStockAction}
                    stockAmount={stockAmount}
                    setStockAmount={setStockAmount}
                    onUpdate={handleStockUpdate}
                    onClose={() => setShowStockModal(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}

// Sub-components (sama seperti Create.tsx)
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
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Informasi Produk
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Update detail produk yang akan dijual.
                    </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nama Produk <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                    errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                }`}
                                placeholder="Masukkan nama produk"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div className="col-span-6">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Deskripsi <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                rows={4}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                    errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                }`}
                                placeholder="Masukkan deskripsi produk"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                Harga (Rp) <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">Rp</span>
                                </div>
                                <input
                                    type="number"
                                    id="price"
                                    min="0"
                                    step="0.01"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-md ${
                                        errors.price ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                    }`}
                                    placeholder="0"
                                />
                            </div>
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                            )}
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                                Stok Saat Ini <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="stock"
                                min="0"
                                value={data.stock}
                                onChange={(e) => setData('stock', e.target.value)}
                                className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                                    errors.stock ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                }`}
                                placeholder="0"
                            />
                            {errors.stock && (
                                <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                            )}
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Kategori <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="category"
                                value={data.category}
                                onChange={onCategoryChange}
                                className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                    errors.category ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
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
                                    className="mt-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Masukkan kategori baru"
                                />
                            )}
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                            )}
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Status Produk
                            </label>
                            <div className="mt-1">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">
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

interface ImageUploadSectionProps {
    imagePreview: string | null;
    onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    data: ProductFormData;
}

function ImageUploadSection({ imagePreview, onImageChange, error, data }: ImageUploadSectionProps): JSX.Element {
    return (
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Gambar Produk
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Upload gambar baru atau biarkan kosong untuk mempertahankan gambar saat ini.
                    </p>
                </div>
                <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                        error ? 'border-red-300' : 'border-gray-300'
                    }`}>
                        <div className="space-y-1 text-center">
                            {imagePreview ? (
                                <div className="mb-4">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="mx-auto h-32 w-32 object-cover rounded-lg shadow-md"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        {data.image ? 'Gambar baru dipilih' : 'Gambar saat ini'}
                                    </p>
                                </div>
                            ) : (
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
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
                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
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

interface StockModalProps {
    product: Product;
    stockAction: string;
    setStockAction: (action: string) => void;
    stockAmount: string;
    setStockAmount: (amount: string) => void;
    onUpdate: () => void;
    onClose: () => void;
}

function StockModal({
    product,
    stockAction,
    setStockAction,
    stockAmount,
    setStockAmount,
    onUpdate,
    onClose
}: StockModalProps): JSX.Element {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Kelola Stok Produk
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Stok Saat Ini: <span className="font-bold text-indigo-600">{product.stock}</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Aksi
                            </label>
                            <select
                                value={stockAction}
                                onChange={(e) => setStockAction(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="set">Set stok menjadi</option>
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
                                value={stockAmount}
                                onChange={(e) => setStockAmount(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Masukkan jumlah"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-150"
                            >
                                Batal
                            </button>
                            <button
                                onClick={onUpdate}
                                disabled={!stockAmount}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150"
                            >
                                Update Stok
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
