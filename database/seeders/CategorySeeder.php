<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Buah-buahan'],
            ['name' => 'Sayuran'],
            ['name' => 'Daging & Ikan'],
            ['name' => 'Susu & Telur'],
            ['name' => 'Roti & Kue'],
            ['name' => 'Minuman'],
            ['name' => 'Bumbu & Rempah'],
            ['name' => 'Makanan Ringan'],
            ['name' => 'Lainnya'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
