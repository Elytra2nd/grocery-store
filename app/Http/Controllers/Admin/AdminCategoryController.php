<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminCategoryController extends Controller
{

    public function index()
    {
        $categories = Category::latest()->get();
        return Inertia::render('Admin/Products/Categories/Index', [
            'categories' => $categories
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Products/Categories/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        Category::create($request->only('name'));

        return redirect()->route('admin.products.categories.index')
            ->with('success', 'Kategori berhasil ditambahkan');
    }

    public function edit(Category $category)
    {
        return Inertia::render('Admin/Products/Categories/Edit', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,'.$category->id,
        ]);

        $category->update($request->only('name'));

        return redirect()->route('admin.products.categories.index')
            ->with('success', 'Kategori berhasil diperbarui');
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return redirect()->route('admin.products.categories.index')
            ->with('success', 'Kategori berhasil dihapus');
    }
}
