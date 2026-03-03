import type { ToastsType } from "../../types"

interface Props {
  toasts: ToastsType
}

export const Toasts = ({ toasts }: Props) => {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' ? '✓' : '✕'} {t.message}
        </div>
      ))}
    </div>
  )
}
