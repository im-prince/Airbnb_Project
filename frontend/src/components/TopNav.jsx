import { Link, NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface)]">
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-6">
        <Link
          to="/"
          className="text-[19px] font-extrabold tracking-tight text-[var(--brand)] no-underline"
        >
          nestay<span className="text-[var(--accent)]">.</span>
        </Link>

        <div className="flex-1" />

        <NavLink
          to="/manager"
          className="hidden text-sm font-medium text-[var(--ink-2)] no-underline hover:text-[var(--ink)] sm:block"
        >
          Become a host
        </NavLink>

        <ThemeToggle />

        <NavLink
          to="/login"
          className="text-sm font-medium text-[var(--ink-2)] no-underline hover:text-[var(--ink)]"
        >
          Log in
        </NavLink>

        <NavLink
          to="/signup"
          className="rounded-[var(--r-md)] bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--on-brand)] no-underline transition-colors duration-150 hover:bg-[var(--brand-hover)]"
        >
          Sign up
        </NavLink>
      </nav>
    </header>
  )
}