<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Category::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // DIPERBAIKI: Daftar kategori yang lebih banyak dan tidak menggunakan unique()
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
            'Pembersih Rumah',
            'Makanan Ringan',
            'Frozen Food',
            'Organic Products',
            'Snack & Camilan',
            'Kopi & Teh',
            'Mie & Pasta',
            'Saus & Condiment',
            'Baby Food',
            'Pet Food',
            'Vitamin & Suplemen',
            'Kosmetik',
            'Alat Tulis',
            'Elektronik',
            'Pakaian',
            'Sepatu',
            'Tas & Dompet',
            'Aksesoris',
            'Mainan',
            'Buku & Majalah',
            'Olahraga',
            'Otomotif',
            'Perkakas',
            'Furniture',
            'Dekorasi',
            'Tanaman',
            'Alat Masak',
            'Peralatan Makan',
            'Tekstil Rumah'
        ];

        return [
            // DIPERBAIKI: Tidak menggunakan unique(), biarkan database handle uniqueness
            'name' => $this->faker->randomElement($categories) . ' ' . $this->faker->numberBetween(1, 999),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => now(),
        ];
    }

    /**
     * DITAMBAHKAN: State untuk kategori dengan nama yang sudah ditentukan
     */
    public function withName(string $name): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => $name,
        ]);
    }
}
