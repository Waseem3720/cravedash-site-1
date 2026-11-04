import { useEffect } from 'react'
import Icon from './Icon'
import { useBodyLock } from '../../hooks/useUiEffects'

/**
 * Base modal — the same `.modal` / `.modal__box` markup the original site uses.
 */
export default function Modal({ open, label, onClose, children, className = '', hideClose = false }) {
  useBodyLock(open)

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={`modal is-open ${className}`.trim()}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal__box">
        {!hideClose && (
          <button className="modal__close" type="button" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
