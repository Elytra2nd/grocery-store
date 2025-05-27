import BuyerAuthenticatedLayout from '@/Layouts/BuyerAuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <BuyerAuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-yellow-800">
                    Buyer Dashboard
                </h2>
            }
        >
            <Head title="Buyer Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-3xl font-bold text-center">
                                Hello World - Buyer Dashboard!
                            </h1>
                            <p className="text-center mt-4 text-gray-600">
                                Selamat datang di dashboard buyer Neo-Forest
                            </p>
                            <p className="text-center mt-4 text-yellow-800 font-semibold">
                                Halo saya adalah orang yang baru saja masuk
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </BuyerAuthenticatedLayout>
    );
}
