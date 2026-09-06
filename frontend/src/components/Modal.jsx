import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, footer, width = 480 }) {
  const boxRef = useRef(null)
  const openerRef = useRef(null)

  useEffect(() => {
    if (!open) return

    openerRef.current = document.activeElement
    document.body.style.overflow = 'hidden'
    boxRef.current?.focus()

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const targets = boxRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!targets || targets.length === 0) return

      const first = targets[0]
      const last = targets[targets.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      openerRef.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(43,20,40,0.45)] p-4 backdrop-blur-[4px]"
    >
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        style={{ maxWidth: width, animation: 'popIn 280ms cubic-bezier(.2,.8,.2,1)' }}
        className="w-full rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-6 outline-none"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="m-0 text-lg font-bold text-[var(--ink)]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-[var(--r-sm)] text-[var(--muted)] transition-colors duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="text-[15px] text-[var(--ink-2)]">{children}</div>

        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}