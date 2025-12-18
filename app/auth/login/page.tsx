// app/auth/login/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TrendingUp } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const data = await response.json()
        setError(data.error || 'Login failed')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-md">
        {/* Form */}
        <div className="bg-white rounded-xl border border-emerald-100 p-8 shadow">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Link href="/" className="flex items-center justify-center gap-3 mb-4 no-underline">
    <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center">
      <TrendingUp className="w-5 h-5 text-white" />
    </div>
    <h1 className="text-2xl font-bold text-emerald-800">FinTrack</h1>
  </Link>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Sign In
              </h2>
              <p className="mt-2 text-gray-600">
                Welcome back to your finances
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-black"
                placeholder="john@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-black"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-800 text-white py-3 rounded-lg font-medium hover:bg-emerald-900 transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-emerald-100 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                href="/auth/register" 
                className="font-medium text-emerald-600 hover:text-emerald-700"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 flex justify-center gap-6">
          <div className="text-sm text-gray-500">✓ Free forever</div>
          <div className="text-sm text-gray-500">✓ No credit card</div>
        </div>
      </div>
    </div>
  )
}