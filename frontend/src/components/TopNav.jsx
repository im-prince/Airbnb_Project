import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../lib/useAuth'
import ThemeToggle from './ThemeToggle'

export default function TopNav() {
  const { signedIn, user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSignOut() {
    setMenuOpen(false)
    signOut()
    navigate('/', { replace: true })
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  const initials = (user?.name || user?.email || '?').slice(0, 1).toUpperCase()
  const linkClass =
    'text-sm font-medium text-[var(--ink-2)] no-underline hover:text-[var(--ink)]'
  const mobileLinkClass =
    'block rounded-[var(--r-md)] px-3 py-2.5 text-[15px] font-medium text-[var(--ink)] no-underline hover:bg-[var(--surface-2)]'

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

        {/* Desktop links — hidden below 640px */}
        <NavLink to="/manager" className={`hidden sm:block ${linkClass}`}>
          Become a host
        </NavLink>

        {signedIn && (
          <NavLink to="/trips" className={`hidden sm:block ${linkClass}`}>
            My trips
          </NavLink>
        )}

        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {signedIn ? (
          <>
            <Link
              to="/profile"
              title={user?.name || user?.email}
              className="hidden h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand)] no-underline transition-opacity duration-150 hover:opacity-80 sm:flex"
            >
              {initials}
            </Link>
            <button
              onClick={handleSignOut}
              className={`hidden sm:block ${linkClass} transition-colors duration-150 hover:text-[var(--brand)]`}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={`hidden sm:block ${linkClass}`}>
              Log in
            </NavLink>
            <NavLink
              to="/signup"
              className="hidden rounded-[var(--r-md)] bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--on-brand)] no-underline transition-colors duration-150 hover:bg-[var(--brand-hover)] sm:block"
            >
              Sign up
            </NavLink>
          </>
        )}

        {/* Mobile: theme toggle always visible, then hamburger */}
        <div className="sm:hidden">
          <ThemeToggle />
        </div>
        <button
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--r-md)] text-[var(--ink-2)] hover:bg-[var(--surface-2)] sm:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="border-t border-[var(--line)] bg-[var(--surface)] px-4 py-3 sm:hidden">
          <NavLink to="/manager" onClick={closeMenu} className={mobileLinkClass}>
            Become a host
          </NavLink>

          {signedIn ? (
            <>
              <NavLink to="/trips" onClick={closeMenu} className={mobileLinkClass}>
                My trips
              </NavLink>
              <div className="my-2 border-t border-[var(--line)]" />
              <Link
                to="/profile"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-[var(--r-md)] px-3 py-2 no-underline hover:bg-[var(--surface-2)]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand)]">
                  {initials}
                </div>
                <span className="truncate text-sm text-[var(--ink-2)]">
                  {user?.name || user?.email}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full rounded-[var(--r-md)] px-3 py-2.5 text-left text-[15px] font-medium text-[var(--danger)] hover:bg-[var(--danger-soft)]"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={closeMenu} className={mobileLinkClass}>
                Log in
              </NavLink>
              <NavLink
                to="/signup"
                onClick={closeMenu}
                className="mt-1 block rounded-[var(--r-md)] bg-[var(--brand)] px-3 py-2.5 text-center text-[15px] font-semibold text-[var(--on-brand)] no-underline"
              >
                Sign up
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  )
}