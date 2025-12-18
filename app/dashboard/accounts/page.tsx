// app/dashboard/accounts/page.tsx
'use client'

import Modal from '@/app/components/ui/Modal'
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, CreditCard, Home, Wallet, Banknote } from 'lucide-react'
import Swal from 'sweetalert2'

interface Account {
  id: string
  name: string
  type: string
  balance: number
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    balance: 0,
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts')
      const data = await response.json()
      setAccounts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingAccount ? `/api/accounts/${editingAccount.id}` : '/api/accounts'
      const method = editingAccount ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowModal(false)
        setEditingAccount(null)
        setFormData({ name: '', type: 'bank', balance: 0})
        
        // Success notification
        Swal.fire({
          title: 'Success!',
          text: editingAccount ? 'Account updated successfully!' : 'Account added successfully!',
          icon: 'success',
          confirmButtonColor: '#059669', // emerald-600
          confirmButtonText: 'OK',
          timer: 2000,
          timerProgressBar: true,
        })
        
        fetchAccounts()
      } else {
        throw new Error('Failed to save account')
      }
    } catch (error) {
      console.error('Error saving account:', error)
      
      // Error notification
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save account. Please try again.',
        icon: 'error',
        confirmButtonColor: '#dc2626', // red-600
        confirmButtonText: 'OK',
      })
    }
  }

  const handleDelete = async (id: string) => {
    // Confirmation dialog with SweetAlert2
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
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
        const response = await fetch(`/api/accounts/${id}`, { method: 'DELETE' })
        
        if (response.ok) {
          // Success notification
          Swal.fire({
            title: 'Deleted!',
            text: 'Account has been deleted.',
            icon: 'success',
            confirmButtonColor: '#059669', // emerald-600
            confirmButtonText: 'OK',
            timer: 2000,
            timerProgressBar: true,
          })
          
          fetchAccounts()
        } else {
          throw new Error('Failed to delete account')
        }
      } catch (error) {
        console.error('Error deleting account:', error)
        
        // Error notification
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete account. Please try again.',
          icon: 'error',
          confirmButtonColor: '#dc2626', // red-600
          confirmButtonText: 'OK',
        })
      }
    }
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance,
    })
    setShowModal(true)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'bank': return Home
      case 'credit-card': return CreditCard
      case 'wallet': return Wallet
      default: return Banknote
    }
  }

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'bank': return 'bg-emerald-100 text-emerald-600'
      case 'credit-card': return 'bg-blue-100 text-blue-600'
      case 'wallet': return 'bg-amber-100 text-amber-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const handleAddAccountClick = () => {
    setEditingAccount(null)
    setFormData({ name: '', type: 'bank', balance: 0 })
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading accounts...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-1">Manage your financial accounts</p>
        </div>
        <button
          onClick={handleAddAccountClick}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm hover:shadow"
        >
          <Plus className="w-5 h-5" />
          <span>Add Account</span>
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-emerald-100 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Banknote className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts yet</h3>
          <p className="text-gray-600 mb-4">Add your first account to start tracking your finances</p>
          <button
            onClick={handleAddAccountClick}
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add your first account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const Icon = getIcon(account.type)
            const colorClass = getAccountColor(account.type)
            return (
              <div
                key={account.id}
                className="bg-white rounded-xl border border-emerald-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 capitalize">
                        {account.type.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(account)}
                      className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-emerald-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                
                <div className="border-t border-emerald-100 pt-4">
                  <div className="text-2xl font-bold text-gray-900">
                    ${account.balance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Current Balance</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="pb-2">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {editingAccount ? 'Edit Account' : 'Add New Account'}
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            {editingAccount ? 'Update your account details' : 'Add a new account to track'}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-black"
                placeholder="e.g., Chase Checking"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <select
                className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white text-black"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="bank">Bank Account</option>
                <option value="credit-card">Credit Card</option>
                <option value="wallet">Digital Wallet</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Balance
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-black"
                placeholder="0.00"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-emerald-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                {editingAccount ? 'Update Account' : 'Add Account'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}