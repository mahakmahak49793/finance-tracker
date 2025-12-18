// components/ui/Modal.tsx
'use client'

import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      
      {/* Dark overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative z-50 w-full max-w-lg bg-white rounded-xl border border-emerald-200 shadow-xl mt-20 animate-fade-in">
        <div className="absolute right-4 top-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 pt-10">
          {children}
        </div>
      </div>
    </div>
  )
}
