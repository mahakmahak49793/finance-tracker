// app/dashboard/categories/page.tsx
'use client'

import Modal from '@/app/components/ui/Modal'
import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiTag } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    icon: 'FiTag'
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      showErrorAlert('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      showErrorAlert('Please enter a category name')
      return
    }

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Show success message
        Swal.fire({
          title: 'Success!',
          text: editingCategory ? 'Category updated successfully!' : 'Category created successfully!',
          icon: 'success',
          confirmButtonColor: '#059669', // emerald-600
          confirmButtonText: 'OK',
          timer: 2000,
          timerProgressBar: true,
        })

        setShowModal(false)
        setEditingCategory(null)
        setFormData({ name: '', type: 'expense', icon: 'FiTag' })
        fetchCategories()
      } else {
        throw new Error('Failed to save category')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      showErrorAlert('Failed to save category. Please try again.')
    }
  }

  const handleDelete = async (id: string) => {
    const category = categories.find(c => c.id === id)
    
    if (!category) return

    // Confirmation dialog with SweetAlert2
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `<p>Delete this category?</p><p class="font-medium mt-2">${category.name}</p><span class="text-xs px-2 py-1 rounded-full mt-1 inline-block ${
        category.type === 'income'
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-red-100 text-red-800'
      }">${category.type}</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#059669', // emerald-600
      cancelButtonColor: '#dc2626', // red-600
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
        
        if (response.ok) {
          // Show success message
          Swal.fire({
            title: 'Deleted!',
            text: 'Category has been deleted.',
            icon: 'success',
            confirmButtonColor: '#059669', // emerald-600
            confirmButtonText: 'OK',
            timer: 1500,
            timerProgressBar: true,
          })
          
          fetchCategories()
        } else {
          throw new Error('Failed to delete category')
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        showErrorAlert('Failed to delete category. Please try again.')
      }
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon
    })
    setShowModal(true)
  }

  const showErrorAlert = (message: string) => {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#dc2626', // red-600
      confirmButtonText: 'OK',
    })
  }

  const handleAddCategoryClick = () => {
    setEditingCategory(null)
    setFormData({ name: '', type: 'expense', icon: 'FiTag' })
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading categories...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Organize your income and expense categories</p>
        </div>
        <button
          onClick={handleAddCategoryClick}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm hover:shadow"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-emerald-100 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiTag className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-600 mb-4">Create your first category to organize transactions</p>
          <button
            onClick={handleAddCategoryClick}
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <FiPlus className="w-4 h-4" />
            Add your first category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl border border-emerald-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    category.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    <FiTag className={`w-5 h-5 ${
                      category.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                    }`} />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                      category.type === 'income'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.type}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4 text-emerald-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {editingCategory ? 'Update category details' : 'Create a new category'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-black"
                placeholder="Enter category name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`p-4 border rounded-lg transition-colors ${
                    formData.type === 'income'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-emerald-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="text-lg font-medium text-emerald-600">Income</div>
                  <div className="text-sm text-emerald-600 mt-1">Money coming in</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`p-4 border rounded-lg transition-colors ${
                    formData.type === 'expense'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-emerald-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="text-lg font-medium text-red-600">Expense</div>
                  <div className="text-sm text-red-600 mt-1">Money going out</div>
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-emerald-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                {editingCategory ? 'Update' : 'Create'} Category
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}