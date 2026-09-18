import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useToast } from '../lib/useToast'

const looks = {
  info: { Icon: Info, color: 'var(--ink-2)' },
  success: { Icon: CheckCircle2, color: 'var(--success)' },
  error: { Icon: AlertCircle, color: 'var(--danger)' },
}

export default function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-32px)] max-w-[360px] flex-col gap-2"
    >
      {toasts.map((item) => {
        const { Icon, color } = looks[item.kind] || looks.info

        return (
          <div
            key={item.id}
            style={{
              borderLeftColor: color,
              animation: 'fadeUp 240ms cubic-bezier(.2,.8,.2,1)',
            }}
            className="pointer-events-auto flex items-start gap-3 rounded-[var(--r-md)] border border-[var(--line)] border-l-4 bg-[var(--surface)] p-3 shadow-[var(--shadow-2)]"
          >
            <Icon size={18} style={{ color }} className="mt-0.5 shrink-0" />

            <p className="m-0 flex-1 text-sm text-[var(--ink)]">{item.message}</p>

            <button
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss"
              className="shrink-0 rounded-[var(--r-sm)] p-0.5 text-[var(--muted)] transition-colors duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}