import { useEffect, useState } from 'react'
import { getProfile, updateProfile, readError } from '../lib/api'
import { useAuth } from '../lib/useAuth'
import Button from '../components/Button'
import Input from '../components/Input'
import { Skeleton } from '../components/Skeleton'
import { Link } from 'react-router-dom'

export default function Profile() {
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ name: '', dateOfBirth: '', gender: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getProfile()
        if (cancelled) return
        setProfile(data)
        setForm({
          name: data.name || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
        })
      } catch (err) {
        if (cancelled) return
        setError(readError(err, 'Could not load your profile.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const dirty =
    profile &&
    (form.name !== (profile.name || '') ||
      form.dateOfBirth !== (profile.dateOfBirth || '') ||
      form.gender !== (profile.gender || ''))

  async function handleSave(event) {
    event.preventDefault()
    if (!dirty) return

    const changes = {}
    if (form.name !== (profile.name || '')) changes.name = form.name
    if (form.dateOfBirth !== (profile.dateOfBirth || '')) changes.dateOfBirth = form.dateOfBirth
    if (form.gender !== (profile.gender || '')) changes.gender = form.gender

    setSaving(true)
    setSaveError('')
    setSaved(false)

    try {
      await updateProfile(changes)
      const fresh = await getProfile()
      setProfile(fresh)
      setForm({
        name: fresh.name || '',
        dateOfBirth: fresh.dateOfBirth || '',
        gender: fresh.gender || '',
      })
      setSaved(true)
    } catch (err) {
      setSaveError(readError(err, 'Could not save your changes.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-6 sm:px-6 sm:py-10">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-6 h-80 w-full" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-16 text-center sm:px-6">
        <p className="m-0 text-[15px] text-[var(--ink-2)]">
          {error || 'Could not load your profile.'}
        </p>
      </div>
    )
  }

  const role = user?.roles?.[0] || 'GUEST'

  return (
    <div className="mx-auto max-w-[640px] px-4 py-6 sm:px-6 sm:py-10">
            <h1 className="m-0 text-2xl font-bold tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Manage your personal details.</p>

      <Link
        to="/guests"
        className="mt-4 inline-block text-sm font-semibold text-[var(--brand)] no-underline hover:underline"
      >
        Manage saved travellers →
      </Link>

      <form
        onSubmit={handleSave}
        className="mt-6 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="m-0 text-sm text-[var(--muted)]">Email</p>
            <p className="mt-0.5 text-[15px] font-medium text-[var(--ink)]">{profile.email}</p>
          </div>
          <span className="shrink-0 rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
            {formatRole(role)}
          </span>
        </div>

        <div className="my-4 border-t border-[var(--line)]" />

        <div className="flex flex-col gap-4">
          <Input
            label="Full name"
            value={form.name}
            onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
            placeholder="Your name"
          />

          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)]">
              Date of birth
            </label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(event) => setForm((f) => ({ ...f, dateOfBirth: event.target.value }))}
              className="h-12 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface-2)] px-3.5 text-base text-[var(--ink)] outline-none transition-colors duration-150 focus:border-transparent focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--brand)] sm:text-[15px]"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)]">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(event) => setForm((f) => ({ ...f, gender: event.target.value }))}
              className="h-12 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface-2)] px-3.5 text-base text-[var(--ink)] outline-none transition-colors duration-150 focus:border-transparent focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--brand)] sm:text-[15px]"
            >
              <option value="">Prefer not to say</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {saveError && <p className="mt-4 text-[15px] text-[var(--danger)]">{saveError}</p>}
        {saved && !saveError && <p className="mt-4 text-[15px] text-[var(--brand)]">Saved.</p>}

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={!dirty || saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function formatRole(role) {
  return role.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())
}