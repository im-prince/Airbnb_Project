export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon && (
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-soft)]">
          <Icon size={32} className="text-[var(--brand)]" strokeWidth={1.5} />
        </div>
      )}

      <h2 className="m-0 text-lg font-bold text-[var(--ink)]">{title}</h2>

      {message && (
        <p className="mt-2 max-w-[360px] text-[15px] text-[var(--muted)]">{message}</p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}