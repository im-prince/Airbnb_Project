import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAuth } from '../lib/useAuth'

export default function Forbidden() {
  const { signedIn } = useAuth()

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[520px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface-2)]">
        <Lock size={32} strokeWidth={1.5} className="text-[var(--ink-2)]" />
      </div>

      <p className="mono mt-6 text-sm font-medium tracking-wider text-[var(--muted)]">
        403
      </p>

      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        You don't have access to this
      </h1>

      <p className="mt-3 text-[15px] text-[var(--muted)]">
        {signedIn
          ? 'This area is for hotel managers. Your account is set up as a guest.'
          : 'Log in with a manager account to open this page.'}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="rounded-[var(--r-md)] bg-[var(--brand)] px-5 py-3 text-[15px] font-semibold text-[var(--on-brand)] no-underline transition-colors duration-150 hover:bg-[var(--brand-hover)]"
        >
          Back to home
        </Link>

        {!signedIn && (
          <Link
            to="/login"
            className="rounded-[var(--r-md)] border border-[var(--line)] px-5 py-3 text-[15px] font-semibold text-[var(--ink)] no-underline transition-colors duration-150 hover:bg-[var(--surface-2)]"
          >
            Log in
          </Link>
        )}
      </div>
    </div>
  )
}