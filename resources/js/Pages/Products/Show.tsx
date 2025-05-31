import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Product, PageProps } from '@/types';

interface ProductShowProps {
    product: Product;
    relatedProducts: Product[];
    cartItemId?: number; // Tambahan opsional jika ingin checkout 1 produk saja
}

export default function ProductShow({ product, relatedProducts, cartItemId }: ProductShowProps): JSX.Element {
    const { auth } = usePage<PageProps>().props;

    // Handler: Tambah ke Keranjang
    const handleAddToCart = () => {
        if (!auth?.user) {
            const currentUrl = window.location.href;
            sessionStorage.setItem('redirect_after_login', currentUrl);

            router.visit('/login', {
                data: {
                    message: 'Silakan login terlebih dahulu untuk menambahkan produk ke keranjang'
                }
            });
            return;
        }

        router.post("/cart/add", {
            product_id: product.id,
            quantity: 1
        }, {
            onSuccess: () => {
                // Anda bisa menampilkan notifikasi di sini
                // Contoh: toast.success('Berhasil ditambahkan ke keranjang');
            },
            onError: (errors) => {
                console.error('Error adding to cart:', errors);
            }
        });
    };

    // Handler: Beli Sekarang
    const handleBuyNow = () => {
        if (!auth?.user) {
            const currentUrl = window.location.href;
            sessionStorage.setItem('redirect_after_login', currentUrl);

            router.visit('/login', {
                data: {
                    message: 'Silakan login terlebih dahulu untuk melakukan pembelian'
                }
            });
            return;
        }

        // Langsung redirect ke halaman checkout (bukan POST order langsung)
        // Jika ingin checkout hanya produk ini, pastikan produk sudah ada di cart dan gunakan cartItemId
        router.post("/buy-now", {
            product_id: product.id,
            quantity: 1
        }, {
            onSuccess: () => {
                // Redirect akan ditangani oleh backend
            },
            onError: (errors) => {
                console.error('Error buy now:', errors);
            }
        });
    };

    return (
        <>
            <Head title={product.name} />

            <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 overflow-x-hidden flex flex-col">
                {/* Header / Navigation */}
                <nav className="w-full py-4 px-6 bg-white/80 backdrop-blur-md border-b border-amber-200/50 shadow-sm">
                    <div className="flex justify-between items-center max-w-7xl mx-auto">
                        <Link href="/" className="text-amber-600 text-2xl font-extrabold tracking-widest drop-shadow-lg hover:text-amber-700 transition-colors">
                            Fresh Market
                        </Link>
                        <div className="flex items-center gap-4">
                            {auth?.user ? (
                                <span className="items-center text-amber-700 text-sm font-medium">
                                    Halo, {auth.user.name}!
                                </span>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-amber-700 hover:text-amber-600 transition-colors font-medium"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                            <Link
                                href="/products"
                                className="text-amber-700 hover:text-amber-600 transition-colors font-medium flex items-center gap-2 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-lg border border-amber-200"
                            >
                                <span className="text-xl">←</span>
                                <span>Kembali ke Produk</span>
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 w-full py-8 px-4 md:px-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Product Detail Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
                            {/* Product Image */}
                            <div className="flex items-center justify-center">
                                <div className="w-full max-w-lg aspect-square bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden border-2 border-amber-200 shadow-2xl relative group transition-all duration-300 hover:shadow-amber-500/20">
                                    {product.image ? (
                                        <img
                                            src={`/storage/products/${product.image}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : null}
                                    {/* Fallback placeholder */}
                                    <div className={`w-full h-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                                        <div className="text-center">
                                            <svg className="w-16 h-16 text-amber-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                            <span className="text-amber-700 text-xl font-bold">Fresh Market</span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 via-transparent to-transparent pointer-events-none" />
                                </div>
                            </div>
                            {/* Product Details */}
                            <div className="flex flex-col justify-center space-y-8 text-amber-900">
                                {/* Category & Stock */}
                                <div className="flex flex-wrap justify-between items-start gap-4">
                                    <span className="text-xs md:text-sm font-medium text-amber-700 bg-amber-100 px-4 py-2 rounded-full border border-amber-200 shadow-sm">
                                        {product.category?.name || 'No Category'}
                                    </span>
                                    <span className={`text-xs md:text-sm font-semibold px-4 py-2 rounded-full shadow-sm ${product.stock > 0
                                        ? 'text-green-700 bg-green-100 border border-green-200'
                                        : 'text-red-700 bg-red-100 border border-red-200'
                                        }`}>
                                        {product.stock > 0 ? `${product.stock} tersedia` : 'Stok habis'}
                                    </span>
                                </div>

                                {/* Product Name */}
                                <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent drop-shadow-md">
                                    {product.name}
                                </h1>

                                {/* Price */}
                                <p className="text-2xl md:text-4xl font-bold text-amber-700 drop-shadow">
                                    Rp {product.price.toLocaleString('id-ID')}
                                </p>

                                {/* Description */}
                                <p className="text-base md:text-lg text-amber-800 leading-relaxed whitespace-pre-line bg-white/60 backdrop-blur-md p-4 rounded-xl border border-amber-200">
                                    {product.description}
                                </p>

                                {/* Login Warning untuk Guest */}
                                {!auth?.user && (
                                    <div className="bg-amber-100 border-2 border-amber-300 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">🔐</span>
                                            <div>
                                                <p className="text-amber-700 font-semibold">Login Diperlukan</p>
                                                <p className="text-amber-600 text-sm">
                                                    Silakan login terlebih dahulu untuk menambahkan ke keranjang atau melakukan pembelian
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        disabled={product.stock === 0}
                                        className={`flex-1 font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transform hover:-translate-y-0.5 ${product.stock === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : auth?.user
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:shadow-amber-500/30'
                                                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-blue-500/30'
                                            }`}
                                    >
                                        {product.stock === 0
                                            ? 'Stok Habis'
                                            : auth?.user
                                                ? 'Tambah ke Keranjang'
                                                : 'Login untuk Beli'
                                        }
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleBuyNow}
                                        disabled={product.stock === 0}
                                        className={`flex-1 font-semibold px-8 py-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 transform hover:-translate-y-0.5 ${product.stock === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : auth?.user
                                                ? 'bg-white/80 backdrop-blur-md border-2 border-amber-300 text-amber-700 hover:text-amber-800 hover:border-amber-400 hover:shadow-lg'
                                                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:shadow-green-500/30'
                                            }`}
                                    >
                                        {product.stock === 0
                                            ? 'Tidak Tersedia'
                                            : auth?.user
                                                ? 'Beli Sekarang'
                                                : 'Login untuk Beli'
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Related Products Section */}
                        {relatedProducts && relatedProducts.length > 0 && (
                            <section className="w-full py-12">
                                <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-12 bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-600 bg-clip-text text-transparent tracking-wide drop-shadow">
                                    Produk Terkait
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {relatedProducts.map((relatedProduct) => (
                                        <Link
                                            key={relatedProduct.id}
                                            href={`/products/${relatedProduct.id}`}
                                            className="group bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/20 flex flex-col transform hover:-translate-y-1"
                                        >
                                            {/* Related Product Image */}
                                            <div className="aspect-square overflow-hidden relative">
                                                {relatedProduct.image ? (
                                                    <img
                                                        src={`/storage/products/${relatedProduct.image}`}
                                                        alt={relatedProduct.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`w-full h-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center ${relatedProduct.image ? 'hidden' : ''}`}>
                                                    <div className="text-center">
                                                        <svg className="w-12 h-12 text-amber-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                        </svg>
                                                        <span className="text-amber-700 text-sm font-bold">Fresh</span>
                                                    </div>
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 via-transparent to-transparent" />
                                            </div>
                                            {/* Related Product Info */}
                                            <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                                                <h3 className="text-base md:text-lg font-bold text-amber-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                                                    {relatedProduct.name}
                                                </h3>
                                                <p className="text-lg md:text-xl font-bold text-amber-700">
                                                    Rp {relatedProduct.price.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </main>

                {/* Footer */}
                <footer className="w-full py-8 text-center text-amber-600 border-t border-amber-200/50 mt-auto bg-white/60 backdrop-blur-md">
                    <p>
                        © {new Date().getFullYear()} <span className="text-amber-700 font-semibold">Fresh Market Collection</span>. All rights reserved.
                    </p>
                </footer>
            </div>

            {/* Custom Styles */}
            <style>{`
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </>
    );
}
