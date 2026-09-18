import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[520px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-soft)]">
        <Compass size={34} strokeWidth={1.5} className="text-[var(--brand)]" />
      </div>

      <p className="mono mt-6 text-sm font-medium tracking-wider text-[var(--muted)]">
        404
      </p>

      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        This page went wandering
      </h1>

      <p className="mt-3 text-[15px] text-[var(--muted)]">
        The link may be broken, or the page may have moved. Let's get you back
        to something that exists.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="rounded-[var(--r-md)] bg-[var(--brand)] px-5 py-3 text-[15px] font-semibold text-[var(--on-brand)] no-underline transition-colors duration-150 hover:bg-[var(--brand-hover)]"
        >
          Back to home
        </Link>

        <Link
          to="/search?city=Jaipur"
          className="rounded-[var(--r-md)] border border-[var(--line)] px-5 py-3 text-[15px] font-semibold text-[var(--ink)] no-underline transition-colors duration-150 hover:bg-[var(--surface-2)]"
        >
          Browse stays
        </Link>
      </div>
    </div>
  )
}