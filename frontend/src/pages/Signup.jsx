import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { readError } from '../lib/api'
import { useAuth } from '../lib/useAuth'
import Input from '../components/Input'
import Button from '../components/Button'

export default function Signup() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const passwordTooShort = password.length > 0 && password.length < 8

  async function submit(event) {
    event.preventDefault()
    if (busy) return

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setError('')
    setBusy(true)
    try {
      await register({ name, email, password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(readError(err, 'Could not create your account. Try a different email.'))
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
            Book your first stay in minutes.
          </p>
          <p className="mt-3 max-w-[340px] text-[15px] text-[#B4C0D0]">
            Free to join. No card needed until you book.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-[380px]">
          <h1 className="m-0 text-3xl font-bold">Create an account</h1>
          <p className="mt-2 text-[15px] text-[var(--muted)]">
            It takes about thirty seconds.
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
              label="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Prince Kumar"
              autoComplete="name"
              required
            />

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
              autoComplete="new-password"
              hint="At least 8 characters"
              error={passwordTooShort ? 'Password must be at least 8 characters.' : ''}
              required
            />
          </div>

          <Button type="submit" size="lg" loading={busy} className="mt-2 w-full">
            {busy ? 'Creating account' : 'Create account'}
          </Button>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[var(--brand)] no-underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}