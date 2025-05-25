<?php
// app/Http/Controllers/Admin/AdminProductController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

/**
 * @method void middleware(array|string $middleware, array $options = [])
 */
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
        $query = Product::query();

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
            ->paginate(15)
            ->withQueryString();

        // Get categories for filter
        $categories = Product::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        // Get statistics
        $statistics = [
            'total_products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'low_stock_products' => Product::where('stock', '<=', 10)->count(),
            'out_of_stock_products' => Product::where('stock', 0)->count(),
        ];

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'statistics' => $statistics,
            'filters' => $request->only([
                'search', 'category', 'status', 'stock_status'
            ]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Product::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return Inertia::render('Admin/Products/Create', [
            'categories' => $categories,
        ]);
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
            'category' => 'required|string|max:100',
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
            'category.required' => 'Kategori wajib diisi',
            'image.image' => 'File harus berupa gambar',
            'image.mimes' => 'Format gambar yang diizinkan: jpeg, png, jpg, gif, webp',
            'image.max' => 'Ukuran gambar maksimal 2MB',
        ]);

        $data = $request->only([
            'name', 'description', 'price', 'stock', 'category'
        ]);

        // Set default is_active to true if not provided
        $data['is_active'] = $request->boolean('is_active', true);

        // Handle image upload using service
        if ($request->hasFile('image')) {
            try {
                $data['image'] = $this->imageUploadService->uploadProductImage($request->file('image'));
            } catch (\Exception $e) {
                return back()->withErrors(['image' => 'Gagal mengupload gambar: ' . $e->getMessage()]);
            }
        }

        $product = Product::create($data);

        return redirect()->route('admin.products.index')
            ->with('success', 'Produk "' . $product->name . '" berhasil ditambahkan');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        // Load related data
        $product->load(['orderItems.order']);

        // Calculate statistics for this product
        $statistics = [
            'total_sold' => $product->orderItems->sum('quantity'),
            'total_revenue' => $product->orderItems->sum(function($item) {
                return $item->quantity * $item->price;
            }),
            'total_orders' => $product->orderItems->count(),
            'average_order_quantity' => $product->orderItems->count() > 0
                ? round($product->orderItems->sum('quantity') / $product->orderItems->count(), 2)
                : 0,
        ];

        return Inertia::render('Admin/Products/Show', [
            'product' => $product,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $categories = Product::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
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
            'category' => 'required|string|max:100',
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
            'category.required' => 'Kategori wajib diisi',
            'image.image' => 'File harus berupa gambar',
            'image.mimes' => 'Format gambar yang diizinkan: jpeg, png, jpg, gif, webp',
            'image.max' => 'Ukuran gambar maksimal 2MB',
        ]);

        $data = $request->only([
            'name', 'description', 'price', 'stock', 'category'
        ]);

        $data['is_active'] = $request->boolean('is_active');

        // Handle image upload using service
        if ($request->hasFile('image')) {
            try {
                $data['image'] = $this->imageUploadService->uploadProductImage(
                    $request->file('image'),
                    $product->image
                );
            } catch (\Exception $e) {
                return back()->withErrors(['image' => 'Gagal mengupload gambar: ' . $e->getMessage()]);
            }
        }

        $product->update($data);

        return redirect()->route('admin.products.index')
            ->with('success', 'Produk "' . $product->name . '" berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Check if product has orders
        if ($product->orderItems()->exists()) {
            return back()->withErrors(['delete' => 'Produk tidak dapat dihapus karena sudah ada dalam pesanan']);
        }

        $productName = $product->name;

        // Delete image using service
        if ($product->image) {
            try {
                $this->imageUploadService->deleteProductImage($product->image);
            } catch (\Exception $e) {
                // Log error but continue with deletion
                Log::warning('Failed to delete product image: ' . $e->getMessage());
            }
        }

        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Produk "' . $productName . '" berhasil dihapus');
    }

    /**
     * Handle bulk actions for multiple products.
     */
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
                // Check if any product has orders
                $productsWithOrders = $products->whereHas('orderItems')->pluck('name');
                if ($productsWithOrders->isNotEmpty()) {
                    return back()->withErrors([
                        'bulk_delete' => 'Produk berikut tidak dapat dihapus karena sudah ada dalam pesanan: ' .
                        $productsWithOrders->implode(', ')
                    ]);
                }

                // Delete images for all products
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

        $oldStock = $product->stock;
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

        // Log stock movement (optional - implement if you have stock movement tracking)
        // $this->logStockMovement($product, $request->action, $request->stock, $request->reason);

        $actionText = [
            'set' => 'diset menjadi',
            'add' => 'ditambah',
            'subtract' => 'dikurangi'
        ][$request->action];

        return back()->with('success',
            "Stok produk \"{$product->name}\" berhasil {$actionText}. " .
            "Stok sebelumnya: {$oldStock}, Stok sekarang: {$newStock}"
        );
    }

    /**
     * Get low stock products for dashboard alerts.
     */
    public function lowStockAlert()
    {
        $lowStockProducts = Product::where('stock', '<=', 10)
            ->where('is_active', true)
            ->select('id', 'name', 'stock', 'category')
            ->orderBy('stock', 'asc')
            ->get();

        return response()->json($lowStockProducts);
    }

    /**
     * Export products to CSV.
     */
    public function export(Request $request)
    {
        $query = Product::query();

        // Apply same filters as index
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
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
                    $product->id,
                    $product->name,
                    $product->description,
                    $product->price,
                    $product->stock,
                    $product->category,
                    $product->is_active ? 'Aktif' : 'Tidak Aktif',
                    $product->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
