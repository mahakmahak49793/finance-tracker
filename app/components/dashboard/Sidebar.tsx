// components/dashboard/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  FiHome,
  FiCreditCard,
  FiFolder,
  FiTrendingUp,

  FiSettings,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: FiHome },
  { name: 'Accounts', href: '/dashboard/accounts', icon: FiCreditCard },
  { name: 'Transactions', href: '/dashboard/transactions', icon: FiFolder },
  { name: 'Categories', href: '/dashboard/categories', icon: FiTrendingUp },
  { name: 'Settings', href: '/dashboard/settings', icon: FiSettings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
   <button
  onClick={() => setIsOpen(!isOpen)}
  className="md:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-800 text-white rounded-lg shadow-lg"
>
  {isOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
</button>

      {/* Sidebar */}
      <aside className={`
        fixed md:static top-0 left-0 z-40 w-64 h-screen bg-white border-r border-emerald-100
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-[90vh] flex flex-col gap-20 p-4">
         
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1  mt-16 md:mt-0">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-medium'
                      : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
          
          {/* Logout */}
          <div className="mt-auto pt-4 border-t border-emerald-100">
            <button className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg w-full transition-colors">
              <FiLogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}