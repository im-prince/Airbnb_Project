import { Loader2 } from 'lucide-react'

const looks = {
  primary: 'bg-[var(--brand)] text-[var(--on-brand)] hover:bg-[var(--brand-hover)]',
  secondary: 'border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-2)]',
  ghost: 'text-[var(--brand)] hover:bg-[var(--brand-soft)]',
  danger: 'border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger-soft)]',
}

const sizes = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-11 px-4 text-[15px]',
  lg: 'h-[52px] px-6 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) {
  const off = disabled || loading

  return (
    <button
      type={type}
      disabled={off}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--r-md)] font-semibold no-underline transition-colors duration-150 disabled:cursor-not-allowed disabled:border-transparent disabled:bg-[var(--surface-2)] disabled:text-[var(--muted)] ${looks[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}