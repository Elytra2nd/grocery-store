 public function dashboard(Request $request)
    {
        $query = Product::where('is_active', true);

        // Replikasi semua filter dari method index()
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');

        $allowedSorts = ['name', 'price', 'created_at', 'stock'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        if ($request->filled('in_stock')) {
            $query->where('stock', '>', 0);
        }

        // Pagination dengan 12 item per halaman
        $products = $query->paginate(12)->withQueryString();

        $categories = Product::select('category')
            ->where('is_active', true)
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        $priceRange = Product::where('is_active', true)
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
            ->first();

        return Inertia::render('Dashboard', [
            'products' => $products,
            'categories' => $categories,
            'priceRange' => $priceRange,
            'filters' => $request->only([
                'search',
                'category',
                'min_price',
                'max_price',
                'sort_by',
                'sort_order',
                'in_stock'
            ]),
        ]);
    }
