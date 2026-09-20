import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import {
  getSavedGuests,
  createSavedGuest,
  updateSavedGuest,
  deleteSavedGuest,
  readError,
} from '../lib/api'
import Button from '../components/Button'
import Input from '../components/Input'
import { Skeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'

const emptyForm = { name: '', age: '', gender: 'MALE' }

export default function SavedGuests() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getSavedGuests()
        if (cancelled) return
        setGuests(data || [])
      } catch (err) {
        if (cancelled) return
        setError(readError(err, 'Could not load your saved guests.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  function openAddForm() {
    setForm({ id: null, ...emptyForm })
    setFormError('')
  }

  function openEditForm(guest) {
    setForm({ id: guest.id, name: guest.name, age: String(guest.age), gender: guest.gender })
    setFormError('')
  }

  function closeForm() {
    setForm(null)
    setFormError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.age) {
      setFormError('Name and age are required.')
      return
    }

    const payload = {
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
    }

    setSaving(true)
    setFormError('')

    try {
      if (form.id) {
        await updateSavedGuest(form.id, payload)
        setGuests((list) =>
          list.map((guest) => (guest.id === form.id ? { ...guest, ...payload } : guest))
        )
      } else {
        const created = await createSavedGuest(payload)
        setGuests((list) => [...list, created])
      }
      setForm(null)
    } catch (err) {
      setFormError(readError(err, 'Could not save this guest.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(guestId) {
    if (!window.confirm('Remove this saved guest?')) return

    setDeletingId(guestId)
    try {
      await deleteSavedGuest(guestId)
      setGuests((list) => list.filter((guest) => guest.id !== guestId))
    } catch (err) {
      setError(readError(err, 'Could not remove this guest.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-6 sm:px-6 sm:py-10">
      <Link to="/profile" className="text-sm text-[var(--muted)] no-underline hover:text-[var(--ink)]">
        ← Back to profile
      </Link>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">Saved travellers</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Add guests once, reuse them at checkout.
          </p>
        </div>
        {!form && (
          <Button onClick={openAddForm} className="shrink-0">
            <Plus size={16} className="mr-1 inline" /> Add guest
          </Button>
        )}
      </div>

      {form && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6"
        >
          <h2 className="m-0 text-base font-bold">{form.id ? 'Edit guest' : 'New guest'}</h2>

          <div className="mt-4 flex flex-col gap-4">
            <Input
              label="Full name"
              value={form.name}
              onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
              placeholder="Guest name"
            />

            <div className="flex gap-3">
              <div className="flex flex-1 flex-col">
                <label className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)]">
                  Age
                </label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={form.age}
                  onChange={(event) => setForm((f) => ({ ...f, age: event.target.value }))}
                  className="h-12 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface-2)] px-3.5 text-base text-[var(--ink)] outline-none transition-colors duration-150 focus:border-transparent focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--brand)] sm:text-[15px]"
                />
              </div>

              <div className="flex flex-1 flex-col">
                <label className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)]">
                  Gender
                </label>
                <select
                  value={form.gender}
                  onChange={(event) => setForm((f) => ({ ...f, gender: event.target.value }))}
                  className="h-12 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface-2)] px-3.5 text-base text-[var(--ink)] outline-none transition-colors duration-150 focus:border-transparent focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--brand)] sm:text-[15px]"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {formError && <p className="mt-3 text-[15px] text-[var(--danger)]">{formError}</p>}

          <div className="mt-5 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {loading && (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        )}

        {!loading && error && <p className="text-[15px] text-[var(--danger)]">{error}</p>}

        {!loading && !error && guests.length === 0 && !form && (
          <EmptyState
            icon={Users}
            title="No saved guests yet"
            message="Add a guest here and they'll be ready to pick at checkout."
          />
        )}

        {!loading &&
          !error &&
          guests.map((guest) => (
            <div
              key={guest.id}
              className="flex items-center justify-between gap-3 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-4"
            >
              <div className="min-w-0">
                <p className="m-0 truncate font-semibold text-[var(--ink)]">{guest.name}</p>
                <p className="mt-0.5 text-sm text-[var(--muted)]">
                  {guest.age} · {formatGender(guest.gender)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => openEditForm(guest)}
                  aria-label={`Edit ${guest.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-2)] transition-colors duration-150 hover:bg-[var(--surface-2)]"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(guest.id)}
                  disabled={deletingId === guest.id}
                  aria-label={`Remove ${guest.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--danger)] transition-colors duration-150 hover:bg-[var(--danger-soft)] disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

function formatGender(gender) {
  return gender.charAt(0) + gender.slice(1).toLowerCase()
}