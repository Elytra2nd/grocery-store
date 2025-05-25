<?php
// database/seeders/ProductSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // Buah-buahan
            [
                'name' => 'Apel Fuji',
                'description' => 'Apel segar dari Malang dengan rasa manis dan tekstur renyah',
                'price' => 25000,
                'stock' => 50,
                'category' => 'Buah-buahan',
                'is_active' => true,
            ],
            [
                'name' => 'Pisang Cavendish',
                'description' => 'Pisang premium dengan kandungan potassium tinggi',
                'price' => 15000,
                'stock' => 100,
                'category' => 'Buah-buahan',
                'is_active' => true,
            ],
            [
                'name' => 'Jeruk Pontianak',
                'description' => 'Jeruk manis segar khas Pontianak, kaya vitamin C',
                'price' => 20000,
                'stock' => 75,
                'category' => 'Buah-buahan',
                'is_active' => true,
            ],
            [
                'name' => 'Mangga Harum Manis',
                'description' => 'Mangga matang dengan aroma harum dan rasa manis',
                'price' => 30000,
                'stock' => 40,
                'category' => 'Buah-buahan',
                'is_active' => true,
            ],
            [
                'name' => 'Anggur Hijau',
                'description' => 'Anggur segar tanpa biji, manis dan berair',
                'price' => 45000,
                'stock' => 25,
                'category' => 'Buah-buahan',
                'is_active' => true,
            ],

            // Sayuran
            [
                'name' => 'Bayam Hijau',
                'description' => 'Bayam segar organik kaya zat besi dan vitamin',
                'price' => 8000,
                'stock' => 80,
                'category' => 'Sayuran',
                'is_active' => true,
            ],
            [
                'name' => 'Kangkung',
                'description' => 'Kangkung segar untuk tumisan dan sayur bening',
                'price' => 6000,
                'stock' => 90,
                'category' => 'Sayuran',
                'is_active' => true,
            ],
            [
                'name' => 'Tomat Merah',
                'description' => 'Tomat segar untuk masakan dan salad',
                'price' => 12000,
                'stock' => 60,
                'category' => 'Sayuran',
                'is_active' => true,
            ],
            [
                'name' => 'Wortel',
                'description' => 'Wortel segar kaya beta karoten',
                'price' => 10000,
                'stock' => 70,
                'category' => 'Sayuran',
                'is_active' => true,
            ],
            [
                'name' => 'Brokoli',
                'description' => 'Brokoli segar kaya nutrisi dan antioksidan',
                'price' => 18000,
                'stock' => 35,
                'category' => 'Sayuran',
                'is_active' => true,
            ],

            // Daging & Ikan
            [
                'name' => 'Daging Sapi Segar',
                'description' => 'Daging sapi pilihan untuk rendang dan steak',
                'price' => 120000,
                'stock' => 20,
                'category' => 'Daging & Ikan',
                'is_active' => true,
            ],
            [
                'name' => 'Ayam Kampung',
                'description' => 'Ayam kampung segar tanpa hormon',
                'price' => 85000,
                'stock' => 15,
                'category' => 'Daging & Ikan',
                'is_active' => true,
            ],
            [
                'name' => 'Ikan Salmon',
                'description' => 'Ikan salmon segar kaya omega-3',
                'price' => 150000,
                'stock' => 10,
                'category' => 'Daging & Ikan',
                'is_active' => true,
            ],
            [
                'name' => 'Udang Windu',
                'description' => 'Udang windu segar untuk berbagai masakan',
                'price' => 95000,
                'stock' => 25,
                'category' => 'Daging & Ikan',
                'is_active' => true,
            ],

            // Susu & Telur
            [
                'name' => 'Susu Sapi Murni',
                'description' => 'Susu sapi segar tanpa pengawet',
                'price' => 15000,
                'stock' => 50,
                'category' => 'Susu & Telur',
                'is_active' => true,
            ],
            [
                'name' => 'Telur Ayam Kampung',
                'description' => 'Telur ayam kampung organik',
                'price' => 25000,
                'stock' => 100,
                'category' => 'Susu & Telur',
                'is_active' => true,
            ],
            [
                'name' => 'Keju Cheddar',
                'description' => 'Keju cheddar premium untuk sandwich dan pasta',
                'price' => 45000,
                'stock' => 30,
                'category' => 'Susu & Telur',
                'is_active' => true,
            ],

            // Roti & Kue
            [
                'name' => 'Roti Tawar Gandum',
                'description' => 'Roti tawar gandum sehat dan bergizi',
                'price' => 12000,
                'stock' => 40,
                'category' => 'Roti & Kue',
                'is_active' => true,
            ],
            [
                'name' => 'Croissant Butter',
                'description' => 'Croissant mentega segar dan lembut',
                'price' => 8000,
                'stock' => 25,
                'category' => 'Roti & Kue',
                'is_active' => true,
            ],
            [
                'name' => 'Donat Coklat',
                'description' => 'Donat dengan topping coklat manis',
                'price' => 6000,
                'stock' => 50,
                'category' => 'Roti & Kue',
                'is_active' => true,
            ],

            // Minuman
            [
                'name' => 'Air Mineral 600ml',
                'description' => 'Air mineral murni dalam kemasan 600ml',
                'price' => 3000,
                'stock' => 200,
                'category' => 'Minuman',
                'is_active' => true,
            ],
            [
                'name' => 'Jus Jeruk Segar',
                'description' => 'Jus jeruk segar tanpa pengawet',
                'price' => 15000,
                'stock' => 30,
                'category' => 'Minuman',
                'is_active' => true,
            ],
            [
                'name' => 'Teh Hijau',
                'description' => 'Teh hijau premium kaya antioksidan',
                'price' => 25000,
                'stock' => 45,
                'category' => 'Minuman',
                'is_active' => true,
            ],

            // Bumbu & Rempah
            [
                'name' => 'Bawang Merah',
                'description' => 'Bawang merah segar untuk bumbu masakan',
                'price' => 35000,
                'stock' => 60,
                'category' => 'Bumbu & Rempah',
                'is_active' => true,
            ],
            [
                'name' => 'Bawang Putih',
                'description' => 'Bawang putih segar berkualitas tinggi',
                'price' => 40000,
                'stock' => 55,
                'category' => 'Bumbu & Rempah',
                'is_active' => true,
            ],
            [
                'name' => 'Cabai Merah',
                'description' => 'Cabai merah segar untuk masakan pedas',
                'price' => 50000,
                'stock' => 40,
                'category' => 'Bumbu & Rempah',
                'is_active' => true,
            ],

            // Makanan Ringan
            [
                'name' => 'Keripik Singkong',
                'description' => 'Keripik singkong renyah dengan berbagai rasa',
                'price' => 15000,
                'stock' => 80,
                'category' => 'Makanan Ringan',
                'is_active' => true,
            ],
            [
                'name' => 'Kacang Tanah Goreng',
                'description' => 'Kacang tanah goreng gurih dan renyah',
                'price' => 20000,
                'stock' => 65,
                'category' => 'Makanan Ringan',
                'is_active' => true,
            ],
            [
                'name' => 'Biskuit Coklat',
                'description' => 'Biskuit dengan lapisan coklat manis',
                'price' => 18000,
                'stock' => 70,
                'category' => 'Makanan Ringan',
                'is_active' => true,
            ],

            // Produk dengan stok rendah untuk testing
            [
                'name' => 'Stroberi Import',
                'description' => 'Stroberi segar import dengan rasa manis asam',
                'price' => 75000,
                'stock' => 5, // Low stock
                'category' => 'Buah-buahan',
                'is_active' => true,
            ],
            [
                'name' => 'Truffle Coklat',
                'description' => 'Truffle coklat premium handmade',
                'price' => 120000,
                'stock' => 3, // Low stock
                'category' => 'Makanan Ringan',
                'is_active' => true,
            ],

            // Produk tidak aktif untuk testing
            [
                'name' => 'Produk Discontinued',
                'description' => 'Produk yang sudah tidak dijual',
                'price' => 10000,
                'stock' => 0,
                'category' => 'Lainnya',
                'is_active' => false,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
