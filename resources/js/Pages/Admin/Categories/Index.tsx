import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { ChevronRightIcon, ArrowLeftIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Category {
  id: number;
  name: string;
}

interface Props extends PageProps {
  categories: Category[];
}

// DITAMBAHKAN: Delete Modal Component dengan Animasi
interface DeleteModalProps {
  show: boolean;
  category: Category | null;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModal({ show, category, isLoading, onConfirm, onCancel }: DeleteModalProps): JSX.Element {
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  React.useEffect(() => {
    if (show) {
      setIsModalAnimating(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsModalAnimating(false);
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleCancel = () => {
    if (!isLoading) {
      setIsClosing(true);
      setTimeout(() => {
        onCancel();
      }, 300);
    }
  };

  if (!show && !isClosing) return <></>;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${
        isModalAnimating && !isClosing
          ? 'opacity-100 backdrop-blur-sm'
          : 'opacity-0'
      }`}
      style={{
        background: isModalAnimating && !isClosing
          ? 'rgba(0, 0, 0, 0.5)'
          : 'rgba(0, 0, 0, 0)'
      }}
    >
      {/* Background overlay dengan animasi */}
      <div
        className={`fixed inset-0 transition-opacity duration-300 ease-in-out ${
          isModalAnimating && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleCancel}
      />

      {/* Modal panel dengan ukuran yang lebih kecil dan centered */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-out w-full max-w-md mx-auto ${
          isModalAnimating && !isClosing
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-8 scale-95'
        }`}
        style={{
          boxShadow: isModalAnimating && !isClosing
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            : 'none'
        }}
      >
        {/* Header dengan padding yang disesuaikan */}
        <div className="p-6">
          <div className="flex items-center">
            <div
              className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full transition-all duration-500 delay-100 ${
                isModalAnimating && !isClosing
                  ? 'bg-red-100 scale-100'
                  : 'bg-red-50 scale-75'
              }`}
            >
              <TrashIcon
                className={`transition-all duration-500 delay-200 ${
                  isModalAnimating && !isClosing
                    ? 'h-6 w-6 text-red-600 scale-100'
                    : 'h-5 w-5 text-red-400 scale-75'
                }`}
              />
            </div>
            <div className="ml-4 flex-1">
              <h3
                className={`text-lg font-bold leading-6 transition-all duration-500 delay-150 ${
                  isModalAnimating && !isClosing
                    ? 'text-gray-900 translate-y-0 opacity-100'
                    : 'text-gray-700 translate-y-2 opacity-0'
                }`}
              >
                Konfirmasi Hapus Kategori
              </h3>
            </div>
          </div>

          <div
            className={`mt-4 transition-all duration-500 delay-200 ${
              isModalAnimating && !isClosing
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
          >
            <p className="text-sm text-gray-500 mb-3">
              Apakah Anda yakin ingin menghapus kategori:
            </p>
            <div
              className={`p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-l-4 border-amber-400 transition-all duration-500 delay-300 ${
                isModalAnimating && !isClosing
                  ? 'scale-100 opacity-100'
                  : 'scale-95 opacity-0'
              }`}
            >
              <p className="text-sm font-semibold text-gray-900 flex items-center">
                <span className="text-lg mr-2">📁</span>
                "{category?.name}"
              </p>
            </div>
            <div
              className={`mt-3 p-2 bg-red-50 rounded-lg border border-red-200 transition-all duration-500 delay-400 ${
                isModalAnimating && !isClosing
                  ? 'scale-100 opacity-100'
                  : 'scale-95 opacity-0'
              }`}
            >
              <p className="text-xs text-red-600 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Tindakan ini tidak dapat dibatalkan!
              </p>
            </div>
          </div>

          {/* Action buttons dengan ukuran yang disesuaikan */}
          <div
            className={`mt-6 flex gap-3 transition-all duration-500 delay-500 ${
              isModalAnimating && !isClosing
                ? 'translate-y-0 opacity-100'
                : 'translate-y-6 opacity-0'
            }`}
          >
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-300 ${
                isLoading
                  ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 hover:from-amber-100 hover:to-yellow-100 hover:border-amber-400 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500'
              }`}
            >
              <div className="flex items-center justify-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Batal</span>
              </div>
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-transparent transition-all duration-300 ${
                isLoading
                  ? 'bg-red-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500'
              } text-white`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>Menghapus...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-1">
                  <TrashIcon className="w-4 h-4" />
                  <span>Ya, Hapus</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesIndex({ categories }: Props) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // DITAMBAHKAN: State untuk delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // DIPERBAIKI: Handle delete dengan modal
  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  // DITAMBAHKAN: Confirm delete function
  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    router.delete(`/admin/categories/${categoryToDelete.id}`, {
      preserveState: false,
      preserveScroll: false,
      onSuccess: () => {
        setIsDeleting(false);
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      },
      onError: (errors) => {
        console.error('Error deleting category:', errors);
        setIsDeleting(false);
        alert('Terjadi kesalahan saat menghapus kategori');
      }
    });
  };

  // DITAMBAHKAN: Close delete modal function
  const closeDeleteModal = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
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

        {/* Categories Table */}
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
                            onClick={() => handleDelete(category)}
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

      {/* DITAMBAHKAN: Enhanced Delete Confirmation Modal dengan Animasi */}
      <DeleteModal
        show={showDeleteModal}
        category={categoryToDelete}
        isLoading={isDeleting}
        onConfirm={confirmDeleteCategory}
        onCancel={closeDeleteModal}
      />
    </AuthenticatedLayout>
  );
}
