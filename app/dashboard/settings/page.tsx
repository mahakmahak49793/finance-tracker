'use client'

import { useState, useEffect } from 'react'
import { FiUser, FiLock, FiSave } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface UserProfile {
  name: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/me')
        if (response.ok) {
          const data = await response.json()
          setProfile(prev => ({
            ...prev,
            name: data.user.name || '',
            email: data.user.email || ''
          }))
        } else {
          showErrorAlert('Failed to load user data')
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        showErrorAlert('Failed to load user data')
      }
    }

    fetchUserData()
  }, [])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!profile.name.trim()) {
      showErrorAlert('Please enter your name')
      return
    }
    
    if (!profile.email.trim()) {
      showErrorAlert('Please enter your email')
      return
    }
    
    setSaving(true)
    setMessage({ type: '', text: '' })
    
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      // Show success notification
      Swal.fire({
        title: 'Success!',
        text: 'Profile updated successfully!',
        icon: 'success',
        confirmButtonColor: '#059669', // emerald-600
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true,
      })
      
      setMessage({ 
        type: 'success', 
        text: 'Profile updated successfully!' 
      })
      
    } catch (error: any) {
      console.error('Error updating profile:', error)
      showErrorAlert(error.message || 'Error updating profile')
      setMessage({ 
        type: 'error', 
        text: error.message || 'Error updating profile' 
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!profile.currentPassword) {
      showErrorAlert('Current password is required')
      return
    }
    
    if (profile.newPassword !== profile.confirmPassword) {
      showErrorAlert('New passwords do not match')
      return
    }
    
    if (profile.newPassword.length < 6) {
      showErrorAlert('Password must be at least 6 characters')
      return
    }
    
    // Confirmation dialog for password change
    const result = await Swal.fire({
      title: 'Change Password?',
      text: 'Are you sure you want to change your password?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669', // emerald-600
      cancelButtonColor: '#dc2626', // red-600
      confirmButtonText: 'Yes, change it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    })

    if (!result.isConfirmed) {
      return
    }
    
    setSaving(true)
    setMessage({ type: '', text: '' })
    
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: profile.currentPassword,
          newPassword: profile.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password')
      }

      // Show success notification
      Swal.fire({
        title: 'Success!',
        text: 'Password changed successfully!',
        icon: 'success',
        confirmButtonColor: '#059669', // emerald-600
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true,
      })
      
      setMessage({ 
        type: 'success', 
        text: 'Password changed successfully!' 
      })
      
      // Clear password fields
      setProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
      
    } catch (error: any) {
      console.error('Error changing password:', error)
      showErrorAlert(error.message || 'Error changing password')
      setMessage({ 
        type: 'error', 
        text: error.message || 'Error changing password' 
      })
    } finally {
      setSaving(false)
    }
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

  const showSuccessAlert = (message: string) => {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#059669', // emerald-600
      confirmButtonText: 'OK',
      timer: 2000,
      timerProgressBar: true,
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-800 border border-red-200' 
            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl border border-emerald-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <FiUser className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-black"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-black"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <FiSave className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="bg-white rounded-xl border border-emerald-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <FiLock className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-black"
                value={profile.currentPassword}
                onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-black"
                value={profile.newPassword}
                onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-black"
                value={profile.confirmPassword}
                onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={saving || !profile.currentPassword || !profile.newPassword || !profile.confirmPassword}
              className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <FiLock className="w-5 h-5" />
              <span>{saving ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}