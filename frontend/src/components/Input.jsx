import { useId } from 'react'

export default function Input({
  label,
  error = '',
  hint = '',
  type = 'text',
  className = '',
  ...rest
}) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error || hint

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)]"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={`h-12 rounded-[var(--r-md)] border px-3.5 text-[15px] text-[var(--ink)] outline-none transition-colors duration-150 placeholder:text-[var(--muted)] focus:border-transparent focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--brand)] disabled:cursor-not-allowed disabled:text-[var(--muted)] ${
          error
            ? 'border-[var(--danger)] bg-[var(--danger-soft)]'
            : 'border-[var(--line)] bg-[var(--surface-2)]'
        }`}
        {...rest}
      />

      <p
        id={messageId}
        className={`mt-1.5 min-h-5 text-[13px] ${
          error ? 'text-[var(--danger)]' : 'text-[var(--muted)]'
        }`}
      >
        {message}
      </p>
    </div>
  )
}