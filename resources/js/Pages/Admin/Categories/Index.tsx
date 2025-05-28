import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ChevronRightIcon, ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Category {
  id: number;
  name: string;
}

interface Props extends PageProps {
  categories: Category[];
}

export default function CategoriesIndex({ categories }: Props) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form untuk create
  const { data: createData, setData: setCreateData, post, processing: createProcessing, errors: createErrors, reset: resetCreate } = useForm({
    name: '',
  });

  // Form untuk edit
  const { data: editData, setData: setEditData, put, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
    name: '',
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    post('/admin/categories', {
      onSuccess: () => {
        resetCreate();
        setShowCreateForm(false);
      },
      onError: (errors) => {
        console.error('Create validation errors:', errors);
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory) return;

    put(`/admin/categories/${editingCategory.id}`, {
      onSuccess: () => {
        resetEdit();
        setEditingCategory(null);
      },
      onError: (errors) => {
        console.error('Edit validation errors:', errors);
      }
    });
  };

  const handleDelete = (categoryId: number, categoryName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${categoryName}"?`)) {
      router.delete(`/admin/categories/${categoryId}`, {
        preserveState: false,
        preserveScroll: false,
        onSuccess: () => {
          console.log('Category deleted successfully');
        },
        onError: (errors) => {
          console.error('Error deleting category:', errors);
          alert('Terjadi kesalahan saat menghapus kategori');
        }
      });
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setEditData('name', category.name);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    resetEdit();
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="font-semibold text-xl text-amber-900 leading-tight">
          Kategori Produk
        </h2>
      }
    >
      <Head title="Kategori Produk" />
      
      <div className="max-w-5xl mx-auto">
        {/* Tombol Kembali */}
        <div className="mb-4">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200 transition-all duration-150 font-semibold"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Kembali ke Produk
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-extrabold text-amber-900">Daftar Kategori</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-amber-600 text-white px-4 py-2 rounded-xl shadow hover:bg-amber-700 transition-all duration-150 font-semibold"
          >
            + Tambah Kategori
          </button>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-amber-900">Tambah Kategori Baru</h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    resetCreate();
                  }}
                  className="text-amber-400 hover:text-amber-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateSubmit}>
                <div className="mb-4">
                  <label htmlFor="create-name" className="block text-sm font-medium text-amber-700 mb-2">
                    Nama Kategori
                  </label>
                  <input
                    id="create-name"
                    type="text"
                    value={createData.name}
                    onChange={(e) => setCreateData('name', e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Masukkan nama kategori"
                    required
                  />
                  {createErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{createErrors.name}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetCreate();
                    }}
                    className="px-4 py-2 text-amber-700 bg-amber-100 rounded-md hover:bg-amber-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={createProcessing}
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
                  >
                    {createProcessing ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-x-auto sm:rounded-lg border border-amber-100">
          <table className="min-w-full divide-y divide-amber-100">
            <thead className="bg-amber-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Nama Kategori
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-amber-50">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center px-6 py-12 text-amber-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-amber-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="text-lg font-medium">Belum ada kategori</p>
                      <p className="text-sm">Tambahkan kategori pertama untuk memulai</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-amber-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingCategory?.id === category.id ? (
                        <form onSubmit={handleEditSubmit} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData('name', e.target.value)}
                            className="flex-1 px-2 py-1 border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                            required
                          />
                          <button
                            type="submit"
                            disabled={editProcessing}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                          >
                            ✗
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-amber-700">
                                {category.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-amber-900">
                              {category.name}
                            </div>
                          </div>
                        </div>
                      )}
                      {editErrors.name && editingCategory?.id === category.id && (
                        <p className="mt-1 text-sm text-red-600">{editErrors.name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingCategory?.id === category.id ? null : (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => startEdit(category)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 hover:text-amber-800 transition-all duration-150"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 transition-all duration-150"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDelete(category.id, category.name);
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Statistics */}
        {categories.length > 0 && (
          <div className="mt-6 bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-between text-sm text-amber-700">
              <span>Total Kategori: <strong>{categories.length}</strong></span>
              <span>Terakhir diperbarui: <strong>{new Date().toLocaleDateString('id-ID')}</strong></span>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}