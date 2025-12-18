// app/dashboard/transactions/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, Tag, Wallet, X } from 'lucide-react'
import Swal from 'sweetalert2'

interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  note: string
  date: string
  account: {
    id: string; name: string; color: string
  }
  category: {
    id: string; name: string; type: string
  }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    amount: 0,
    type: '' as 'income' | 'expense' |'',
    note: '',
    date: new Date().toISOString().split('T')[0],
    accountId: '',
    categoryId: ''
  })

  useEffect(() => {
    fetchTransactions()
    fetchAccounts()
    fetchCategories()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      showErrorAlert('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts')
      const data = await response.json()
      setAccounts(data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.type || !formData.accountId || !formData.categoryId) {
      showErrorAlert('Please fill in all required fields')
      return
    }

    try {
      const url = editingTransaction ? `/api/transactions/${editingTransaction.id}` : '/api/transactions'
      const method = editingTransaction ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount.toString())
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save transaction')
      }

      // Show success message
      Swal.fire({
        title: 'Success!',
        text: editingTransaction ? 'Transaction updated successfully!' : 'Transaction added successfully!',
        icon: 'success',
        confirmButtonColor: '#059669', // emerald-600
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true,
      })

      handleCloseForm()
      fetchTransactions()
      fetchAccounts() // Refresh accounts to update balances
    } catch (error: any) {
      console.error('Error saving transaction:', error)
      showErrorAlert(error.message || 'Error saving transaction')
    }
  }

  const handleDelete = async (id: string) => {
    const transaction = transactions.find(t => t.id === id)
    
    // Confirmation dialog with SweetAlert2
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `<p>Delete this transaction?</p><p class="text-sm text-gray-600 mt-1">${transaction?.note || 'No description'}</p><p class="font-semibold mt-2">$${transaction?.amount.toFixed(2)}</p>`,
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
        const response = await fetch(`/api/transactions/${id}`, { 
          method: 'DELETE' 
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete transaction')
        }
        
        // Show success message
        Swal.fire({
          title: 'Deleted!',
          text: 'Transaction has been deleted.',
          icon: 'success',
          confirmButtonColor: '#059669', // emerald-600
          confirmButtonText: 'OK',
          timer: 1500,
          timerProgressBar: true,
        })
        
        fetchTransactions()
        fetchAccounts() // Refresh accounts to update balances
      } catch (error: any) {
        console.error('Error deleting transaction:', error)
        showErrorAlert(error.message || 'Error deleting transaction')
      }
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      amount: transaction.amount,
      type: transaction.type,
      note: transaction.note || '',
      date: transaction.date.split('T')[0],
      accountId: transaction.account.id,
      categoryId: transaction.category.id
    })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingTransaction(null)
    setFormData({
      amount: 0,
      type: '',
      note: '',
      date: new Date().toISOString().split('T')[0],
      accountId: '',
      categoryId: ''
    })
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

  const handleAddTransactionClick = () => {
    setEditingTransaction(null)
    setFormData({
      amount: 0,
      type: '',
      note: '',
      date: new Date().toISOString().split('T')[0],
      accountId: '',
      categoryId: ''
    })
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading transactions...</div>
      </div>
    )
  }

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-1">Track all your income and expenses</p>
          </div>
          <button
            onClick={handleAddTransactionClick}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm hover:shadow"
          >
            <Plus className="w-5 h-5" />
            <span>Add Transaction</span>
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="bg-white rounded-xl border border-emerald-100 p-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600 mb-4">Add your first transaction to start tracking your finances</p>
            <button
              onClick={handleAddTransactionClick}
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add your first transaction
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white rounded-xl border border-emerald-100 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {transaction.note || 'No description'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Tag className="w-4 h-4" />
                              <span>{transaction.category.name}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Wallet className="w-4 h-4" />
                              <span>{transaction.account.name}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(transaction.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-lg font-semibold ${
                              transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              transaction.type === 'income'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type}
                            </span>
                          </div>
                          
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-emerald-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sliding Form from Right */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl border-l border-emerald-100 transform transition-transform duration-300 ease-in-out z-50 ${
        showForm ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Form Header */}
          <div className="flex items-center justify-between p-6 border-b border-emerald-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {editingTransaction ? 'Update transaction details' : 'Record a new transaction'}
              </p>
            </div>
            <button
              onClick={handleCloseForm}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-black"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  >
                    <option value="">Select type</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-black"
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white text-black"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} (${account.balance?.toFixed(2) || '0.00'})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white text-black"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.type})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-black"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none text-black"
                  placeholder="Add a note..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-2 border border-emerald-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  {editingTransaction ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black/10 z-40 md:hidden"
          onClick={handleCloseForm}
        />
      )}
    </div>
  )
}