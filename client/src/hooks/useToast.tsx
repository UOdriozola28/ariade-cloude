import { useCallback, useState } from "react"
import type { ToastsType } from "../types"

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastsType>([])

  const show = useCallback((message: string, type = 'success') => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return {
    toasts,
    showToast: show
  }
}

