import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../lib/useTheme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="flex h-9 w-9 items-center justify-center rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] transition-colors duration-150 hover:bg-[var(--surface-2)]"
    >
      {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  )
}