import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let nextId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((item) => item.id !== id))
  }, [])

  const show = useCallback(
    (message, kind = 'info') => {
      const id = nextId++
      setToasts((list) => [...list.slice(-2), { id, message, kind }])
      setTimeout(() => dismiss(id), 5000)
      return id
    },
    [dismiss]
  )

  const toast = {
    info: (message) => show(message, 'info'),
    success: (message) => show(message, 'success'),
    error: (message) => show(message, 'error'),
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const value = useContext(ToastContext)
  if (!value) {
    throw new Error('useToast must be used inside ToastProvider')
  }
  return value
}