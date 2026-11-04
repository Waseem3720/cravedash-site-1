import { useToast } from '../../context/ToastContext'

export default function ToastHost() {
  const { toasts, dismiss } = useToast()
  if (!toasts.length) return null

  return (
    <div className="pp-toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className={`pp-toast pp-toast--${toast.tone}`}
          onClick={() => dismiss(toast.id)}
        >
          {toast.message}
        </button>
      ))}
    </div>
  )
}
