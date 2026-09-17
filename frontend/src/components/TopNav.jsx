import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import ThemeToggle from './ThemeToggle'

export default function TopNav() {
  const { signedIn, user, signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/', { replace: true })
  }

  const initials = (user?.name || user?.email || '?').slice(0, 1).toUpperCase()

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface)]">
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-6">
        <Link
          to="/"
          className="text-[19px] font-extrabold tracking-tight text-[var(--ink)] no-underline"
        >
          nestay<span className="text-[var(--brand)]">.</span>
        </Link>

        <div className="flex-1" />

        {signedIn ? (
          <>
            <NavLink
              to="/manager"
              className="hidden text-sm font-medium text-[var(--ink-2)] no-underline hover:text-[var(--ink)] sm:block"
            >
              Become a host
            </NavLink>

            <NavLink
              to="/trips"
              className="text-sm font-medium text-[var(--ink-2)] no-underline hover:text-[var(--ink)]"
            >
              My trips
            </NavLink>

            <ThemeToggle />

            <div
              title={user?.name || user?.email}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand)]"
            >
              {initials}
            </div>

            <button
              onClick={handleSignOut}
              className="text-sm font-medium text-[var(--ink-2)] transition-colors duration-150 hover:text-[var(--brand)]"
            >
              Log out
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </nav>
    </header>
  )
}