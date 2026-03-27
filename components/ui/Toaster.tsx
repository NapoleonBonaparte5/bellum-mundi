'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — TOAST NOTIFICATION SYSTEM
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, createContext, useContext, useCallback } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3200)
  }, [])

  // Expose globally for non-React contexts
  useEffect(() => {
    ;(window as any).__bellumToast = showToast
  }, [showToast])

  const borderColor = {
    success: 'border-l-emerald-light',
    error: 'border-l-crimson-light',
    info: 'border-l-gold',
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div
        id="toast-container"
        className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-2"
        role="region"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`bg-slate border border-gold/30 border-l-4 ${borderColor[toast.type]} px-5 py-3 font-cinzel text-[0.6rem] tracking-[0.15em] text-cream animate-fade-in max-w-sm`}
            role="alert"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Global helper for non-React code
export function showToast(message: string, type: Toast['type'] = 'info') {
  ;(window as any).__bellumToast?.(message, type)
}
