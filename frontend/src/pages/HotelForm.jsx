import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { createHotel, getHotelAdmin, updateHotel, readError } from '../lib/api'
import Input from '../components/Input'
import Button from '../components/Button'
import { Skeleton } from '../components/Skeleton'

function emptyForm() {
  return {
    name: '',
    city: '',
    photos: [''],
    amenities: [''],
    contactInfo: { address: '', phoneNumber: '', email: '', location: '' },
  }
}

export default function HotelForm() {
  const { hotelId } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(hotelId)

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
        const hotel = await getHotelAdmin(hotelId)
        if (cancelled) return
        setForm({
          name: hotel.name || '',
          city: hotel.city || '',
          active: hotel.active,
          photos: hotel.photos?.length ? hotel.photos : [''],
          amenities: hotel.amenities?.length ? hotel.amenities : [''],
          contactInfo: {
            address: hotel.contactInfo?.address || '',
            phoneNumber: hotel.contactInfo?.phoneNumber || '',
            email: hotel.contactInfo?.email || '',
            location: hotel.contactInfo?.location || '',
          },
        })
      } catch (err) {
        if (cancelled) return
        setLoadError(readError(err, 'Could not load this hotel.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [editing, hotelId])

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

  function updateContact(field, value) {
    setForm((f) => ({ ...f, contactInfo: { ...f.contactInfo, [field]: value } }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.name.trim() || !form.city.trim()) {
      setSaveError('Name and city are required.')
      return
    }

    const payload = {
      name: form.name.trim(),
      city: form.city.trim(),
      photos: form.photos.map((url) => url.trim()).filter(Boolean),
      amenities: form.amenities.map((item) => item.trim()).filter(Boolean),
      contactInfo: {
        address: form.contactInfo.address.trim(),
        phoneNumber: form.contactInfo.phoneNumber.trim(),
        email: form.contactInfo.email.trim(),
        location: form.contactInfo.location.trim(),
      },
    }

    if (editing) {
      payload.active = form.active
    }

    setSaving(true)
    setSaveError('')

    try {
      if (editing) {
        await updateHotel(hotelId, payload)
      } else {
        await createHotel(payload)
      }
      navigate('/manager')
    } catch (err) {
      setSaveError(readError(err, 'Could not save this hotel.'))
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
      <Link to="/manager" className="text-sm text-[var(--muted)] no-underline hover:text-[var(--ink)]">
        ← Back to your hotels
      </Link>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create hotel'}
          </Button>
        </div>
      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-6 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Hotel name"
            value={form.name}
            onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
            placeholder="Sunset Resort"
          />
          <Input
            label="City"
            value={form.city}
            onChange={(event) => setForm((f) => ({ ...f, city: event.target.value }))}
            placeholder="Goa"
          />
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
          placeholder="WiFi"
        />

        <div>
          <h2 className="m-0 text-base font-bold">Contact info</h2>
          <div className="mt-3 flex flex-col gap-4">
            <Input
              label="Address"
              value={form.contactInfo.address}
              onChange={(event) => updateContact('address', event.target.value)}
              placeholder="Beach Road, Calangute"
            />
            <div className="flex flex-col gap-4 sm:flex-row">
              <Input
                label="Phone number"
                value={form.contactInfo.phoneNumber}
                onChange={(event) => updateContact('phoneNumber', event.target.value)}
                placeholder="9876543210"
                className="flex-1"
              />
              <Input
                label="Email"
                type="email"
                value={form.contactInfo.email}
                onChange={(event) => updateContact('email', event.target.value)}
                placeholder="contact@hotel.com"
                className="flex-1"
              />
            </div>
            <Input
              label="Location (map link or coordinates)"
              value={form.contactInfo.location}
              onChange={(event) => updateContact('location', event.target.value)}
              placeholder="15.5449,73.7554"
            />
          </div>
        </div>

        {saveError && <p className="text-[15px] text-[var(--danger)]">{saveError}</p>}

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create hotel'}
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