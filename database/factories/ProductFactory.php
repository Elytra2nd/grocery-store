<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $productNames = [
            'Beras Premium 5kg',
            'Minyak Goreng Tropical 2L',
            'Gula Pasir 1kg',
            'Telur Ayam Fresh 1kg',
            'Daging Sapi Segar 500g',
            'Ayam Broiler Segar 1kg',
            'Ikan Salmon Fresh 300g',
            'Udang Segar 250g',
            'Wortel Organik 500g',
            'Bayam Segar 250g',
            'Tomat Cherry 200g',
            'Kentang 1kg',
            'Bawang Merah 500g',
            'Bawang Putih 250g',
            'Cabai Merah 200g',
            'Apel Fuji 1kg',
            'Jeruk Manis 1kg',
            'Pisang Cavendish 1kg',
            'Mangga Harum Manis 500g',
            'Anggur Merah 500g',
            'Susu UHT Full Cream 1L',
            'Yogurt Greek 200ml',
            'Keju Cheddar 200g',
            'Mentega Unsalted 200g',
            'Roti Tawar Gandum',
            'Mie Instan Ayam Bawang',
            'Kopi Arabica 200g',
            'Teh Hijau Premium 100g',
            'Air Mineral 600ml',
            'Jus Jeruk 250ml',
            'Sabun Mandi Herbal',
            'Shampoo Anti Ketombe',
            'Pasta Gigi Fluoride',
            'Tissue Wajah 200 lembar',
            'Deterjen Cair 1L'
        ];

        $descriptions = [
            'Produk berkualitas tinggi dengan standar premium',
            'Segar dan higienis, langsung dari sumber terpercaya',
            'Organik dan bebas pestisida untuk kesehatan keluarga',
            'Dipilih khusus untuk memenuhi kebutuhan harian Anda',
            'Kualitas terbaik dengan harga yang terjangkau',
            'Produk pilihan dengan nutrisi lengkap',
            'Fresh dan berkualitas untuk konsumsi sehari-hari',
            'Diproduksi dengan standar kebersihan yang tinggi',
            'Produk unggulan dengan cita rasa yang lezat',
            'Pilihan terbaik untuk gaya hidup sehat'
        ];

        return [
            'name' => $this->faker->randomElement($productNames),
            'description' => $this->faker->randomElement($descriptions),
            'price' => $this->faker->numberBetween(5000, 500000),
            'stock' => $this->faker->numberBetween(0, 200),
            'image' => null, // Will be set separately if needed
            'category_id' => Category::factory(),
            'is_active' => $this->faker->boolean(85), // 85% chance to be active
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the product is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the product is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the product is out of stock.
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock' => 0,
        ]);
    }

    /**
     * Indicate that the product has low stock.
     */
    public function lowStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock' => $this->faker->numberBetween(1, 10),
        ]);
    }

    /**
     * Indicate that the product has high stock.
     */
    public function highStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'stock' => $this->faker->numberBetween(100, 500),
        ]);
    }

    /**
     * Indicate that the product is expensive.
     */
    public function expensive(): static
    {
        return $this->state(fn (array $attributes) => [
            'price' => $this->faker->numberBetween(100000, 1000000),
        ]);
    }

    /**
     * Indicate that the product is cheap.
     */
    public function cheap(): static
    {
        return $this->state(fn (array $attributes) => [
            'price' => $this->faker->numberBetween(1000, 25000),
        ]);
    }

    /**
     * Create product with specific category.
     */
    public function withCategory(Category $category): static
    {
        return $this->state(fn (array $attributes) => [
            'category_id' => $category->id,
        ]);
    }

    /**
     * Create product with image.
     */
    public function withImage(): static
    {
        return $this->state(fn (array $attributes) => [
            'image' => 'products/' . $this->faker->uuid() . '.jpg',
        ]);
    }
}
