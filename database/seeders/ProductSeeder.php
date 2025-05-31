<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create categories first
        $categories = [
            'Beras & Biji-bijian',
            'Daging & Unggas',
            'Ikan & Seafood',
            'Sayuran Segar',
            'Buah-buahan',
            'Susu & Produk Olahan',
            'Roti & Bakery',
            'Minuman',
            'Makanan Instan',
            'Bumbu & Rempah',
            'Perawatan Tubuh',
            'Pembersih Rumah'
        ];

        foreach ($categories as $categoryName) {
            Category::firstOrCreate(['name' => $categoryName]);
        }

        $allCategories = Category::all();

        // Create products for each category
        foreach ($allCategories as $category) {
            // Create 3-8 products per category
            $productCount = rand(3, 8);

            Product::factory($productCount)
                ->withCategory($category)
                ->create();
        }

        // Create some special products
        Product::factory(5)->active()->highStock()->create();
        Product::factory(3)->outOfStock()->create();
        Product::factory(5)->lowStock()->create();
        Product::factory(3)->expensive()->create();
        Product::factory(10)->cheap()->create();
        Product::factory(15)->withImage()->create();
    }
}
