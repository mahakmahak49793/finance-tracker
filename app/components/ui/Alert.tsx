// app/components/ui/Alert.tsx
'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

interface AlertProps {
  type: AlertType
  title: string
  message: string
  onClose?: () => void
  autoClose?: boolean
  duration?: number
}

export function Alert({
  type,
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onClose])

  if (!isVisible) return null

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          text: 'text-emerald-800',
          icon: <CheckCircle className="w-5 h-5 text-emerald-600" />
        }
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: <XCircle className="w-5 h-5 text-red-600" />
        }
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-800',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />
        }
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: <Info className="w-5 h-5 text-blue-600" />
        }
    }
  }

  const styles = getAlertStyles()

  return (
    <div className={`${styles.bg} border rounded-xl p-4 mb-4 animate-slideDown`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {styles.icon}
          </div>
          <div>
            <h4 className={`font-medium ${styles.text}`}>{title}</h4>
            <p className={`text-sm mt-1 ${styles.text}`}>{message}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false)
              onClose()
            }}
            className={`p-1 hover:opacity-70 transition-opacity ${styles.text}`}
            aria-label="Close alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Add this to your global CSS for animation
// @keyframes slideDown {
//   from {
//     transform: translateY(-20px);
//     opacity: 0;
//   }
//   to {
//     transform: translateY(0);
//     opacity: 1;
//   }
// }
// .animate-slideDown {
//   animation: slideDown 0.3s ease-out;
// }