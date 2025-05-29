import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Product } from '@/types';
import { router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface ProductShowProps {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductShow({ product, relatedProducts }: ProductShowProps): JSX.Element {
    const { auth } = usePage<PageProps>().props;

    // Function untuk handle add to cart dengan auth check
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

    // PERBAIKI: Gunakan /cart/add bukan /cart/index
    router.post("/cart", {
        product_id: product.id,
        quantity: 1
    }, {
        onSuccess: () => {
            console.log('Produk berhasil ditambahkan ke keranjang');
        },
        onError: (errors) => {
            console.error('Error adding to cart:', errors);
        }
    });
};





    // Function untuk handle buy now dengan auth check dan redirect
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

        // Langsung buat order dan redirect ke products dengan notifikasi
        router.post('/buyer/orders/create', {
            product_id: product.id,
            quantity: 1,
            total_price: product.price
        }, {
            onSuccess: () => {
                // Redirect ke products dengan success message
                router.visit('/products');
            },
            onError: (errors) => {
                console.error('Error processing purchase:', errors);
            }
        });
    };

    return (
        <>
            <Head title={product.name} />

            <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-x-hidden flex flex-col">
                {/* Header / Navigation */}
                <nav className="w-full py-4 px-6 bg-transparent">
                    <div className="flex justify-between items-center max-w-7xl mx-auto">
                        <Link href="/" className="text-amber-400 text-2xl font-extrabold tracking-widest drop-shadow-lg">
                            NEO-Forest
                        </Link>
                        <div className="flex items-center gap-4">
                            {auth?.user ? (
                                <>
                                    <span className="items-center text-emerald-400 text-sm">
                                        Halo, {auth.user.name}!
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-gray-300 hover:text-amber-400 transition-colors font-medium"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                            <Link
                                href="/products"
                                className="text-gray-300 hover:text-amber-400 transition-colors font-medium flex items-center gap-2"
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
                                <div className="w-full max-w-lg aspect-square bg-gray-800/60 backdrop-blur-md rounded-3xl overflow-hidden border border-gray-700/50 shadow-2xl relative group transition-all duration-300">
                                    {product.image ? (
                                        <img
                                            src={`/storage/${product.image}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                                            <span className="text-amber-400 text-6xl font-extrabold tracking-widest">NEO</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent pointer-events-none" />
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="flex flex-col justify-center space-y-8 text-white">
                                {/* Category & Stock */}
                                <div className="flex flex-wrap justify-between items-start gap-4">
                                    <span className="text-xs md:text-sm font-medium text-amber-400 bg-amber-400/20 px-4 py-2 rounded-full border border-amber-400/30 shadow-sm">
                                        {product.category}
                                    </span>
                                    <span className={`text-xs md:text-sm font-semibold px-4 py-2 rounded-full shadow-sm ${product.stock > 0
                                        ? 'text-emerald-400 bg-emerald-400/20 border border-emerald-400/30'
                                        : 'text-rose-400 bg-rose-400/20 border border-rose-400/30'
                                        }`}>
                                        {product.stock > 0 ? `${product.stock} tersedia` : 'Stok habis'}
                                    </span>
                                </div>

                                {/* Product Name */}
                                <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-md">
                                    {product.name}
                                </h1>

                                {/* Price */}
                                <p className="text-2xl md:text-4xl font-bold text-amber-400 drop-shadow">
                                    Rp {product.price.toLocaleString('id-ID')}
                                </p>

                                {/* Description */}
                                <p className="text-base md:text-lg text-gray-300 leading-relaxed whitespace-pre-line">
                                    {product.description}
                                </p>

                                {/* Login Warning untuk Guest */}
                                {!auth?.user && (
                                    <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">🔐</span>
                                            <div>
                                                <p className="text-amber-300 font-medium">Login Diperlukan</p>
                                                <p className="text-amber-200 text-sm">
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
                                        className={`flex-1 font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 ${product.stock === 0
                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
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
                                        className={`flex-1 font-semibold px-8 py-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 ${product.stock === 0
                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                            : auth?.user
                                                ? 'bg-gray-800/60 backdrop-blur-md border border-gray-700/50 text-gray-300 hover:text-white hover:border-amber-400/40'
                                                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white hover:shadow-emerald-500/30'
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
                                <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-12 bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent tracking-wide drop-shadow">
                                    Produk Terkait
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {relatedProducts.map((relatedProduct) => (
                                        <Link
                                            key={relatedProduct.id}
                                            href={`/products/${relatedProduct.id}`}
                                            className="group bg-gray-800/60 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/50 hover:border-amber-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col"
                                        >
                                            {/* Related Product Image */}
                                            <div className="aspect-square overflow-hidden relative">
                                                {relatedProduct.image ? (
                                                    <img
                                                        src={`/storage/${relatedProduct.image}`}
                                                        alt={relatedProduct.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                                                        <span className="text-amber-400 text-2xl font-bold">NEO</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent" />
                                            </div>
                                            {/* Related Product Info */}
                                            <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                                                <h3 className="text-base md:text-lg font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                                                    {relatedProduct.name}
                                                </h3>
                                                <p className="text-lg md:text-xl font-bold text-amber-400">
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
                <footer className="w-full py-8 text-center text-gray-400 border-t border-gray-800/50 mt-auto">
                    <p>
                        © {new Date().getFullYear()} <span className="text-amber-400 font-semibold">Neo-Forest</span>. All rights reserved.
                    </p>
                </footer>
            </div>
        </>
    );
}
