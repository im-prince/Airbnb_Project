import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { readError } from '../lib/api'
import { useAuth } from '../lib/useAuth'
import Input from '../components/Input'
import Button from '../components/Button'

export default function Login() {
  const navigate = useNavigate()
    const { signIn } = useAuth()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (busy) return

    setError('')
    setBusy(true)
    try {
            await signIn({ email, password })
      navigate(next, { replace: true })
    } catch (err) {
      setError(readError(err, 'Could not log you in. Check your email and password.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <div className="relative hidden flex-1 overflow-hidden bg-[#0B1B33] lg:block">
        <div className="absolute -right-20 -top-16 h-80 w-80 rounded-full bg-[#132844]" />
        <div className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-[#F0492B] opacity-[0.18]" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <div className="text-[19px] font-extrabold tracking-tight text-white">
            nestay<span className="text-[#F0492B]">.</span>
          </div>
          <p className="mt-4 max-w-[340px] text-2xl font-bold leading-snug text-white">
            Pick up where you left off.
          </p>
          <p className="mt-3 max-w-[340px] text-[15px] text-[#B4C0D0]">
            Your trips, your bookings, all in one place.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-[380px]">
          <h1 className="m-0 text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-[15px] text-[var(--muted)]">
            Log in to manage your bookings.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-[var(--r-md)] border border-[var(--danger)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
            >
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" size="lg" loading={busy} className="mt-2 w-full">
            {busy ? 'Logging in' : 'Log in'}
          </Button>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-[var(--brand)] no-underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}