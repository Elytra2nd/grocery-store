<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AdminProductController extends Controller
{
    protected $imageUploadService;

    public function __construct(ImageUploadService $imageUploadService)
    {
        $this->middleware(['auth', 'role:admin']);
        $this->imageUploadService = $imageUploadService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Product::with('category'); // Eager load kategori

            // Search functionality
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Category filter
            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            // Status filter
            if ($request->filled('status')) {
                $query->where('is_active', $request->status === 'active');
            }

            // Stock filter
            if ($request->filled('stock_status')) {
                switch ($request->stock_status) {
                    case 'low':
                        $query->where('stock', '<=', 10);
                        break;
                    case 'out':
                        $query->where('stock', 0);
                        break;
                    case 'available':
                        $query->where('stock', '>', 0);
                        break;
                }
            }

            $products = $query->orderBy('created_at', 'desc')
                ->paginate(10)
                ->withQueryString();

            // Get categories for filter: id => name
            $categories = Category::orderBy('name')->pluck('name', 'id');

            // Get statistics
            $statistics = [
                'total_products' => Product::count() ?? 0,
                'active_products' => Product::where('is_active', true)->count() ?? 0,
                'low_stock_products' => Product::where('stock', '<=', 10)->count() ?? 0,
                'out_of_stock_products' => Product::where('stock', 0)->count() ?? 0,
            ];

            return Inertia::render('Admin/Products/Index', [
                'products' => $products,
                'categories' => $categories,
                'statistics' => $statistics,
                'filters' => $request->only([
                    'search', 'category_id', 'status', 'stock_status'
                ]) ?? [],
            ]);

        } catch (\Exception $e) {
            Log::error('AdminProductController@index error: ' . $e->getMessage());
            return Inertia::render('Admin/Products/Index', [
                'products' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 10,
                    'total' => 0,
                ],
                'categories' => [],
                'statistics' => [
                    'total_products' => 0,
                    'active_products' => 0,
                    'low_stock_products' => 0,
                    'out_of_stock_products' => 0,
                ],
                'filters' => [],
                'error' => 'Terjadi kesalahan saat memuat data produk.'
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            $categories = Category::orderBy('name')->get(['id', 'name']);
            return Inertia::render('Admin/Products/Create', [
                'categories' => $categories,
            ]);
        } catch (\Exception $e) {
            Log::error('AdminProductController@create error: ' . $e->getMessage());
            return Inertia::render('Admin/Products/Create', [
                'categories' => [],
                'error' => 'Terjadi kesalahan saat memuat halaman.'
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'price' => 'required|numeric|min:0|max:99999999.99',
            'stock' => 'required|integer|min:0|max:999999',
            'category_id' => 'required|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'boolean',
        ], [
            'name.required' => 'Nama produk wajib diisi',
            'name.max' => 'Nama produk maksimal 255 karakter',
            'description.required' => 'Deskripsi produk wajib diisi',
            'description.max' => 'Deskripsi maksimal 1000 karakter',
            'price.required' => 'Harga wajib diisi',
            'price.numeric' => 'Harga harus berupa angka',
            'price.min' => 'Harga tidak boleh negatif',
            'stock.required' => 'Stok wajib diisi',
            'stock.integer' => 'Stok harus berupa angka bulat',
            'stock.min' => 'Stok tidak boleh negatif',
            'category_id.required' => 'Kategori wajib diisi',
            'image.image' => 'File harus berupa gambar',
            'image.mimes' => 'Format gambar yang diizinkan: jpeg, png, jpg, gif, webp',
            'image.max' => 'Ukuran gambar maksimal 2MB',
        ]);

        try {
            $data = $request->only([
                'name', 'description', 'price', 'stock', 'category_id'
            ]);

            // Set default is_active to true if not provided
            $data['is_active'] = $request->boolean('is_active', true);

            // Handle image upload using service
            if ($request->hasFile('image')) {
                $data['image'] = $this->imageUploadService->uploadProductImage($request->file('image'));
            }

            $product = Product::create($data);

            return redirect()->route('admin.products.index')
                ->with('success', 'Produk "' . $product->name . '" berhasil ditambahkan');

        } catch (\Exception $e) {
            Log::error('AdminProductController@store error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menyimpan produk: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        try {
            // Load related data dengan kategori relasi objek
            $product->load(['category', 'orderItems.order']);

            // Calculate statistics for this product dengan null safety
            $orderItems = $product->orderItems ?? collect([]);
            $statistics = [
                'total_sold' => $orderItems->sum('quantity') ?? 0,
                'total_revenue' => $orderItems->sum(function($item) {
                    return ($item->quantity ?? 0) * ($item->price ?? 0);
                }) ?? 0,
                'total_orders' => $orderItems->count() ?? 0,
                'average_order_quantity' => $orderItems->count() > 0
                    ? round($orderItems->sum('quantity') / $orderItems->count(), 2)
                    : 0,
            ];

            return Inertia::render('Admin/Products/Show', [
                'product' => $product,
                'statistics' => $statistics,
            ]);

        } catch (\Exception $e) {
            Log::error('AdminProductController@show error: ' . $e->getMessage());
            return redirect()->route('admin.products.index')
                ->with('error', 'Produk tidak ditemukan');
        }
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        try {
            // Ambil semua kategori sebagai array objek (id & name)
            $categories = Category::orderBy('name')->get(['id', 'name']);

            return Inertia::render('Admin/Products/Edit', [
                'product' => $product,
                'categories' => $categories,
            ]);
        } catch (\Exception $e) {
            Log::error('AdminProductController@edit error: ' . $e->getMessage());
            return redirect()->route('admin.products.index')
                ->with('error', 'Produk tidak ditemukan');
        }
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'price' => 'required|numeric|min:0|max:99999999.99',
            'stock' => 'required|integer|min:0|max:999999',
            'category_id' => 'required|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'boolean',
        ], [
            'name.required' => 'Nama produk wajib diisi',
            'name.max' => 'Nama produk maksimal 255 karakter',
            'description.required' => 'Deskripsi produk wajib diisi',
            'description.max' => 'Deskripsi maksimal 1000 karakter',
            'price.required' => 'Harga wajib diisi',
            'price.numeric' => 'Harga harus berupa angka',
            'price.min' => 'Harga tidak boleh negatif',
            'stock.required' => 'Stok wajib diisi',
            'stock.integer' => 'Stok harus berupa angka bulat',
            'stock.min' => 'Stok tidak boleh negatif',
            'category_id.required' => 'Kategori wajib diisi',
            'image.image' => 'File harus berupa gambar',
            'image.mimes' => 'Format gambar yang diizinkan: jpeg, png, jpg, gif, webp',
            'image.max' => 'Ukuran gambar maksimal 2MB',
        ]);

        try {
            $data = $request->only([
                'name', 'description', 'price', 'stock', 'category_id'
            ]);

            $data['is_active'] = $request->boolean('is_active');

            // Handle image upload using service
            if ($request->hasFile('image')) {
                $data['image'] = $this->imageUploadService->uploadProductImage(
                    $request->file('image'),
                    $product->image
                );
            }

            $product->update($data);

            return redirect()->route('admin.products.index')
                ->with('success', 'Produk "' . $product->name . '" berhasil diperbarui');

        } catch (\Exception $e) {
            Log::error('AdminProductController@update error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal memperbarui produk: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        try {
            // Check if product has orders dengan null safety
            if ($product->orderItems()->exists()) {
                return back()->withErrors(['delete' => 'Produk tidak dapat dihapus karena sudah ada dalam pesanan']);
            }
            $productName = $product->name;

            // Delete image using service
            if ($product->image) {
                try {
                    $this->imageUploadService->deleteProductImage($product->image);
                } catch (\Exception $e) {
                    Log::warning('Failed to delete product image: ' . $e->getMessage());
                }
            }

            $product->delete();

            return redirect()->route('admin.products.index')
                ->with('success', 'Produk "' . $productName . '" berhasil dihapus');

        } catch (\Exception $e) {
            Log::error('AdminProductController@destroy error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal menghapus produk: ' . $e->getMessage()]);
        }
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,delete',
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'exists:products,id',
        ], [
            'action.required' => 'Aksi wajib dipilih',
            'action.in' => 'Aksi tidak valid',
            'product_ids.required' => 'Pilih minimal satu produk',
            'product_ids.array' => 'Data produk tidak valid',
            'product_ids.min' => 'Pilih minimal satu produk',
            'product_ids.*.exists' => 'Produk tidak ditemukan',
        ]);

        try {
            $products = Product::whereIn('id', $request->product_ids);
            $affectedCount = $products->count();

            switch ($request->action) {
                case 'activate':
                    $products->update(['is_active' => true]);
                    $message = $affectedCount . ' produk berhasil diaktifkan';
                    break;
                case 'deactivate':
                    $products->update(['is_active' => false]);
                    $message = $affectedCount . ' produk berhasil dinonaktifkan';
                    break;
                case 'delete':
                    $productsWithOrders = $products->whereHas('orderItems')->pluck('name');
                    if ($productsWithOrders->isNotEmpty()) {
                        return back()->withErrors([
                            'bulk_delete' => 'Produk berikut tidak dapat dihapus karena sudah ada dalam pesanan: ' .
                            $productsWithOrders->implode(', ')
                        ]);
                    }
                    $productList = $products->get();
                    foreach ($productList as $product) {
                        if ($product->image) {
                            try {
                                $this->imageUploadService->deleteProductImage($product->image);
                            } catch (\Exception $e) {
                                Log::warning('Failed to delete product image: ' . $e->getMessage());
                            }
                        }
                    }
                    $products->delete();
                    $message = $affectedCount . ' produk berhasil dihapus';
                    break;
            }

            return back()->with('success', $message);

        } catch (\Exception $e) {
            Log::error('AdminProductController@bulkAction error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal melakukan aksi: ' . $e->getMessage()]);
        }
    }

    /**
     * Update stock for a specific product.
     */
    public function updateStock(Request $request, Product $product)
    {
        $request->validate([
            'stock' => 'required|integer|min:0|max:999999',
            'action' => 'required|in:set,add,subtract',
            'reason' => 'nullable|string|max:255',
        ], [
            'stock.required' => 'Jumlah stok wajib diisi',
            'stock.integer' => 'Stok harus berupa angka bulat',
            'stock.min' => 'Stok tidak boleh negatif',
            'stock.max' => 'Stok maksimal 999999',
            'action.required' => 'Aksi wajib dipilih',
            'action.in' => 'Aksi tidak valid',
            'reason.max' => 'Alasan maksimal 255 karakter',
        ]);

        try {
            $oldStock = $product->stock ?? 0;
            $newStock = $oldStock;

            switch ($request->action) {
                case 'set':
                    $newStock = $request->stock;
                    break;
                case 'add':
                    $newStock = $oldStock + $request->stock;
                    break;
                case 'subtract':
                    $newStock = max(0, $oldStock - $request->stock);
                    break;
            }

            $product->update(['stock' => $newStock]);

            $actionText = [
                'set' => 'diset menjadi',
                'add' => 'ditambah',
                'subtract' => 'dikurangi'
            ][$request->action];

            return back()->with('success',
                "Stok produk \"{$product->name}\" berhasil {$actionText}. " .
                "Stok sebelumnya: {$oldStock}, Stok sekarang: {$newStock}"
            );

        } catch (\Exception $e) {
            Log::error('AdminProductController@updateStock error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal memperbarui stok: ' . $e->getMessage()]);
        }
    }

    /**
     * Get low stock products for dashboard alerts.
     */
    public function lowStockAlert()
    {
        try {
            $lowStockProducts = Product::where('stock', '<=', 10)
                ->where('is_active', true)
                ->select('id', 'name', 'stock', 'category_id')
                ->orderBy('stock', 'asc')
                ->get();

            return response()->json($lowStockProducts);

        } catch (\Exception $e) {
            Log::error('AdminProductController@lowStockAlert error: ' . $e->getMessage());
            return response()->json([], 500);
        }
    }

    /**
     * Get products with low stock.
     */
    public function lowStock()
    {
        try {
            // Ambil produk stok <= 10, dengan relasi kategori
            $products = Product::with('category')
                ->where('stock', '<=', 10)
                ->where('is_active', true)
                ->orderBy('stock', 'asc')
                ->paginate(10);

            return Inertia::render('Admin/Products/LowStock', [
                'products' => $products,
            ]);
        } catch (\Exception $e) {
            \Log::error('AdminProductController@lowStock error: ' . $e->getMessage());
            return Inertia::render('Admin/Products/LowStock', [
                    'products' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 10,
                    'total' => 0,
                    'links' => [],
                ],
                'error' => 'Terjadi kesalahan saat memuat data stok rendah.'
            ]);
        }
    }

    /**
     * Manage product categories.
     */
    public function categories()
    {
        try {
            $categories = Category::withCount([
                'products',
                'products as active_products_count' => function ($query) {
                    $query->where('is_active', true);
                }
            ])->orderBy('name')->get()->map(function ($category) {
                return [
                    'name' => $category->name,
                    'products_count' => $category->products_count,
                    'active_products_count' => $category->active_products_count,
                ];
            });

            return Inertia::render('Admin/Categories/Index', [
                'categories' => $categories,
            ]);
        } catch (\Exception $e) {
            Log::error('AdminProductController@categories error: ' . $e->getMessage());
            return Inertia::render('Admin/Categories/Index', [
                'categories' => [],
                'error' => 'Terjadi kesalahan saat memuat data.'
            ]);
        }
    }

    /**
     * Export products to CSV.
     */
    public function export(Request $request)
    {
        try {
            $query = Product::query();

            // Apply same filters as index
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('category_id', 'like', "%{$search}%");
                });
            }

            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->filled('status')) {
                $query->where('is_active', $request->status === 'active');
            }

            $products = $query->orderBy('created_at', 'desc')->get();

            $filename = 'products_' . date('Y-m-d_H-i-s') . '.csv';

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ];

            $callback = function() use ($products) {
                $file = fopen('php://output', 'w');
                // Add BOM for UTF-8
                fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
                // Header
                fputcsv($file, [
                    'ID', 'Nama', 'Deskripsi', 'Harga', 'Stok',
                    'Kategori', 'Status', 'Tanggal Dibuat'
                ]);
                // Data
                foreach ($products as $product) {
                    fputcsv($file, [
                        $product->id ?? '',
                        $product->name ?? '',
                        $product->description ?? '',
                        $product->price ?? 0,
                        $product->stock ?? 0,
                        $product->category_id ?? '',
                        ($product->is_active ?? false) ? 'Aktif' : 'Tidak Aktif',
                        $product->created_at ? $product->created_at->format('Y-m-d H:i:s') : '',
                    ]);
                }
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            Log::error('AdminProductController@export error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal mengekspor data: ' . $e->getMessage()]);
        }
    }
}
