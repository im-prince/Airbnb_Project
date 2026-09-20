import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { createRoom, getRoomAdmin, updateRoom, readError } from '../lib/api'
import Input from '../components/Input'
import Button from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { managerRoutes } from '../lib/managerRoutes'

function emptyForm() {
  return {
    type: '',
    basePrice: '',
    capacity: '',
    totalCount: '',
    photos: [''],
    amenities: [''],
  }
}

export default function RoomForm() {
  const { hotelId, roomId } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(roomId)

  const [form, setForm] = useState(emptyForm())
  const [loading, setLoading] = useState(editing)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!editing) return
    let cancelled = false

    async function load() {
      try {
        const room = await getRoomAdmin(hotelId, roomId)
        if (cancelled) return
        setForm({
          type: room.type || '',
          basePrice: String(room.basePrice ?? ''),
          capacity: String(room.capacity ?? ''),
          totalCount: String(room.totalCount ?? ''),
          photos: room.photos?.length ? room.photos : [''],
          amenities: room.amenities?.length ? room.amenities : [''],
        })
      } catch (err) {
        if (cancelled) return
        setLoadError(readError(err, 'Could not load this room.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [editing, hotelId, roomId])

  function updateListItem(field, index, value) {
    setForm((f) => ({
      ...f,
      [field]: f[field].map((item, i) => (i === index ? value : item)),
    }))
  }

  function addListItem(field) {
    setForm((f) => ({ ...f, [field]: [...f[field], ''] }))
  }

  function removeListItem(field, index) {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.type.trim() || !form.basePrice || !form.capacity || !form.totalCount) {
      setSaveError('Room type, price, capacity, and room count are required.')
      return
    }

    const payload = {
      type: form.type.trim(),
      basePrice: Number(form.basePrice),
      capacity: Number(form.capacity),
      totalCount: Number(form.totalCount),
      photos: form.photos.map((url) => url.trim()).filter(Boolean),
      amenities: form.amenities.map((item) => item.trim()).filter(Boolean),
    }

    setSaving(true)
    setSaveError('')

    try {
      if (editing) {
        await updateRoom(hotelId, roomId, payload)
      } else {
        await createRoom(hotelId, payload)
      }
      navigate(managerRoutes.rooms(hotelId))
    } catch (err) {
      setSaveError(readError(err, 'Could not save this room.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[700px] px-4 py-6 sm:px-6 sm:py-10">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="mt-6 h-96 w-full" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-[700px] px-4 py-16 text-center sm:px-6">
        <p className="m-0 text-[15px] text-[var(--ink-2)]">{loadError}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[700px] px-4 py-6 sm:px-6 sm:py-10">
      <Link
        to={managerRoutes.rooms(hotelId)}
        className="text-sm text-[var(--muted)] no-underline hover:text-[var(--ink)]"
      >
        ← Back to rooms
      </Link>

      <h1 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
        {editing ? 'Edit room' : 'New room'}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-6 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Room type"
            value={form.type}
            onChange={(event) => setForm((f) => ({ ...f, type: event.target.value }))}
            placeholder="Deluxe Room"
          />

          <div className="flex flex-col gap-4 sm:flex-row">
            <Input
              label="Base price (₹ / night)"
              type="number"
              min={0}
              value={form.basePrice}
              onChange={(event) => setForm((f) => ({ ...f, basePrice: event.target.value }))}
              placeholder="4500"
              className="flex-1"
            />
            <Input
              label="Capacity (guests)"
              type="number"
              min={1}
              value={form.capacity}
              onChange={(event) => setForm((f) => ({ ...f, capacity: event.target.value }))}
              placeholder="2"
              className="flex-1"
            />
            <Input
              label="Total rooms of this type"
              type="number"
              min={1}
              value={form.totalCount}
              onChange={(event) => setForm((f) => ({ ...f, totalCount: event.target.value }))}
              placeholder="5"
              className="flex-1"
            />
          </div>
        </div>

        <ListField
          label="Photos (image URLs)"
          items={form.photos}
          onChange={(index, value) => updateListItem('photos', index, value)}
          onAdd={() => addListItem('photos')}
          onRemove={(index) => removeListItem('photos', index)}
          placeholder="https://..."
        />

        <ListField
          label="Amenities"
          items={form.amenities}
          onChange={(index, value) => updateListItem('amenities', index, value)}
          onAdd={() => addListItem('amenities')}
          onRemove={(index) => removeListItem('amenities', index)}
          placeholder="AC"
        />

        {saveError && <p className="text-[15px] text-[var(--danger)]">{saveError}</p>}

          <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create room'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function ListField({ label, items, onChange, onAdd, onRemove, placeholder }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)]">
        {label}
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(event) => onChange(index, event.target.value)}
              placeholder={placeholder}
              className="h-12 flex-1 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface-2)] px-3.5 text-base text-[var(--ink)] outline-none focus:border-transparent focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--brand)] sm:text-[15px]"
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                aria-label="Remove"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--r-sm)] text-[var(--muted)] transition-colors duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--danger)]"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
      <Button type="button" variant="ghost" onClick={onAdd} className="mt-2">
        <Plus size={16} />
        Add {label.toLowerCase().includes('photo') ? 'photo' : 'item'}
      </Button>
    </div>
  )
}