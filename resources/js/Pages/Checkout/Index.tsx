import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import BuyerAuthenticatedLayout from '@/Layouts/BuyerAuthenticatedLayout';

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image?: string;
  };
}

interface CheckoutProps {
  cartItems: CartItem[];
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
}

export default function CheckoutPage({ cartItems, auth }: CheckoutProps): JSX.Element {
  const [address, setAddress] = useState('');
  const { post, processing, errors } = useForm();

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    post('/checkout', {
      address,
    });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <BuyerAuthenticatedLayout
      header={
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-yellow-800">Checkout</h2>
          <Link href="/cart" className="text-yellow-600 hover:text-yellow-800 text-sm">
            &larr; Kembali ke Keranjang
          </Link>
        </div>
      }
    >
      <Head title="Checkout" />

      <div className="py-12 max-w-4xl mx-auto space-y-8">
        {/* Cart Summary */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h3>
          {cartItems.length === 0 ? (
            <p className="text-gray-600">Keranjang Anda kosong.</p>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">x {item.quantity}</p>
                  </div>
                  <p className="text-sm text-gray-700">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </li>
              ))}
              <li className="flex justify-between font-semibold border-t pt-4">
                <span>Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </li>
            </ul>
          )}
        </div>

        {/* Shipping Form */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Alamat Pengiriman</h3>
          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <textarea
                className="w-full border rounded p-2"
                rows={4}
                placeholder="Masukkan alamat lengkap..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              {errors.address && (
                <p className="text-red-600 text-sm mt-1">{errors.address}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={processing || cartItems.length === 0}
              className={`px-4 py-2 text-white rounded ${
                cartItems.length === 0 || processing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {processing ? 'Memproses...' : 'Konfirmasi Pesanan'}
            </button>
          </form>
        </div>
      </div>
    </BuyerAuthenticatedLayout>
  );
}
