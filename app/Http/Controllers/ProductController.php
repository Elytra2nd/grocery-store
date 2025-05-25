<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::where('is_active', true);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');

        $allowedSorts = ['name', 'price', 'created_at', 'stock'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Stock filter
        if ($request->filled('in_stock')) {
            $query->where('stock', '>', 0);
        }

        $products = $query->paginate(12)->withQueryString();

        // Get categories for filter dropdown
        $categories = Product::select('category')
            ->where('is_active', true)
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        // Get price range for filter
        $priceRange = Product::where('is_active', true)
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
            ->first();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'priceRange' => $priceRange,
            'filters' => $request->only([
                'search', 'category', 'min_price', 'max_price',
                'sort_by', 'sort_order', 'in_stock'
            ]),
        ]);
    }

    public function show(Product $product)
    {
        // Check if product is active
        if (!$product->is_active) {
            abort(404);
        }

        // Get related products from same category
        $relatedProducts = Product::where('category', $product->category)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->limit(4)
            ->get();

        return Inertia::render('Products/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
        ]);

        $products = Product::where('is_active', true)
            ->where(function($query) use ($request) {
                $searchTerm = $request->q;
                $query->where('name', 'like', "%{$searchTerm}%")
                      ->orWhere('description', 'like', "%{$searchTerm}%")
                      ->orWhere('category', 'like', "%{$searchTerm}%");
            })
            ->select('id', 'name', 'price', 'image', 'stock')
            ->limit(10)
            ->get();

        return response()->json($products);
    }

    public function categories()
    {
        $categories = Product::select('category')
            ->where('is_active', true)
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json($categories);
    }
}
