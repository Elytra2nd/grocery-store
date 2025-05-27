<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BuyerDashboardController extends Controller
{
    /**
     * Display the dashboard with products and filters
     */
    public function dashboard(Request $request)
    {
        // Base query untuk produk aktif
        $query = Product::where('is_active', true);

        // Filter pencarian
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter kategori
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter harga minimum
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        // Filter harga maksimum
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter stok tersedia
        if ($request->filled('in_stock')) {
            $query->where('stock', '>', 0);
        }

        // Filter produk featured
        if ($request->filled('featured')) {
            $query->where('is_featured', true);
        }

        // Filter produk dengan diskon
        if ($request->filled('on_sale')) {
            $query->where('discount_price', '>', 0);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');

        $allowedSorts = [
            'name',
            'price',
            'created_at',
            'stock',
            'discount_price',
            'popularity'
        ];

        if (in_array($sortBy, $allowedSorts)) {
            if ($sortBy === 'popularity') {
                $query->withCount('orderItems')
                    ->orderBy('order_items_count', $sortOrder);
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }
        }

        // Pagination dengan 12 item per halaman
        $products = $query->paginate(12)->withQueryString();

        // Data untuk filter dropdown
        $categories = Product::select('category')
            ->where('is_active', true)
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        $priceRange = Product::where('is_active', true)
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
            ->first();

        // Statistik dashboard
        $stats = [
            'total_products' => Product::where('is_active', true)->count(),
            'total_categories' => Product::where('is_active', true)
                ->distinct('category')
                ->count('category'),
            'featured_products' => Product::where('is_active', true)
                ->where('is_featured', true)
                ->count(),
            'sale_products' => Product::where('is_active', true)
                ->where('discount_price', '>', 0)
                ->count(),
            'out_of_stock' => Product::where('is_active', true)
                ->where('stock', 0)
                ->count(),
            'average_price' => Product::where('is_active', true)->avg('price'),
        ];

        // Produk populer
        $popularProducts = Product::where('is_active', true)
            ->withCount('orderItems')
            ->orderBy('order_items_count', 'desc')
            ->limit(6)
            ->get();

        // Produk terbaru
        $newProducts = Product::where('is_active', true)
            ->latest()
            ->limit(6)
            ->get();

        // Produk featured
        $featuredProducts = Product::where('is_active', true)
            ->where('is_featured', true)
            ->limit(8)
            ->get();

        // Produk dengan diskon
        $saleProducts = Product::where('is_active', true)
            ->where('discount_price', '>', 0)
            ->limit(6)
            ->get();

        // User-specific data (jika user login)
        $userStats = null;
        if (Auth::check()) {
            $userId = Auth::id();
            $userStats = [
                'cart_items' => Cart::where('user_id', $userId)->count(),
                'total_orders' => Order::where('user_id', $userId)->count(),
                'total_spent' => Order::where('user_id', $userId)->sum('total'),
                'wishlist_items' => 0, // Sesuaikan dengan model wishlist Anda
            ];
        }

        return Inertia::render('buyer.dashboard', [
            'products' => $products,
            'categories' => $categories,
            'priceRange' => $priceRange,
            'stats' => $stats,
            'userStats' => $userStats,
            'popularProducts' => $popularProducts,
            'newProducts' => $newProducts,
            'featuredProducts' => $featuredProducts,
            'saleProducts' => $saleProducts,
            'filters' => $request->only([
                'search',
                'category',
                'min_price',
                'max_price',
                'sort_by',
                'sort_order',
                'in_stock',
                'featured',
                'on_sale'
            ]),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
                'has_more_pages' => $products->hasMorePages(),
                'links' => $products->linkCollection(),
            ],
            'sortOptions' => [
                ['value' => 'name', 'label' => 'Nama Produk'],
                ['value' => 'price', 'label' => 'Harga'],
                ['value' => 'created_at', 'label' => 'Tanggal Ditambahkan'],
                ['value' => 'stock', 'label' => 'Stok'],
                ['value' => 'popularity', 'label' => 'Popularitas'],
            ],
            'meta' => [
                'title' => 'Dashboard - Neo-Forest',
                'description' => 'Dashboard produk ramah lingkungan Neo-Forest',
                'keywords' => 'produk ramah lingkungan, sustainable, eco-friendly',
            ]
        ]);
    }

    /**
     * Get product details for quick view modal
     */
    public function getProduct(Request $request, $id)
    {
        $product = Product::with(['reviews.user'])
            ->where('is_active', true)
            ->findOrFail($id);

        $relatedProducts = Product::where('category', $product->category)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->limit(4)
            ->get();

        return Inertia::render('ProductQuickView', [
            'product' => $product,
            'relatedProducts' => $relatedProducts
        ]);
    }

    /**
     * Search products with autocomplete
     */
    public function searchProducts(Request $request)
    {
        $search = $request->get('q', '');

        if (strlen($search) < 2) {
            return Inertia::render('SearchResults', [
                'products' => [],
                'query' => $search
            ]);
        }

        $products = Product::where('is_active', true)
            ->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->with(['reviews'])
            ->paginate(20);

        return Inertia::render('SearchResults', [
            'products' => $products,
            'query' => $search,
            'total_results' => $products->total()
        ]);
    }

    /**
     * Show products by category
     */
    public function categoryProducts(Request $request, $category)
    {
        $query = Product::where('is_active', true)
            ->where('category', $category);

        // Apply same filters as dashboard
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');

        if (in_array($sortBy, ['name', 'price', 'created_at', 'stock'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $products = $query->paginate(12)->withQueryString();

        $categoryStats = [
            'total_products' => Product::where('category', $category)
                ->where('is_active', true)
                ->count(),
            'average_price' => Product::where('category', $category)
                ->where('is_active', true)
                ->avg('price'),
            'price_range' => Product::where('category', $category)
                ->where('is_active', true)
                ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
                ->first(),
        ];

        return Inertia::render('CategoryProducts', [
            'products' => $products,
            'category' => $category,
            'categoryStats' => $categoryStats,
            'filters' => $request->only(['min_price', 'max_price', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Show featured products page
     */
    public function featuredProducts(Request $request)
    {
        $query = Product::where('is_active', true)
            ->where('is_featured', true);

        $products = $query->paginate(12);

        return Inertia::render('FeaturedProducts', [
            'products' => $products,
            'total_featured' => $products->total()
        ]);
    }

    /**
     * Show sale products page
     */
    public function saleProducts(Request $request)
    {
        $query = Product::where('is_active', true)
            ->where('discount_price', '>', 0);

        $products = $query->paginate(12);

        return Inertia::render('SaleProducts', [
            'products' => $products,
            'total_sale' => $products->total()
        ]);
    }
}
