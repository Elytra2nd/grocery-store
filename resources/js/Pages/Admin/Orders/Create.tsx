// resources/js/Pages/Admin/Orders/Create.tsx
import React, { useState, FormEvent } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps, Product, User } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    TrashIcon,
    UserIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline';

interface OrderItem {
    product_id: number;
    product: Product;
    quantity: number;
    price: number;
}

interface OrderFormData {
    user_id: number | null;
    order_items: OrderItem[];
    notes: string;
    shipping_address: string;
    status: string;
    [key: string]: any; // Added index signature for compatibility with FormDataType
}

interface Props extends PageProps {
    products: Product[];
    users: User[];
    statuses: Record<string, string>;
}

export default function OrdersCreate({ products, users, statuses }: Props): JSX.Element {
    const { data, setData, post, processing, errors } = useForm<OrderFormData>({
        user_id: null,
        order_items: [],
        notes: '',
        shipping_address: '',
        status: 'pending',
    }) as {
        data: OrderFormData;
        setData: <K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) => void;
        post: typeof router.post;
        processing: boolean;
        errors: Partial<Record<keyof OrderFormData, string>>;
    };

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [productSearch, setProductSearch] = useState<string>('');
    const [userSearch, setUserSearch] = useState<string>('');
    const [showProductModal, setShowProductModal] = useState<boolean>(false);
    const [showUserModal, setShowUserModal] = useState<boolean>(false);

    // Filter products based on search
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (product.category && String(product.category).toLowerCase().includes(productSearch.toLowerCase()))
    );

    // Filter users based on search
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    // Calculate total amount
    const totalAmount = data.order_items.reduce((total, item) => total + item.quantity * item.price, 0);

    const handleUserSelect = (user: User): void => {
        setSelectedUser(user);
        setData('user_id', user.id);
        setData('shipping_address', user.address || '');
        setShowUserModal(false);
        setUserSearch('');
    };

    const handleProductAdd = (product: Product): void => {
        const existingItem = data.order_items.find(item => item.product_id === product.id);

        if (existingItem) {
            const updatedItems = data.order_items.map(item =>
                item.product_id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
            setData('order_items', updatedItems);
        } else {
            const newItem: OrderItem = {
                product_id: product.id,
                product: product,
                quantity: 1,
                price: product.price,
            };
            setData('order_items', [...data.order_items, newItem]);
        }

        setShowProductModal(false);
        setProductSearch('');
    };

    const handleQuantityChange = (productId: number, quantity: number): void => {
        if (quantity <= 0) {
            handleRemoveItem(productId);
            return;
        }

        const updatedItems = data.order_items.map(item =>
            item.product_id === productId
                ? { ...item, quantity: quantity }
                : item
        );
        setData('order_items', updatedItems);
    };

    const handlePriceChange = (productId: number, price: number): void => {
        const updatedItems = data.order_items.map(item =>
            item.product_id === productId
                ? { ...item, price: price }
                : item
        );
        setData('order_items', updatedItems);
    };

    const handleRemoveItem = (productId: number): void => {
        const updatedItems = data.order_items.filter(item => item.product_id !== productId);
        setData('order_items', updatedItems);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        if (!data.user_id) {
            alert('Silakan pilih pelanggan terlebih dahulu');
            return;
        }

        if (data.order_items.length === 0) {
            alert('Silakan tambahkan minimal satu produk');
            return;
        }

        post('/admin/orders');
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-amber-900 leading-tight">
                    Pesanan
                </h2>
            }
        >
            <Head title="Buat Pesanan Baru" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center">
                            <Link
                                href="/admin/orders"
                                className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-150"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                                Kembali
                            </Link>
                        </div>
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                            Buat Pesanan Baru
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Buat pesanan manual untuk pelanggan
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Customer & Products */}
                            <div className="lg:col-span-2 space-y-6">
                                <CustomerSection
                                    selectedUser={selectedUser}
                                    onSelectUser={() => setShowUserModal(true)}
                                    error={errors.user_id}
                                />

                                <ProductsSection
                                    orderItems={data.order_items}
                                    onAddProduct={() => setShowProductModal(true)}
                                    onQuantityChange={handleQuantityChange}
                                    onPriceChange={handlePriceChange}
                                    onRemoveItem={handleRemoveItem}
                                    errors={errors}
                                />
                            </div>

                            {/* Right Column - Order Summary */}
                            <div className="space-y-6">
                                <OrderSummary
                                    orderItems={data.order_items}
                                    totalAmount={totalAmount}
                                    data={data}
                                    setData={setData}
                                    statuses={statuses}
                                    errors={errors}
                                />

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing || !data.user_id || data.order_items.length === 0}
                                    className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Membuat Pesanan...
                                        </>
                                    ) : (
                                        'Buat Pesanan'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modals */}
            {showUserModal && (
                <UserSelectionModal
                    users={filteredUsers}
                    searchValue={userSearch}
                    onSearchChange={setUserSearch}
                    onSelectUser={handleUserSelect}
                    onClose={() => setShowUserModal(false)}
                />
            )}

            {showProductModal && (
                <ProductSelectionModal
                    products={filteredProducts}
                    searchValue={productSearch}
                    onSearchChange={setProductSearch}
                    onSelectProduct={handleProductAdd}
                    onClose={() => setShowProductModal(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}

// Sub-components dengan proper TypeScript
interface CustomerSectionProps {
    selectedUser: User | null;
    onSelectUser: () => void;
    error?: string;
}

function CustomerSection({ selectedUser, onSelectUser, error }: CustomerSectionProps): JSX.Element {
    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Pilih Pelanggan
                </h3>

                {selectedUser ? (
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <UserIcon className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                    {selectedUser.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {selectedUser.email}
                                </div>
                                {selectedUser.phone && (
                                    <div className="text-sm text-gray-500">
                                        {selectedUser.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onSelectUser}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                            Ganti
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onSelectUser}
                        className="w-full flex justify-center items-center px-4 py-6 border-2 border-gray-300 border-dashed rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-400"
                    >
                        <UserIcon className="h-8 w-8 mr-2" />
                        Pilih Pelanggan
                    </button>
                )}

                {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
            </div>
        </div>
    );
}

interface ProductsSectionProps {
    orderItems: OrderItem[];
    onAddProduct: () => void;
    onQuantityChange: (productId: number, quantity: number) => void;
    onPriceChange: (productId: number, price: number) => void;
    onRemoveItem: (productId: number) => void;
    errors: Partial<Record<keyof OrderFormData, string>>;
}

function ProductsSection({
    orderItems,
    onAddProduct,
    onQuantityChange,
    onPriceChange,
    onRemoveItem,
    errors
}: ProductsSectionProps): JSX.Element {
    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Produk Pesanan
                    </h3>
                    <button
                        type="button"
                        onClick={onAddProduct}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Tambah Produk
                    </button>
                </div>

                {orderItems.length === 0 ? (
                    <div className="text-center py-6">
                        <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada produk</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Mulai dengan menambahkan produk ke pesanan.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orderItems.map((item) => (
                            <div key={item.product_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center flex-1">
                                    <div className="flex-shrink-0 h-16 w-16">
                                        {item.product.image ? (
                                            <img
                                                className="h-16 w-16 rounded-lg object-cover"
                                                src={`/storage/products/${item.product.image}`}
                                                alt={item.product.name}
                                            />
                                        ) : (
                                            <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                                <ShoppingCartIcon className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <div className="text-sm font-medium text-gray-900">
                                            {item.product.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Stok: {item.product.stock}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Kategori: {item.product.category ? String(item.product.category) : ''}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Qty</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={item.product.stock}
                                            value={item.quantity}
                                            onChange={(e) => onQuantityChange(item.product_id, parseInt(e.target.value) || 1)}
                                            className="mt-1 block w-16 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Harga</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.price}
                                            onChange={(e) => onPriceChange(item.product_id, parseFloat(e.target.value) || 0)}
                                            className="mt-1 block w-24 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Subtotal</label>
                                        <div className="mt-1 text-sm font-medium text-gray-900">
                                            Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => onRemoveItem(item.product_id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {errors.order_items && (
                    <p className="mt-2 text-sm text-red-600">{errors.order_items}</p>
                )}
            </div>
        </div>
    );
}

interface OrderSummaryProps {
    orderItems: OrderItem[];
    totalAmount: number;
    data: OrderFormData;
    setData: <K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) => void;
    statuses: Record<string, string>;
    errors: Partial<Record<keyof OrderFormData, string>>;
}

function OrderSummary({
    orderItems,
    totalAmount,
    data,
    setData,
    statuses,
    errors
}: OrderSummaryProps): JSX.Element {
    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Ringkasan Pesanan
                </h3>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Jumlah Item:</span>
                        <span className="font-medium">{orderItems.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Quantity:</span>
                        <span className="font-medium">
                            {orderItems.reduce((total, item) => total + item.quantity, 0)}
                        </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between">
                            <span className="text-base font-medium text-gray-900">Total:</span>
                            <span className="text-base font-medium text-gray-900">
                                Rp {totalAmount.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Status Pesanan
                        </label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            {Object.entries(statuses).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        {errors.status && (
                            <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Alamat Pengiriman
                        </label>
                        <textarea
                            rows={3}
                            value={data.shipping_address}
                            onChange={(e) => setData('shipping_address', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Masukkan alamat pengiriman..."
                        />
                        {errors.shipping_address && (
                            <p className="mt-1 text-sm text-red-600">{errors.shipping_address}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Catatan
                        </label>
                        <textarea
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Catatan tambahan untuk pesanan..."
                        />
                        {errors.notes && (
                            <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Modal Components
interface UserSelectionModalProps {
    users: User[];
    searchValue: string;
    onSearchChange: (value: string) => void;
    onSelectUser: (user: User) => void;
    onClose: () => void;
}

function UserSelectionModal({
    users,
    searchValue,
    onSearchChange,
    onSelectUser,
    onClose
}: UserSelectionModalProps): JSX.Element {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-96 overflow-y-auto">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Pilih Pelanggan
                    </h3>

                    <div className="mb-4">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Cari pelanggan..."
                                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {users.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => onSelectUser(user)}
                                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                {user.phone && (
                                    <div className="text-sm text-gray-500">{user.phone}</div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ProductSelectionModalProps {
    products: Product[];
    searchValue: string;
    onSearchChange: (value: string) => void;
    onSelectProduct: (product: Product) => void;
    onClose: () => void;
}

function ProductSelectionModal({
    products,
    searchValue,
    onSearchChange,
    onSelectProduct,
    onClose
}: ProductSelectionModalProps): JSX.Element {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-2xl shadow-lg rounded-md bg-white max-h-96 overflow-y-auto">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Pilih Produk
                    </h3>

                    <div className="mb-4">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Cari produk..."
                                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {products.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => onSelectProduct(product)}
                                disabled={product.stock === 0}
                                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-12 w-12">
                                        {product.image ? (
                                            <img
                                                className="h-12 w-12 rounded-lg object-cover"
                                                src={`/storage/products/${product.image}`}
                                                alt={product.name}
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                                <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <div className="font-medium text-gray-900">{product.name}</div>
                                        <div className="text-sm text-gray-500">
                                            Rp {product.price.toLocaleString('id-ID')} | Stok: {product.stock}
                                        </div>
                                        <div className="text-sm text-gray-500">{String(product.category ?? '')}</div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
